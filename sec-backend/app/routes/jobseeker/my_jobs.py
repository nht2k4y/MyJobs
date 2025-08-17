# app/routes/jobseeker/my_jobs.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.db import get_db
from app.auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/api/jobseeker",
    tags=["My Jobs"]
)

# === API Endpoint cho Việc làm đã ứng tuyển ===
@router.get("/applied-jobs", response_model=List[schemas.AppliedJobResponse])
def get_applied_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    applications = db.query(models.Application).options(
        # Tải sẵn dữ liệu liên quan để tối ưu
        joinedload(models.Application.job).joinedload(models.JobPost.employer).joinedload(models.User.company_info),
        joinedload(models.Application.job).joinedload(models.JobPost.location)
    ).filter(
        models.Application.email == current_user.email
    ).order_by(models.Application.applied_at.desc()).all()

    response_data = []
    for app in applications:
        job = app.job
        
        # === SỬA LOGIC Ở ĐÂY ===
        if job:
            # Nếu công việc còn tồn tại, lấy thông tin bình thường
            company_info = job.employer.company_info if job.employer and job.employer.company_info else None
            response_data.append({
                "job_id": job.id,
                "title": job.title,
                "company_name": company_info.company_name if company_info else job.poster_name,
                "logo_url": f"/static/company/{company_info.logo_filename}" if company_info and company_info.logo_filename else None,
                "location": job.location,
                "salary": getattr(job, 'salary', None), # An toàn hơn nếu job không có salary
                "application_date": app.applied_at,
                "status": "Đã gửi" # Trạng thái mặc định
            })
        else:
            # Nếu công việc đã bị xóa, trả về thông tin mặc định
            response_data.append({
                "job_id": app.job_id or app.id, # Dùng job_id cũ hoặc app.id để làm key
                "title": "Công việc đã bị xóa hoặc không còn tồn tại",
                "company_name": "Không xác định",
                "logo_url": None,
                "location": None,
                "salary": "N/A",
                "application_date": app.applied_at,
                "status": "Đã kết thúc"
            })
        
    return response_data

# === API Endpoint cho Việc làm đã lưu ===
@router.get("/saved-jobs", response_model=List[schemas.SavedJobResponse])
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    saved_jobs = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).options(
        joinedload(models.SavedJob.job_post).joinedload(models.JobPost.employer).joinedload(models.User.company_info),
        joinedload(models.SavedJob.job_post).joinedload(models.JobPost.location)
    ).order_by(models.SavedJob.saved_at.desc()).all()

    response_data = []
    for saved in saved_jobs:
        job = saved.job_post
        if not job: continue

        company_info = job.employer.company_info if job.employer and job.employer.company_info else None

        response_data.append({
            "job_id": job.id,
            "title": job.title,
            "company_name": company_info.company_name if company_info else job.poster_name,
            "logo_url": f"/static/company/{company_info.logo_filename}" if company_info and company_info.logo_filename else None,
            "location": job.location,
            "salary": job.salary,
            "saved_date": saved.saved_at
        })

    return response_data