# app/routes/company.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload # <-- Import thêm joinedload
from app import models, schemas
from app.db import get_db
import shutil
import os
from datetime import datetime
from typing import Optional # <-- Import thêm Optional

router = APIRouter(prefix="/company", tags=["Company"])

UPLOAD_FOLDER = "static/company/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------------- Gộp: tạo/cập nhật + upload logo + cover ----------------------
@router.post("/full-submit/", response_model=schemas.CompanyInfoResponse)
async def full_submit_company_info(
    # Các trường Form giữ nguyên, chỉ thay đổi industry thành career_id
    employer_id: int = Form(...),
    company_name: str = Form(...),
    # THÊM career_id VÀO ĐÂY, nó có thể là chuỗi rỗng
    career_id: Optional[int] = Form(None), 
    location_id: Optional[int] = Form(None),# <-- THAY ĐỔI 1: Thêm career_id
    tax_code: str = Form(None),
    # industry: str = Form(None), # <-- XÓA DÒNG NÀY
    size: str = Form(None),
    founded_date: Optional[str] = Form(None), # Nên dùng Optional cho các trường có thể null
    website: str = Form(None),
    facebook: str = Form(None),
    linkedin: str = Form(None),
    youtube: str = Form(None),
    email: str = Form(None),
    city: str = Form(None),
    district: str = Form(None),
    address: str = Form(None),
    latitude: str = Form(None),
    longitude: str = Form(None),
    description: str = Form(None),
    logo_file: UploadFile = File(None),
    cover_file: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    # Tìm thông tin công ty hiện có
    company = db.query(models.CompanyInfo).filter(models.CompanyInfo.employer_id == employer_id).first()

    logo_filename = None
    cover_filename = None
    now = datetime.utcnow().timestamp()

    # Upload logo
    if logo_file:
        logo_filename = f"logo_{int(now)}_{logo_file.filename}"
        with open(os.path.join(UPLOAD_FOLDER, logo_filename), "wb") as buffer:
            shutil.copyfileobj(logo_file.file, buffer)

    # Upload cover
    if cover_file:
        cover_filename = f"cover_{int(now)}_{cover_file.filename}"
        with open(os.path.join(UPLOAD_FOLDER, cover_filename), "wb") as buffer:
            shutil.copyfileobj(cover_file.file, buffer)

    # Dữ liệu chung
    data_to_update = {
        "company_name": company_name,
        "tax_code": tax_code,
        "career_id": career_id,
        "location_id": location_id, 
        "size": size,
        "founded_date": founded_date if founded_date else None, # Xử lý ngày tháng
        "website": website, "facebook": facebook, "linkedin": linkedin, "youtube": youtube,
        "email": email, "city": city, "district": district, "address": address,
        "latitude": latitude, "longitude": longitude, "description": description,
    }

    if logo_filename:
        data_to_update["logo_filename"] = logo_filename
    if cover_filename:
        data_to_update["cover_filename"] = cover_filename

    try:
        if company:
            # Cập nhật thông tin công ty hiện có
            for key, val in data_to_update.items():
                if val is not None: # Chỉ cập nhật những trường được gửi lên
                    setattr(company, key, val)
            db.commit()
            db.refresh(company)
            return company
        else:
            # Tạo mới thông tin công ty
            new_company = models.CompanyInfo(**data_to_update, employer_id=employer_id)
            db.add(new_company)
            db.commit()
            db.refresh(new_company)
            return new_company
    except Exception as e:
        db.rollback()
        # In lỗi ra console để debug
        print(f"Lỗi khi lưu thông tin công ty: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi server nội bộ: {e}")


# ---------------------- API: Lấy thông tin công ty ----------------------
@router.get("/{employer_id}", response_model=schemas.CompanyInfoResponse)
def get_company_info(employer_id: int, db: Session = Depends(get_db)):
    # THAY ĐỔI 3: Sử dụng joinedload để lấy luôn thông tin ngành nghề
    company = db.query(models.CompanyInfo).options(
        joinedload(models.CompanyInfo.career),
        joinedload(models.CompanyInfo.location)
    ).filter(models.CompanyInfo.employer_id == employer_id).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin công ty")
    return company