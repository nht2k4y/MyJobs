# sec-backend/app/routes/careers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app import models, schemas
from app.db import get_db
# from app.auth import get_current_admin_user # Cần dependency để bảo vệ route

router = APIRouter(
    prefix="/careers",
    tags=["Careers"]
)

# === API cho ADMIN ===
@router.post("/admin", response_model=schemas.Career, status_code=status.HTTP_201_CREATED)
def create_career(
    career: schemas.CareerCreate, 
    db: Session = Depends(get_db)
    # , current_admin: models.User = Depends(get_current_admin_user) # Bỏ comment khi có auth
):
    db_career = db.query(models.Career).filter(func.lower(models.Career.name) == func.lower(career.name)).first()
    if db_career:
        raise HTTPException(status_code=400, detail="Ngành nghề đã tồn tại")
    new_career = models.Career(**career.dict())
    db.add(new_career)
    db.commit()
    db.refresh(new_career)
    return new_career

@router.put("/admin/{career_id}", response_model=schemas.Career)
def update_career(
    career_id: int, 
    career: schemas.CareerUpdate, 
    db: Session = Depends(get_db)
    # , current_admin: models.User = Depends(get_current_admin_user)
):
    db_career = db.query(models.Career).filter(models.Career.id == career_id).first()
    if not db_career:
        raise HTTPException(status_code=404, detail="Không tìm thấy ngành nghề")
    db_career.name = career.name
    db.commit()
    db.refresh(db_career)
    return db_career

@router.delete("/admin/{career_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_career(
    career_id: int, 
    db: Session = Depends(get_db)
    # , current_admin: models.User = Depends(get_current_admin_user)
):
    db_career = db.query(models.Career).filter(models.Career.id == career_id).first()
    if not db_career:
        raise HTTPException(status_code=404, detail="Không tìm thấy ngành nghề")
    db.delete(db_career)
    db.commit()
    return {"ok": True}

# === API CÔNG KHAI (cho mọi người dùng) ===
@router.get("/", response_model=List[schemas.Career])
def get_all_careers(db: Session = Depends(get_db)):
    careers = db.query(models.Career).order_by(models.Career.name).all()
    return careers