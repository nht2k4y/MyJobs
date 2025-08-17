# app/routes/jobseeker/dashboard.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app import models
from app.db import get_db
from app.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/jobseeker",
    tags=["Job Seeker Dashboard"]
)

def calculate_profile_completeness(profile: models.JobSeekerProfile) -> int:
    if not profile: return 0
    total_fields = 10
    filled_fields = 0
    if profile.desired_position: filled_fields += 1
    if profile.desired_level: filled_fields += 1
    if profile.experience_years: filled_fields += 1
    if profile.min_salary and profile.max_salary: filled_fields += 1
    if profile.career_id: filled_fields += 1
    if profile.location_id: filled_fields += 1
    if profile.work_experiences: filled_fields += 1
    if profile.educations: filled_fields += 1
    if profile.technical_skills: filled_fields += 1
    if profile.uploaded_cvs: filled_fields += 1
    return int((filled_fields / total_fields) * 100)

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = db.query(models.JobSeekerProfile).filter(models.JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.JobSeekerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # === BẮT ĐẦU TRUY VẤN DỮ LIỆU THẬT ===
    
    # 1. Số việc đã ứng tuyển: Dựa vào email của user trong bảng Application
    applied_jobs_count = db.query(models.Application).filter(models.Application.email == current_user.email).count()
    
    # Các mục này cần có model tương ứng, tạm thời giữ là 0
    saved_jobs_count = 0
    profile_views_count = 0
    followed_employers_count = 0

    # 2. Dữ liệu biểu đồ: Thống kê số lượng hồ sơ đã nộp theo tháng trong 12 tháng qua
    today = datetime.utcnow()
    one_year_ago = today - timedelta(days=365)
    
    monthly_applications = db.query(
        extract('year', models.Application.applied_at).label('year'),
        extract('month', models.Application.applied_at).label('month'),
        func.count(models.Application.id).label('count')
    ).filter(
        models.Application.email == current_user.email,
        models.Application.applied_at >= one_year_ago
    ).group_by('year', 'month').order_by('year', 'month').all()

    # Tạo dictionary để dễ truy cập
    app_data_map = {(d.year, d.month): d.count for d in monthly_applications}
    
    chart_data = []
    for i in range(12):
        month_date = today - timedelta(days=i*30)
        year, month = month_date.year, month_date.month
        
        # Tránh trùng lặp tháng
        if not any(d['label'] == f"T{month}-{year}" for d in chart_data):
            count = app_data_map.get((year, month), 0)
            chart_data.append({
                "label": f"T{month}-{year}",
                "applied": count,
                "saved": 0, # Tạm thời
                "followed": 0 # Tạm thời
            })
    chart_data.reverse() # Sắp xếp từ quá khứ đến hiện tại

    # === Chuẩn bị dữ liệu trả về ===
    dashboard_data = {
        "user": {
            "name": current_user.name,
            "is_verified": True,
            # THÊM MỚI: Trả về avatar_url
            "avatar_url": current_user.avatar_url 
        },
        "stats": {
            "applied_jobs_count": applied_jobs_count,
            "saved_jobs_count": saved_jobs_count,
            "profile_views_count": profile_views_count,
            "followed_employers_count": followed_employers_count
        },
        "profile_completeness": calculate_profile_completeness(profile),
        "activity_chart_data": chart_data,
        "cv_summary": {
            "last_updated": profile.updated_at.isoformat(),
            "is_searchable": False # Bạn cần thêm trường này vào model JobSeekerProfile
        },
        "suggested_jobs": []
    }
    
    return dashboard_data