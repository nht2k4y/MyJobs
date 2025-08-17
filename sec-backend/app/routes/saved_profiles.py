# sec-backend/app/routes/saved_profiles.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import get_db
from typing import List

router = APIRouter()

# --- API ĐỂ LƯU MỘT HỒ SƠ ---
@router.post("/save-profile", status_code=201)
def save_profile(
    employer_id: int, 
    application_id: int, 
    db: Session = Depends(get_db)
):
    # Kiểm tra xem hồ sơ và nhà tuyển dụng có tồn tại không
    employer = db.query(models.User).filter(models.User.id == employer_id).first()
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not employer or not application:
        raise HTTPException(status_code=404, detail="Employer or Application not found")

    # Kiểm tra xem hồ sơ này đã được lưu bởi nhà tuyển dụng này chưa
    existing_save = db.query(models.SavedProfile).filter(
        models.SavedProfile.employer_id == employer_id,
        models.SavedProfile.application_id == application_id
    ).first()

    if existing_save:
        raise HTTPException(status_code=400, detail="Profile already saved")

    # Tạo bản ghi mới
    new_saved_profile = models.SavedProfile(
        employer_id=employer_id,
        application_id=application_id
    )
    db.add(new_saved_profile)
    db.commit()
    return {"message": "Profile saved successfully"}


# --- API ĐỂ LẤY DANH SÁCH HỒ SƠ ĐÃ LƯU CỦA MỘT NHÀ TUYỂN DỤNG ---
@router.get("/saved-profiles/{employer_id}")
def get_saved_profiles(employer_id: int, db: Session = Depends(get_db)):
    # Lấy tất cả các application_id mà employer này đã lưu
    saved_app_ids = db.query(models.SavedProfile.application_id).filter(models.SavedProfile.employer_id == employer_id).all()
    
    # Chuyển đổi kết quả thành một danh sách các ID
    list_of_ids = [item[0] for item in saved_app_ids]

    # Lấy toàn bộ thông tin của các hồ sơ ứng tuyển từ danh sách ID đó
    if not list_of_ids:
        return []

    saved_applications = db.query(models.Application).filter(models.Application.id.in_(list_of_ids)).all()
    
    # (Tùy chọn) Thêm job_title vào response
    result = []
    for app in saved_applications:
        job = db.query(models.JobPost).filter(models.JobPost.id == app.job_id).first()
        app_data = app.__dict__
        app_data['job_title'] = job.title if job else "N/A"
        result.append(app_data)
        
    return result