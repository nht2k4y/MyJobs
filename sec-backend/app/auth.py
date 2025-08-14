from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models import User
from app.db import get_db

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# =====================
# === TOKEN SCHEMA ===
# =====================
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

# ======================
# === REGISTER SCHEMA ===
# ======================
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # admin | employer | jobseeker

# ========================
# === UTILS =============
# ========================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

# ========================
# === LOGIN API ==========
# ========================
@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "email": user.email,           # <-- thêm email
        "employer_id": user.id         # <-- thêm employer_id
    }

# =========================
# === REGISTER API ========
# =========================
@router.post("/auth/register")
async def register(user: RegisterRequest, db: Session = Depends(get_db)):
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Không thể đăng ký tài khoản quản trị viên.")

    # Kiểm tra email đã tồn tại
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Tạo tài khoản thành công", "user_id": new_user.id}


# ==========================================================
#  HÀM LẤY THÔNG TIN USER TỪ TOKEN (HÀM CẦN THÊM)
# ==========================================================
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency này sẽ giải mã token, lấy email từ đó,
    và trả về đối tượng User tương ứng từ database.
    Nó sẽ được dùng trong các endpoint cần xác thực.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Lấy email từ "subject" của token
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        # Nếu token không hợp lệ hoặc hết hạn
        raise credentials_exception
    
    # Tìm user trong database bằng email đã giải mã
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        # Nếu không tìm thấy user trong DB (ví dụ: user đã bị xóa)
        raise credentials_exception
        
    return user