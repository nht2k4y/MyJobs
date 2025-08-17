# sec-backend/app/routes/ai.py (PHIÊN BẢN NÂNG CẤP CUỐI CÙNG)

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
import os
import joblib
import numpy as np
import re
from sqlalchemy import or_ 
from .. import models 
from ..db import get_db
from .. import intent_classifier # Giữ lại bộ phân loại ý định
from .. import ai_knowledge_loader

# === KHỞI TẠO ROUTER VÀ MODELS DỮ LIỆU ===
router = APIRouter(prefix="/ai", tags=["AI Suggestions"])
class ResumePayload(BaseModel):
    resume_text: str

# === TẢI MÔ HÌNH MACHINE LEARNING ===
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELS_DIR = os.path.join(PROJECT_ROOT, "app", "models")
vectorizer = joblib.load(os.path.join(MODELS_DIR, "vectorizer.pkl"))
model = joblib.load(os.path.join(MODELS_DIR, "matcher_model.pkl"))

# ==========================================================
# === CÁC HÀM LOGIC CỦA AI ===
# ==========================================================

def extract_job_title(text: str) -> str | None:
    """
    Trích xuất từ khóa ngành nghề bằng cách tìm trong Cơ sở Tri thức đã tải.
    """
    text = text.lower().strip()
    
    # Sử dụng danh sách từ khóa đã được sắp xếp từ dài đến ngắn
    for keyword in ai_knowledge_loader.KNOWLEDGE_KEYWORDS:
        if keyword in text:
            return keyword # Trả về ngay từ khóa dài nhất tìm thấy đầu tiên
            
    return None

### HÀM 1: DÙNG ML ĐỂ TÌM VIỆC (GIỮ NGUYÊN) ###
def find_jobs_with_ml(db: Session, resume_text: str, top_n: int = 3):
    # (Hàm này giữ nguyên, không thay đổi)
    try:
        resume_vec = vectorizer.transform([resume_text])
        probabilities = model.predict_proba(resume_vec)[0]
        top_indices = np.argsort(probabilities)[::-1][:top_n]
        predicted_titles = model.classes_[top_indices]

        if not predicted_titles.any() or probabilities[top_indices[0]] < 0.1:
            return {"message": "AI không nhận diện được ngành nghề cụ thể từ CV của bạn. Vui lòng cung cấp thêm thông tin chi tiết."}
    except Exception as e:
        print(f"Lỗi khi xử lý AI: {e}")
        return {"error": "Lỗi trong quá trình phân tích của AI."}

    try:
        query = db.query(models.JobPost).options(
            joinedload(models.JobPost.employer).joinedload(models.User.company_info)
        )
        matched_jobs = query.filter(
            models.JobPost.title.in_(predicted_titles),
            models.JobPost.status == 'approved' 
        ).all()
        
        if not matched_jobs:
            return {"message": f"AI gợi ý bạn phù hợp với: {', '.join(predicted_titles)}. Tuy nhiên, hiện chưa có công việc nào được duyệt thuộc ngành này."}
            
        suggestions = []
        for job in matched_jobs:
            company_name = job.poster_name
            suggestions.append({
                "jobId": job.id, "jobTitle": job.title, "companyName": company_name,
                "posterName": job.employer.name if job.employer else "N/A",
                "location": job.location.name if job.location else "N/A",
            })
        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Lỗi khi truy vấn CSDL: {e}")
        return {"error": "Đã xảy ra lỗi khi tìm kiếm công việc."}

### HÀM 2: TƯ VẤN KIẾN THỨC VÀ CHỦ ĐỘNG TÌM VIỆC (NÂNG CẤP) ###
def get_knowledge_and_jobs(db: Session, job_title_query: str):
    
    # === BƯỚC 1: TÌM VIỆC TRỰC TIẾP BẰNG TỪ KHÓA ĐÃ TRÍCH XUẤT ===
    try:
        matched_jobs = db.query(models.JobPost).options(
            joinedload(models.JobPost.employer).joinedload(models.User.company_info),
            joinedload(models.JobPost.location)
        ).filter(
            models.JobPost.title.ilike(f"%{job_title_query}%"), # Chỉ cần dòng này
            models.JobPost.status == 'approved'
        ).all()
        
        suggestions = [] # ... code tạo suggestions ...
        for job in matched_jobs:
            suggestions.append({
                "jobId": job.id, "jobTitle": job.title, "companyName": job.poster_name,
                "posterName": job.employer.name if job.employer else "N/A",
                "location": job.location.name if job.location else "N/A",
            })
    except Exception as e:
        print(f"Lỗi khi tìm việc: {e}")
        return {"error": "Đã xảy ra lỗi khi tìm kiếm công việc."}

    # === BƯỚC 2: LẤY THÔNG TIN KỸ NĂNG (NẾU CÓ) ===
    knowledge_entry = db.query(models.AIJobKnowledge).filter(
        # Tìm kiến thức cho từ khóa gốc
        models.AIJobKnowledge.job_title.ilike(f"%{job_title_query}%") 
    ).first()
    
    knowledge_text = None
    if knowledge_entry:
        skills_list = [skill.strip() for skill in knowledge_entry.required_skills.split(',')]
        knowledge_text = f"Để ứng tuyển các vị trí về {knowledge_entry.job_title}, bạn nên có các kỹ năng cốt lõi sau:\n- " + "\n- ".join(skills_list)

    return {
        "knowledge_text": knowledge_text,
        "suggestions": suggestions
    }

# ==========================================================
# === ENDPOINT CHÍNH (BỘ NÃO PHÂN LOẠI Ý ĐỊNH) - CẬP NHẬT NHỎ ===
# ==========================================================
@router.post("/suggest")
async def suggest_jobs_endpoint(payload: ResumePayload, db: Session = Depends(get_db)):
    user_input = payload.resume_text.strip()

    if not user_input:
        raise HTTPException(status_code=400, detail="Nội dung không được để trống.")

    # --- LOGIC MỚI: TRÍCH XUẤT TRƯỚC, SUY LUẬN SAU ---

    # 1. Ưu tiên kiểm tra CV dài
    if len(user_input) > 200:
        return find_jobs_with_ml(db, payload.resume_text)

    # 2. Thử trích xuất từ khóa ngành nghề trước tiên
    job_keyword = extract_job_title(user_input)
    
    intent = None
    if job_keyword:
        # Nếu trích xuất thành công, TỰ ĐỘNG SUY RA ý định là tìm việc
        print(f"Đã trích xuất từ khóa '{job_keyword}', suy ra ý định tìm việc.")
        intent = "tim_viec_theo_ten"
    else:
        # Nếu không trích xuất được, mới dùng đến bộ phân loại ý định PhoBERT
        intent, score = intent_classifier.classify_intent(user_input)
        print(f"Không trích xuất được từ khóa. Phân loại ý định: {intent} (score: {score:.2f})")

    # 3. Xử lý logic dựa trên ý định đã được xác định
    if intent == "chao_hoi":
        return {"message": "Xin chào! Tôi là Trợ lý AI Tuyển dụng. Tôi có thể giúp gì cho bạn?"}

    if intent == "tim_viec_theo_ten":
        # Nếu job_keyword đã được trích xuất ở trên, dùng nó luôn
        # Nếu không, thử trích xuất lại phòng trường hợp PhoBERT đoán đúng nhưng trích xuất ban đầu sai
        query = job_keyword if job_keyword else extract_job_title(user_input)
        
        if not query:
             return {"message": "Tôi hiểu bạn muốn tìm việc, nhưng chưa rõ vị trí cụ thể. Bạn có thể nói rõ hơn, ví dụ: 'tìm việc lập trình viên'?"}
        
        return get_knowledge_and_jobs(db, query)

    if intent == "hoi_ky_nang":
        query = extract_job_title(user_input)
        if not query:
             return {"message": "Tôi hiểu bạn muốn hỏi về kỹ năng, nhưng chưa rõ cho vị trí nào?"}
        
        return get_knowledge_and_jobs(db, query)
        
    # Xử lý các trường hợp còn lại (out_of_scope, khong_hieu...)
    return {"message": "Tôi có thể giúp bạn tìm việc bằng cách phân tích CV, hoặc trả lời các câu hỏi về kỹ năng cần thiết cho một vị trí. Bạn cần tôi giúp gì cụ thể hơn?"}