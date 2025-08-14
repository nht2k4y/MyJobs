# app/routes/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
# === CẬP NHẬT 1: Import thêm models và schemas ===
from app import models, schemas
from app.db import get_db
from app.auth import get_current_user # <-- QUAN TRỌNG
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date # Thêm date
from passlib.context import CryptContext
import shutil
import os
from fastapi import UploadFile, File

router = APIRouter(
    # === CẬP NHẬT 2: Thêm prefix và tag cho tất cả các API trong file này ===
    prefix="/users",
    tags=["Users"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

AVATAR_UPLOAD_FOLDER = "static/avatars/"
os.makedirs(AVATAR_UPLOAD_FOLDER, exist_ok=True)

# ========================
# SCHEMAS (Đã chuyển sang file app/schemas.py, có thể xóa đi)
# Dưới đây tôi định nghĩa lại schema cần thiết cho API mới
# ========================
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime
    class Config: from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None

# Schema mới cho việc cập nhật thông tin cá nhân
class PersonalInfoUpdate(BaseModel):
    name: str
    phone_number: str
    date_of_birth: date
    gender: str
    marital_status: str
    location_id: int
    address: str

# ========================
# API CHO ADMIN (giữ nguyên, chỉ đổi đường dẫn)
# ========================

@router.get("/admin/all", response_model=List[UserOut]) # Đường dẫn mới: /users/admin/all
def get_all_users_for_admin(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.post("/admin/create", response_model=UserOut) # Đường dẫn mới: /users/admin/create
def create_user_by_admin(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=pwd_context.hash(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/admin/{user_id}", response_model=UserOut) # Đường dẫn mới: /users/admin/{user_id}
def update_user_by_admin(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    if user.name: db_user.name = user.name
    if user.email: db_user.email = user.email
    if user.role: db_user.role = user.role
    if user.password: db_user.password_hash = pwd_context.hash(user.password)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/admin/{user_id}") # Đường dẫn mới: /users/admin/{user_id}
def delete_user_by_admin(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")
    db.delete(user)
    db.commit()
    return {"message": "Xoá user thành công"}

# ==========================================================
# === THÊM MỚI: API CẬP NHẬT THÔNG TIN CÁ NHÂN CHO USER ===
# ==========================================================

@router.post("/me/update-personal-info", response_model=schemas.JobSeekerProfileResponse) # <== SỬA 1: Đổi response_model
def update_my_personal_info(
    update_data: schemas.PersonalInfoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    API để người dùng đang đăng nhập tự cập nhật thông tin cá nhân.
    Sau khi cập nhật, API sẽ truy vấn lại toàn bộ hồ sơ và trả về.
    """
    user_to_update = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

    profile_to_update = user_to_update.job_seeker_profile
    if not profile_to_update:
        profile_to_update = models.JobSeekerProfile(user_id=current_user.id)
        db.add(profile_to_update)

    # Cập nhật các trường
    user_to_update.name = update_data.name
    user_to_update.phone_number = update_data.phone_number
    profile_to_update.date_of_birth = update_data.date_of_birth
    profile_to_update.gender = update_data.gender
    profile_to_update.marital_status = update_data.marital_status
    profile_to_update.location_id = update_data.location_id
    profile_to_update.address = update_data.address
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi server khi cập nhật: {e}")

    # === SỬA 2: Đọc lại toàn bộ hồ sơ từ DB sau khi đã commit ===
    # Đây là bước quan trọng để đảm bảo dữ liệu trả về là mới nhất
    updated_profile = db.query(models.JobSeekerProfile).options(
        selectinload(models.JobSeekerProfile.work_experiences),
        selectinload(models.JobSeekerProfile.educations),
        selectinload(models.JobSeekerProfile.certificates),
        selectinload(models.JobSeekerProfile.language_skills),
        selectinload(models.JobSeekerProfile.technical_skills),
        joinedload(models.JobSeekerProfile.career),
        joinedload(models.JobSeekerProfile.location),
        joinedload(models.JobSeekerProfile.user) # Quan trọng: tải lại thông tin user
    ).filter(models.JobSeekerProfile.user_id == current_user.id).first()

    return updated_profile

@router.post("/me/upload-avatar", response_model=schemas.UserOut)
def upload_my_avatar(
    avatar_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_to_update = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

    # Xóa file avatar cũ nếu có
    if user_to_update.avatar_filename:
        old_path = os.path.join(AVATAR_UPLOAD_FOLDER, user_to_update.avatar_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    # Tạo tên file duy nhất để tránh trùng lặp
    unique_filename = f"{current_user.id}_{int(datetime.now().timestamp())}_{avatar_file.filename}"
    file_path = os.path.join(AVATAR_UPLOAD_FOLDER, unique_filename)

    # Lưu file mới
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(avatar_file.file, buffer)
    
    # Cập nhật tên file trong DB
    user_to_update.avatar_filename = unique_filename
    
    db.commit()
    db.refresh(user_to_update)
    
    return user_to_update