# app/routes/jobseeker_profiles.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload, selectinload
from app import models, schemas
from app.db import get_db
from app.auth import get_current_user
import shutil
import os
from datetime import datetime
from fastapi import Form
from typing import List

router = APIRouter(
    prefix="/jobseeker-profiles",
    tags=["Job Seeker Profiles"]
)

UPLOADED_CV_FOLDER = "static/uploaded_cvs/"
os.makedirs(UPLOADED_CV_FOLDER, exist_ok=True)

# === HÀM HỖ TRỢ: Lấy hồ sơ của user hiện tại, tránh lặp code ===
def get_user_profile(db: Session, user_id: int) -> models.JobSeekerProfile:
    """
    Lấy đối tượng profile từ DB dựa trên user_id.
    Ném ra lỗi 404 nếu không tìm thấy.
    """
    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ của người dùng.")
    return profile

# =======================================================
# === API CHÍNH CHO HỒ SƠ (PROFILE) ===
# =======================================================

@router.get("/me", response_model=schemas.JobSeekerProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Lấy toàn bộ thông tin hồ sơ của người dùng đang đăng nhập, bao gồm tất cả các chi tiết.
    """
    profile = db.query(models.JobSeekerProfile).options(
        selectinload(models.JobSeekerProfile.work_experiences),
        selectinload(models.JobSeekerProfile.educations),
        selectinload(models.JobSeekerProfile.certificates),
        selectinload(models.JobSeekerProfile.language_skills),
        selectinload(models.JobSeekerProfile.technical_skills),
        joinedload(models.JobSeekerProfile.career),
        joinedload(models.JobSeekerProfile.location),
        joinedload(models.JobSeekerProfile.user)
    ).filter(models.JobSeekerProfile.user_id == current_user.id).first()
    
    if not profile:
        new_profile = models.JobSeekerProfile(user_id=current_user.id)
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        # Gán lại thông tin user để response có đủ dữ liệu
        new_profile.user = current_user
        return new_profile
    
    # === THÊM BƯỚC KIỂM TRA VÀ REFRESH ===
    # Đảm bảo rằng đối tượng user đã được load và chứa tất cả thông tin mới nhất
    if profile.user:
        db.refresh(profile.user)
        
    return profile

@router.post("/me", response_model=schemas.JobSeekerProfileResponse)
def update_my_profile_info(
    profile_update: schemas.JobSeekerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Cập nhật các thông tin chung của hồ sơ (không bao gồm file upload).
    """
    profile = get_user_profile(db, current_user.id)
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    profile.updated_at = datetime.now()
    db.commit()
    db.refresh(profile)
    return profile



# =======================================================
# === API CRUD CHO KINH NGHIỆM LÀM VIỆC ===
# =======================================================

@router.post("/me/work-experiences", response_model=schemas.WorkExperience, status_code=201)
def add_work_experience(experience: schemas.WorkExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = models.WorkExperience(**experience.dict(), profile_id=profile.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/me/work-experiences/{item_id}", response_model=schemas.WorkExperience)
def update_work_experience(item_id: int, experience_update: schemas.WorkExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.WorkExperience).filter(models.WorkExperience.id == item_id, models.WorkExperience.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy kinh nghiệm làm việc.")
    for key, value in experience_update.dict().items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/me/work-experiences/{item_id}", status_code=204)
def delete_work_experience(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.WorkExperience).filter(models.WorkExperience.id == item_id, models.WorkExperience.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy kinh nghiệm làm việc.")
    db.delete(db_item)
    db.commit()

# =======================================================
# === API CRUD CHO HỌC VẤN (EDUCATION) ===
# =======================================================

@router.post("/me/educations", response_model=schemas.Education, status_code=201)
def add_education(education: schemas.EducationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = models.Education(**education.dict(), profile_id=profile.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/me/educations/{item_id}", response_model=schemas.Education)
def update_education(item_id: int, education_update: schemas.EducationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.Education).filter(models.Education.id == item_id, models.Education.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy thông tin học vấn.")
    for key, value in education_update.dict().items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/me/educations/{item_id}", status_code=204)
def delete_education(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.Education).filter(models.Education.id == item_id, models.Education.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy thông tin học vấn.")
    db.delete(db_item)
    db.commit()

# =======================================================
# === API CRUD CHO CHỨNG CHỈ (CERTIFICATE) ===
# =======================================================

@router.post("/me/certificates", response_model=schemas.Certificate, status_code=201)
def add_certificate(certificate: schemas.CertificateCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = models.Certificate(**certificate.dict(), profile_id=profile.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/me/certificates/{item_id}", response_model=schemas.Certificate)
def update_certificate(item_id: int, certificate_update: schemas.CertificateCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.Certificate).filter(models.Certificate.id == item_id, models.Certificate.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy chứng chỉ.")
    for key, value in certificate_update.dict().items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/me/certificates/{item_id}", status_code=204)
def delete_certificate(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.Certificate).filter(models.Certificate.id == item_id, models.Certificate.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy chứng chỉ.")
    db.delete(db_item)
    db.commit()

# =======================================================
# === API CRUD CHO KỸ NĂNG NGÔN NGỮ (LANGUAGE SKILL) ===
# =======================================================

@router.post("/me/language-skills", response_model=schemas.LanguageSkill, status_code=201)
def add_language_skill(language_skill: schemas.LanguageSkillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = models.LanguageSkill(**language_skill.dict(), profile_id=profile.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/me/language-skills/{item_id}", response_model=schemas.LanguageSkill)
def update_language_skill(item_id: int, language_skill_update: schemas.LanguageSkillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.LanguageSkill).filter(models.LanguageSkill.id == item_id, models.LanguageSkill.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy kỹ năng ngôn ngữ.")
    for key, value in language_skill_update.dict().items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/me/language-skills/{item_id}", status_code=204)
def delete_language_skill(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.LanguageSkill).filter(models.LanguageSkill.id == item_id, models.LanguageSkill.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy kỹ năng ngôn ngữ.")
    db.delete(db_item)
    db.commit()

# ==========================================================
# === API CRUD CHO KỸ NĂNG CHUYÊN MÔN (TECHNICAL SKILL) ===
# ==========================================================

@router.post("/me/technical-skills", response_model=schemas.TechnicalSkill, status_code=201)
def add_technical_skill(technical_skill: schemas.TechnicalSkillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = models.TechnicalSkill(**technical_skill.dict(), profile_id=profile.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/me/technical-skills/{item_id}", response_model=schemas.TechnicalSkill)
def update_technical_skill(item_id: int, technical_skill_update: schemas.TechnicalSkillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.TechnicalSkill).filter(models.TechnicalSkill.id == item_id, models.TechnicalSkill.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy kỹ năng chuyên môn.")
    for key, value in technical_skill_update.dict().items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/me/technical-skills/{item_id}", status_code=204)
def delete_technical_skill(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = get_user_profile(db, current_user.id)
    db_item = db.query(models.TechnicalSkill).filter(models.TechnicalSkill.id == item_id, models.TechnicalSkill.profile_id == profile.id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Không tìm thấy kỹ năng chuyên môn.")
    db.delete(db_item)
    db.commit()

@router.post("/me/upload-cv-with-info", response_model=schemas.UploadedCV, status_code=201)
def upload_cv_with_info(
    # Dùng Form(...) để nhận các trường text cùng với file
    desired_position: str = Form(...),
    desired_level: str = Form(...),
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = get_user_profile(db, current_user.id)
    
    # Xử lý lưu file
    unique_filename = f"{profile.id}_{int(datetime.now().timestamp())}_{cv_file.filename}"
    file_path = os.path.join(UPLOADED_CV_FOLDER, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(cv_file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Không thể lưu file CV.")

    # Tạo bản ghi mới trong DB
    db_cv = models.UploadedCV(
        profile_id=profile.id,
        cv_filename=unique_filename,
        desired_position=desired_position,
        desired_level=desired_level
    )
    
    db.add(db_cv)
    db.commit()
    db.refresh(db_cv)
    
    return db_cv

@router.post("/me/uploaded-cvs", response_model=schemas.UploadedCV, status_code=201)
def upload_a_cv(
    desired_position: str = Form(...),
    desired_level: str = Form(...),
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Tên hàm đã đổi từ upload_cv_with_info để tránh nhầm lẫn, logic giữ nguyên.
    """
    profile = get_user_profile(db, current_user.id)
    
    unique_filename = f"{profile.id}_{int(datetime.now().timestamp())}_{cv_file.filename}"
    file_path = os.path.join(UPLOADED_CV_FOLDER, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(cv_file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Không thể lưu file CV.")

    db_cv = models.UploadedCV(
        profile_id=profile.id,
        cv_filename=unique_filename,
        desired_position=desired_position,
        desired_level=desired_level
    )
    
    db.add(db_cv)
    db.commit()
    db.refresh(db_cv)
    return db_cv

@router.delete("/me/uploaded-cvs/{cv_id}", status_code=204)
def delete_uploaded_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    API để xóa một hồ sơ đã được tải lên.
    """
    profile = get_user_profile(db, current_user.id)
    
    # Tìm CV cần xóa, đảm bảo nó thuộc về user hiện tại
    db_cv = db.query(models.UploadedCV).filter(
        models.UploadedCV.id == cv_id,
        models.UploadedCV.profile_id == profile.id
    ).first()

    if not db_cv:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ đính kèm.")
    
    # Xóa file vật lý khỏi server
    file_path = os.path.join(UPLOADED_CV_FOLDER, db_cv.cv_filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Xóa bản ghi trong database
    db.delete(db_cv)
    db.commit()