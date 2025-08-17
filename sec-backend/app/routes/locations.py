# sec-backend/app/routes/locations.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app import models, schemas
from app.db import get_db
# from app.auth import get_current_admin_user # Cần dependency để bảo vệ route

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)

# === API cho ADMIN ===
@router.post("/admin", response_model=schemas.Location, status_code=status.HTTP_201_CREATED)
def create_location(
    location: schemas.LocationCreate, 
    db: Session = Depends(get_db)
    # , current_admin: models.User = Depends(get_current_admin_user) # Bỏ comment khi có auth
):
    # Kiểm tra xem tên khu vực đã tồn tại chưa (không phân biệt hoa thường)
    db_location = db.query(models.Location).filter(func.lower(models.Location.name) == func.lower(location.name)).first()
    if db_location:
        raise HTTPException(status_code=400, detail="Khu vực đã tồn tại")
    
    new_location = models.Location(**location.dict())
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@router.put("/admin/{location_id}", response_model=schemas.Location)
def update_location(
    location_id: int, 
    location: schemas.LocationUpdate, 
    db: Session = Depends(get_db)
    # , current_admin: models.User = Depends(get_current_admin_user)
):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vực")
    
    db_location.name = location.name
    db.commit()
    db.refresh(db_location)
    return db_location

@router.delete("/admin/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: int, 
    db: Session = Depends(get_db)
    # , current_admin: models.User = Depends(get_current_admin_user)
):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vực")
    
    db.delete(db_location)
    db.commit()
    return {"ok": True}

# === API CÔNG KHAI (cho mọi người dùng) ===
@router.get("/", response_model=List[schemas.Location])
def get_all_locations(db: Session = Depends(get_db)):
    locations = db.query(models.Location).order_by(models.Location.name).all()
    return locations