from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models import User
from app.db import SessionLocal  # Sử dụng đúng session từ app của bạn

# Tạo context để mã hóa mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Khởi tạo session
db: Session = SessionLocal()

# Kiểm tra nếu admin đã tồn tại
existing = db.query(User).filter(User.email == "admin@example.com").first()
if existing:
    print("Admin đã tồn tại.")
else:
    hashed_password = pwd_context.hash("123456")  # Thay đổi mật khẩu nếu cần

    admin_user = User(
        name="Admin",
        email="admin@gmail.com",
        password_hash=hashed_password,
        role="admin",
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print(f"✅ Tạo admin thành công: ID {admin_user.id}")

db.close()
