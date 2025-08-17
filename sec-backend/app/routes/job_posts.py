from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Application, JobPost, User
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import shutil
import os
from datetime import datetime
from fastapi import Request
from fastapi import Query
from sqlalchemy import extract, func
from app.models import CompanyInfo
from app import models, schemas
from typing import List
from sqlalchemy.orm import joinedload

router = APIRouter()

UPLOAD_DIR = "static/logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ------------------ TẠO MỚI BÀI ĐĂNG ------------------
@router.post("/job-posts", response_model=schemas.JobPostResponse)
def create_job_post(
    # Thay vì nhận từng Form, nhận một đối tượng JSON duy nhất
    # khớp với schema JobPostCreate
    post_data: schemas.JobPostCreate,
    db: Session = Depends(get_db)
):
    # Dữ liệu từ frontend giờ nằm trong post_data, ví dụ: post_data.title
    
    # Logic kiểm tra company và logo
    company = db.query(models.CompanyInfo).filter(models.CompanyInfo.employer_id == post_data.employer_id).first()
    if not company or not company.logo_filename:
        raise HTTPException(status_code=400, detail="Vui lòng cập nhật đầy đủ thông tin và logo công ty trước khi đăng bài.")

    # Tạo đối tượng JobPost mới từ dữ liệu đã được validate
    job_post = models.JobPost(
        **post_data.dict(), # Lấy tất cả dữ liệu từ schema
        logo_url=f"/static/company/{company.logo_filename}",
        status="pending"
    )
    
    db.add(job_post)
    db.commit()
    db.refresh(job_post)
    
    # Trả về đối tượng đã tạo, khớp với response_model
    return job_post

# ------------------ CẬP NHẬT BÀI ĐĂNG ------------------
@router.put("/job-posts/{job_id}", response_model=schemas.JobPostResponse)
def update_job_post(
    job_id: int,
    # Sử dụng schema JobPostUpdate
    post_data: schemas.JobPostUpdate,
    db: Session = Depends(get_db)
):
    post = db.query(models.JobPost).filter(models.JobPost.id == job_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài đăng")

    # Lấy dữ liệu từ Pydantic model và loại bỏ các giá trị None
    update_data = post_data.dict(exclude_unset=True)

    # Cập nhật các trường trong đối tượng post
    for key, value in update_data.items():
        setattr(post, key, value)
    
    # Luôn reset status về pending khi có cập nhật
    post.status = "pending"
    
    db.commit()
    db.refresh(post)
    
    return post


@router.options("/job-posts")
def preflight_job_posts():
    return {"message": "OK"}

# === THAY THẾ HÀM CŨ BẰNG HÀM MỚI NÀY ===
@router.get("/job-posts", response_model=List[schemas.JobPostPublicList])
def get_approved_job_posts(db: Session = Depends(get_db)):
    """
    Lấy danh sách các bài đăng đã được duyệt.
    Sử dụng joinedload để tối ưu hóa, giảm số lượng query.
    Sử dụng Pydantic response_model để tự động validate và serialize dữ liệu.
    """
    posts = db.query(models.JobPost).options(
        joinedload(models.JobPost.employer).joinedload(models.User.company_info),
        joinedload(models.JobPost.location)
    ).filter(models.JobPost.status == "approved").order_by(models.JobPost.created_at.desc()).all()

    # Pydantic sẽ tự động xử lý việc chuyển đổi từ model SQLAlchemy sang JSON
    # và chỉ lấy các trường đã được định nghĩa trong schemas.JobPostPublicList.
    # Frontend sẽ nhận được đầy đủ các trường cần thiết, bao gồm cả 'career_id'.
    return posts

@router.get("/job-posts/{job_id}", response_model=schemas.JobPostResponse)
def get_job_post_details(job_id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết của một bài đăng duy nhất bằng ID.
    Sử dụng joinedload để lấy kèm thông tin của công ty và ngành nghề.
    """
    # Query để lấy JobPost và load kèm các mối quan hệ
    job = db.query(models.JobPost).options(
        # Load thông tin user (employer) và từ đó load tiếp company_info
        joinedload(models.JobPost.employer).joinedload(models.User.company_info),
        # Load thông tin ngành nghề (career)
        joinedload(models.JobPost.career),
        joinedload(models.JobPost.location)
    ).filter(models.JobPost.id == job_id, models.JobPost.status == "approved").first()

    # Kiểm tra xem có tìm thấy job không
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy công việc hoặc công việc chưa được duyệt")
    
    # Trả về job, Pydantic sẽ tự động serialize
    return job


@router.get("/my-job-posts/{email}")
def get_my_job_posts(email: str, db: Session = Depends(get_db)):
    posts = db.query(JobPost).filter(JobPost.employer_email == email).all()
    result = []

    for post in posts:
        # Tìm thông tin người đăng
        user = db.query(User).filter(User.email == post.employer_email).first()

        # Lấy logo từ CompanyInfo theo employer_id
        logo_url = None
        if post.employer_id:
            company = db.query(CompanyInfo).filter(CompanyInfo.employer_id == post.employer_id).first()
            if company and company.logo_filename:
                logo_url = f"http://localhost:8000/static/company/{company.logo_filename}"

        result.append({
            "id": post.id,
            "title": post.title,
            "position": post.position,
            "description": post.description,
            "company_intro": post.company_intro,
            "requirements": post.requirements,
            "benefits": post.benefits,
            "how_to_apply": post.how_to_apply,
            "created_at": post.created_at,
            "logo_url": logo_url,
            "poster_name": user.name if user else "Ẩn danh",
            "employer_email": post.employer_email,
            "deadline": post.deadline.isoformat() if post.deadline else None,
            "status": post.status
        })

    return result

@router.delete("/job-posts/{post_id}")
def delete_job_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(JobPost).filter(JobPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài đăng không tồn tại")

    db.delete(post)
    db.commit()
    return {"message": "Xoá bài đăng thành công"}


@router.get("/applications/{employer_email}")
def get_applications_for_employer(employer_email: str, db: Session = Depends(get_db)):
    # Lấy các bài đăng của employer
    jobs = db.query(JobPost).filter(JobPost.employer_email == employer_email).all()
    job_ids = [job.id for job in jobs]

    # Lấy danh sách ứng viên ứng tuyển vào các job_id
    applications = db.query(Application).filter(Application.job_id.in_(job_ids)).all()

    result = []
    for app in applications:
        job = db.query(JobPost).filter(JobPost.id == app.job_id).first()
        result.append({
            "id": app.id,
            "full_name": app.full_name,
            "email": app.email,
            "gender": app.gender,
            "birth_year": app.birth_year,
            "preferred_location": app.preferred_location,
            "experience_fields": app.experience_fields,
            "experience_places": app.experience_places,
            "certificates": app.certificates,
            "cover_letter": app.cover_letter,
            "cv_filename": app.cv_filename,
            "job_title": job.title if job else "",
            "applied_at": app.applied_at
        })


    return result

# trong file job_posts.py
from typing import List # Đảm bảo bạn đã import List từ typing

# ...

@router.post("/apply")
async def submit_application(
    request: Request,
    full_name: str = Form(...),
    gender: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    birth_year: int = Form(...),
    preferred_location: str = Form(...),
    job_id: int = Form(...),
    experience_fields: List[str] = Form(...), # Nhận vào là một danh sách
    experience_places: str = Form(...),
    certificates: str = Form(...),
    cover_letter: str = Form(...),
    cv: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Lưu file
    upload_dir = "static/cvs" # Sửa lại tên thư mục cho đúng
    os.makedirs(upload_dir, exist_ok=True)
    
    # Tạo tên file duy nhất để tránh ghi đè
    unique_filename = f"{datetime.now().timestamp()}_{cv.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(cv.file, f)

    # ==========================================================
    # SỬA LỖI Ở ĐÂY
    # ==========================================================
    # 1. Chuyển đổi danh sách thành một chuỗi duy nhất
    experience_fields_str = ",".join(experience_fields)

    # 2. Tạo đối tượng Application với dữ liệu đã được chuyển đổi
    from app.models import Application
    application = Application(
        full_name=full_name,
        gender=gender,
        email=email,
        phone=phone,
        birth_year=birth_year,
        preferred_location=preferred_location,
        job_id=job_id,
        experience_fields=experience_fields_str, # <-- Sử dụng chuỗi đã join
        experience_places=experience_places,
        certificates=certificates,
        cover_letter=cover_letter,
        cv_filename=unique_filename, # <-- Lưu tên file duy nhất
    )
    # ==========================================================
    
    db.add(application)
    db.commit()
    db.refresh(application)

    return {"message": "Ứng tuyển thành công"}

@router.get("/admin/stats/users")
def admin_user_stats(db: Session = Depends(get_db)):
    job_seekers = db.query(User).filter(User.role == "jobseeker").count()
    employers = db.query(User).filter(User.role == "employer").count()
    admins = db.query(User).filter(User.role == "admin").count()
    return {
        "job_seekers": job_seekers,
        "employers": employers,
        "admins": admins
    }


@router.get("/admin/stats/job-posts")
def admin_job_post_stats(db: Session = Depends(get_db)):
    total_posts = db.query(JobPost).count()
    return {"total_posts": total_posts}

@router.get("/admin/stats/applications")
def admin_applications_stats(db: Session = Depends(get_db)):
    total_applications = db.query(Application).count()
    return {"total_applications": total_applications}

@router.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    job_seekers = db.query(User).filter(User.role == "jobseeker").count()
    employers = db.query(User).filter(User.role == "employer").count()
    admins = db.query(User).filter(User.role == "admin").count()
    total_posts = db.query(JobPost).count()
    total_applications = db.query(Application).count()

    return {
        "jobSeekers": job_seekers,
        "employers": employers,
        "admins": admins,
        "jobPosts": total_posts,
        "applications": total_applications
    }

@router.put("/admin/job-posts/{post_id}/approve")
def approve_job_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(JobPost).filter(JobPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài đăng không tồn tại")
    post.status = "approved"
    db.commit()
    return {"message": "Bài đăng đã được duyệt"}

@router.put("/admin/job-posts/{post_id}/reject")
def reject_job_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(JobPost).filter(JobPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài đăng không tồn tại")
    post.status = "rejected"
    db.commit()
    return {"message": "Bài đăng đã bị từ chối"}

@router.put("/admin/job-status/{post_id}")
def update_job_status(post_id: int, status: str, db: Session = Depends(get_db)):
    post = db.query(JobPost).filter(JobPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài đăng không tồn tại")

    if status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")

    post.status = status
    db.commit()
    db.refresh(post)
    return {"message": f"Cập nhật trạng thái bài đăng {post_id} thành {status} thành công."}

@router.get("/admin/pending-jobs")
def get_pending_jobs(db: Session = Depends(get_db)):
    posts = db.query(JobPost).options(
        joinedload(JobPost.career),
        joinedload(JobPost.location)  # Tải kèm dữ liệu từ bảng 'careers'
    ).filter(JobPost.status == "pending").order_by(JobPost.created_at.desc()).all()
    return [
        {
            "id": post.id,
            "title": post.title,
            "position": post.position,
            "company_intro": post.company_intro,
            "description": post.description,
            "requirements": post.requirements,
            "benefits": post.benefits,
            "how_to_apply": post.how_to_apply,
            "deadline": post.deadline.isoformat() if post.deadline else "",
            "employer_email": post.employer_email,
            "career_name": post.career.name if post.career else "Chưa phân loại",
            "location_name": post.location.name if post.location else "Chưa có"
        }
        for post in posts
    ]



@router.get("/admin/monthly-stats")
def monthly_stats(year: int = Query(default=datetime.now().year), db: Session = Depends(get_db)):
    # Thống kê người tìm việc
    seekers = db.query(
        extract('month', User.created_at).label('month'),
        func.count(User.id)
    ).filter(
        User.role == "jobseeker",
        extract('year', User.created_at) == year
    ).group_by('month').all()

    # Thống kê nhà tuyển dụng
    employers = db.query(
        extract('month', User.created_at).label('month'),
        func.count(User.id)
    ).filter(
        User.role == "employer",
        extract('year', User.created_at) == year
    ).group_by('month').all()

    # Thống kê bài đăng
    posts = db.query(
        extract('month', JobPost.created_at).label('month'),
        func.count(JobPost.id)
    ).filter(
        extract('year', JobPost.created_at) == year
    ).group_by('month').all()

    # Thống kê hồ sơ ứng tuyển
    applications = db.query(
        extract('month', Application.applied_at).label('month'),
        func.count(Application.id)
    ).filter(
        extract('year', Application.applied_at) == year
    ).group_by('month').all()

    def to_month_dict(data):
        result = {month: count for month, count in data}
        # Đảm bảo đủ 12 tháng
        return [result.get(m, 0) for m in range(1, 13)]

    return {
        "seekers": to_month_dict(seekers),
        "employers": to_month_dict(employers),
        "posts": to_month_dict(posts),
        "applications": to_month_dict(applications)
    }