# app/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Date
from datetime import datetime
from typing import Optional

Base = declarative_base()

# ===============================
# Tài khoản người dùng
# ===============================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    # Giả sử bạn đang lưu password hash, không phải password gốc
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False)  # jobseeker | employer | admin
    created_at = Column(DateTime, default=func.now())
    phone_number = Column(String(20), unique=True, nullable=True)
    avatar_filename = Column(String(255), nullable=True)
    saved_jobs = relationship("SavedJob")

    @property
    def avatar_url(self) -> Optional[str]:
        if self.avatar_filename:
            # Đường dẫn này sẽ được phục vụ bởi StaticFiles trong main.py
            return f"/static/avatars/{self.avatar_filename}"
        return None
    
    # === THAY ĐỔI 1: THÊM MỐI QUAN HỆ ĐẾN COMPANY_INFO ===
    # Mối quan hệ từ User đến JobPost (One-to-Many)
    job_posts = relationship("JobPost", back_populates="employer")
    
    # Mối quan hệ từ User đến CompanyInfo (One-to-One)
    # Đây là "lối tắt" mà joinedload cần để hoạt động
    company_info = relationship("CompanyInfo", back_populates="employer", uselist=False)

    # Mối quan hệ từ User đến SavedProfile (One-to-Many)
    saved_profiles = relationship("SavedProfile", back_populates="employer")
    job_seeker_profile = relationship("JobSeekerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    

# ===============================
# Bài đăng tuyển dụng
# ===============================
class JobPost(Base):
    __tablename__ = "job_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    description = Column(Text)
    company_intro = Column(Text)
    requirements = Column(Text)
    benefits = Column(Text)
    logo_url = Column(String(255), nullable=True)
    how_to_apply = Column(Text)
    employer_email = Column(String(255))
    employer_id = Column(Integer, ForeignKey("users.id")) 
    career_id = Column(Integer, ForeignKey("careers.id"))
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    deadline = Column(Date, nullable=True)
    status = Column(String(20), default="pending") 

    employer = relationship("User", back_populates="job_posts")
    career = relationship("Career", back_populates="job_posts")
    location = relationship("Location")
    applications = relationship("Application", back_populates="job")

    @property
    def poster_name(self) -> str:
        """
        Đây là một thuộc tính "ảo", được tính toán mỗi khi được gọi.
        Pydantic sẽ thấy thuộc tính này và đưa nó vào response.
        """
        # Kiểm tra xem có thông tin công ty và tên công ty không
        if self.employer and self.employer.company_info and self.employer.company_info.company_name:
            return self.employer.company_info.company_name
        # Nếu không, trả về tên của người đăng
        if self.employer and self.employer.name:
            return self.employer.name
        # Nếu không có gì, trả về giá trị mặc định
        return "Công ty ẩn danh"


# ===============================
# Thông tin công ty
# ===============================
class CompanyInfo(Base):
    __tablename__ = "company_info"

    id = Column(Integer, primary_key=True)
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    logo_filename = Column(String(255))
    cover_filename = Column(String(255))
    company_name = Column(String(255), nullable=False)
    tax_code = Column(String(100))
    size = Column(String(100))
    founded_date = Column(Date)
    website = Column(String(255))
    facebook = Column(String(255))
    linkedin = Column(String(255))
    youtube = Column(String(255))
    email = Column(String(255))
    city = Column(String(100))
    district = Column(String(100))
    address = Column(String(255))
    latitude = Column(String(100))
    longitude = Column(String(100))
    description = Column(Text)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Mối quan hệ từ CompanyInfo đến Career
    career = relationship("Career")
    location = relationship("Location")
    
    # === THAY ĐỔI 2: SỬA LẠI MỐI QUAN HỆ ĐẾN USER ===
    # Sử dụng back_populates để liên kết hai chiều với 'company_info' trong User
    employer = relationship("User", back_populates="company_info")


# ===============================
# Ngành nghề
# ===============================
class Career(Base):
    __tablename__ = 'careers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    job_posts = relationship("JobPost", back_populates="career")

class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)

# ===============================
# Hồ sơ ứng tuyển của ứng viên
# ===============================
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    full_name = Column(String(100))
    gender = Column(String(20))
    email = Column(String(100))
    phone = Column(String(50))
    birth_year = Column(Integer)
    preferred_location = Column(String(100))
    job_id = Column(Integer, ForeignKey("job_posts.id"))
    experience_fields = Column(Text)
    experience_places = Column(Text)
    certificates = Column(Text)
    cover_letter = Column(Text)
    cv_filename = Column(String(255))
    applied_at = Column(DateTime, default=func.now())
    
    job = relationship("JobPost", back_populates="applications")
    saved_by_employers = relationship("SavedProfile", back_populates="application")

# ===============================
# HỒ SƠ ỨNG TUYỂN ĐÃ LƯU
# ===============================
class SavedProfile(Base):
    __tablename__ = "saved_profiles"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    saved_at = Column(DateTime, default=func.now())

    employer = relationship("User", back_populates="saved_profiles")
    application = relationship("Application", back_populates="saved_by_employers")

# ===============================
# Các model khác giữ nguyên
# ===============================
class AIJobKnowledge(Base):
    __tablename__ = "ai_job_knowledge"
    id = Column(Integer, primary_key=True)
    job_title = Column(String(255), nullable=False)
    industry = Column(String(255))
    required_skills = Column(Text, nullable=False)


class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String(255))
    extracted_text = Column(Text)
    uploaded_at = Column(DateTime, default=func.now())
    # User relationship for Resume can be added if needed
    # user = relationship("User", backref="resumes")


# ==============================================================
# === BẮT ĐẦU CẬP NHẬT: HỒ SƠ CHUYÊN MÔN CỦA NGƯỜI TÌM VIỆC ===
# ==============================================================

class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # === CẬP NHẬT: Thêm các trường thông tin cá nhân ===
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True)
    marital_status = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    
    # --- Các trường cũ được giữ lại ---
    desired_position = Column(String(255), nullable=True)
    desired_level = Column(String(100), nullable=True)
    education_level = Column(String(100), nullable=True)
    experience_years = Column(String(100), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    workplace_type = Column(String(100), nullable=True)
    employment_type = Column(String(100), nullable=True)
    min_salary = Column(Integer, nullable=True)
    max_salary = Column(Integer, nullable=True)
    career_goals = Column(Text, nullable=True)
   
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    uploaded_cvs = relationship("UploadedCV", back_populates="profile", cascade="all, delete-orphan")
    
    # --- Mối quan hệ ---
    user = relationship("User", back_populates="job_seeker_profile")
    career = relationship("Career")
    location = relationship("Location")
    
    # === THÊM MỚI: Mối quan hệ một-nhiều đến các bảng chi tiết ===
    work_experiences = relationship("WorkExperience", back_populates="profile", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="profile", cascade="all, delete-orphan")
    language_skills = relationship("LanguageSkill", back_populates="profile", cascade="all, delete-orphan")
    technical_skills = relationship("TechnicalSkill", back_populates="profile", cascade="all, delete-orphan")

class UploadedCV(Base):
    __tablename__ = "uploaded_cvs"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("job_seeker_profiles.id"), nullable=False)
    cv_filename = Column(String(255), nullable=False)
    thumbnail_filename = Column(String(255), nullable=True)
    
    # Các trường thông tin đi kèm CV
    desired_position = Column(String(255), nullable=True)
    desired_level = Column(String(100), nullable=True)
    # ... (Thêm các trường khác nếu cần: experience_years, education_level, ...)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    profile = relationship("JobSeekerProfile", back_populates="uploaded_cvs")

    @property
    def thumbnail_url(self) -> Optional[str]:
        if self.thumbnail_filename:
            # Đường dẫn này sẽ được phục vụ bởi StaticFiles trong main.py
            return f"/static/uploaded_cvs/{self.thumbnail_filename}"
        return None

# === THÊM MỚI: CÁC BẢNG CHI TIẾT CHO HỒ SƠ ===

class WorkExperience(Base):
    __tablename__ = "work_experiences"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("job_seeker_profiles.id"), nullable=False)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    profile = relationship("JobSeekerProfile", back_populates="work_experiences")

class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("job_seeker_profiles.id"), nullable=False)
    degree_name = Column(String(255), nullable=False)
    major = Column(String(255), nullable=True)
    school_name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    profile = relationship("JobSeekerProfile", back_populates="educations")

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("job_seeker_profiles.id"), nullable=False)
    certificate_name = Column(String(255), nullable=False)
    issuing_organization = Column(String(255), nullable=True)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    profile = relationship("JobSeekerProfile", back_populates="certificates")

class LanguageSkill(Base):
    __tablename__ = "language_skills"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("job_seeker_profiles.id"), nullable=False)
    language_name = Column(String(100), nullable=False)
    proficiency_level = Column(Integer, nullable=False)
    profile = relationship("JobSeekerProfile", back_populates="language_skills")

class TechnicalSkill(Base):
    __tablename__ = "technical_skills"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("job_seeker_profiles.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(Integer, nullable=False)
    profile = relationship("JobSeekerProfile", back_populates="technical_skills")

# ===============================
# VIỆC LÀM ĐÃ LƯU CỦA NGƯỜI TÌM VIỆC
# ===============================
class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_post_id = Column(Integer, ForeignKey("job_posts.id"), nullable=False)
    saved_at = Column(DateTime, default=func.now())

    # Mối quan hệ để truy cập thông tin User và JobPost từ một SavedJob
    user = relationship("User")
    job_post = relationship("JobPost")

# Đồng thời, thêm mối quan hệ ngược lại vào class User
# Tìm đến class User ở đầu file và thêm dòng này vào
# User.saved_jobs = relationship("SavedJob", back_populates="user")