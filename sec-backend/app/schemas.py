# app/schemas.py

from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Annotated
from datetime import datetime, date

# ==================================
# SCHEMAS CƠ BẢN (CAREER, LOCATION)
# ==================================
class CareerBase(BaseModel): name: str
class CareerCreate(CareerBase): pass
class CareerUpdate(CareerBase): pass
class Career(CareerBase):
    id: int
    class Config: from_attributes = True

class LocationBase(BaseModel): name: str
class LocationCreate(LocationBase): pass
class LocationUpdate(LocationBase): pass
class Location(LocationBase):
    id: int
    class Config: from_attributes = True

# ==================================
# SCHEMAS CHO NGƯỜI DÙNG (USER)
# ==================================
class CompanyInfoForUser(BaseModel):
    id: int
    company_name: Optional[str] = None
    class Config: from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None

# === THÊM MỚI: SCHEMAS CHO UPLOADED CV ===
class UploadedCVBase(BaseModel):
    desired_position: Optional[str] = None
    desired_level: Optional[str] = None
    # ... (Thêm các trường khác nếu cần)

class UploadedCV(UploadedCVBase):
    id: int
    cv_filename: str
    updated_at: datetime
    thumbnail_url: Optional[str] = None
    class Config: from_attributes = True

class UserInDBBase(UserBase):
    id: int
    role: str
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    company_info: Optional[CompanyInfoForUser] = None
    class Config: from_attributes = True

class UserOut(UserInDBBase):
    created_at: datetime

# ==================================
# SCHEMAS CHO BÀI ĐĂNG (JOB POST)
# ==================================
class JobPostBase(BaseModel):
    title: Annotated[str, constr(strip_whitespace=True, min_length=1)]
    position: Annotated[str, constr(strip_whitespace=True, min_length=1)]
    description: Optional[str] = None; company_intro: Optional[str] = None
    requirements: Optional[str] = None; benefits: Optional[str] = None
    how_to_apply: Optional[str] = None; deadline: Optional[date] = None
    career_id: Optional[int] = None; location_id: Optional[int] = None
class JobPostCreate(JobPostBase):
    career_id: int; location_id: int; employer_id: int; employer_email: EmailStr
class JobPostUpdate(JobPostBase):
    title: Optional[Annotated[str, constr(strip_whitespace=True, min_length=1)]] = None
    position: Optional[Annotated[str, constr(strip_whitespace=True, min_length=1)]] = None
class JobPostResponse(JobPostBase):
    id: int; employer_id: Optional[int] = None; employer_email: EmailStr
    created_at: datetime; status: str
    employer: Optional[UserInDBBase] = None
    career: Optional[Career] = None
    location: Optional[Location] = None
    class Config: from_attributes = True
class JobPostPublicList(BaseModel):
    id: int; title: str; position: str
    poster_name: Optional[str] = None; logo_url: Optional[str] = None
    salary: Optional[str] = None; location: Optional[Location] = None
    deadline: Optional[date] = None; is_hot: Optional[bool] = False
    location_id: Optional[int] = None; career_id: Optional[int] = None
    created_at: datetime; status: str
    class Config: from_attributes = True

# ==================================
# SCHEMAS CHO CÔNG TY (COMPANY INFO)
# ==================================
class CompanyInfoBase(BaseModel):
    company_name: Annotated[str, constr(strip_whitespace=True, min_length=1)]
    tax_code: Optional[str] = None; size: Optional[str] = None; founded_date: Optional[date] = None
    website: Optional[str] = None; facebook: Optional[str] = None; linkedin: Optional[str] = None
    youtube: Optional[str] = None; city: Optional[str] = None; district: Optional[str] = None
    address: Optional[str] = None; latitude: Optional[str] = None; longitude: Optional[str] = None
    description: Optional[str] = None; career_id: Optional[int] = None; location_id: Optional[int] = None
class CompanyInfoCreateOrUpdate(CompanyInfoBase): pass
class CompanyInfoResponse(CompanyInfoBase):
    id: int; employer_id: int; email: Optional[EmailStr] = None
    logo_filename: Optional[str] = None; cover_filename: Optional[str] = None
    updated_at: datetime
    career: Optional[Career] = None; location: Optional[Location] = None
    class Config: from_attributes = True

# =======================================================
# SCHEMAS CHO HỒ SƠ NGƯỜI TÌM VIỆC (JOB SEEKER PROFILE)
# =======================================================

# === SỬA LỖI CÚ PHÁP: Xuống dòng cho các class con ===

class WorkExperienceBase(BaseModel):
    job_title: str; company_name: str; start_date: date; end_date: Optional[date] = None; description: Optional[str] = None
class WorkExperienceCreate(WorkExperienceBase): pass
class WorkExperience(WorkExperienceBase):
    id: int
    class Config: from_attributes = True

class EducationBase(BaseModel):
    degree_name: str; major: Optional[str] = None; school_name: str; start_date: date; end_date: Optional[date] = None; description: Optional[str] = None
class EducationCreate(EducationBase): pass
class Education(EducationBase):
    id: int
    class Config: from_attributes = True

class CertificateBase(BaseModel):
    certificate_name: str; issuing_organization: Optional[str] = None; issue_date: date; expiry_date: Optional[date] = None
class CertificateCreate(CertificateBase): pass
class Certificate(CertificateBase):
    id: int
    class Config: from_attributes = True

class LanguageSkillBase(BaseModel):
    language_name: str; proficiency_level: int
class LanguageSkillCreate(LanguageSkillBase): pass
class LanguageSkill(LanguageSkillBase):
    id: int
    class Config: from_attributes = True
        
class TechnicalSkillBase(BaseModel):
    skill_name: str; proficiency_level: int
class TechnicalSkillCreate(TechnicalSkillBase): pass
class TechnicalSkill(TechnicalSkillBase):
    id: int
    class Config: from_attributes = True

class JobSeekerProfileBase(BaseModel):
    date_of_birth: Optional[date] = None; gender: Optional[str] = None
    marital_status: Optional[str] = None; address: Optional[str] = None
    desired_position: Optional[str] = None; desired_level: Optional[str] = None
    education_level: Optional[str] = None; experience_years: Optional[str] = None
    workplace_type: Optional[str] = None; employment_type: Optional[str] = None
    min_salary: Optional[int] = None; max_salary: Optional[int] = None
    career_goals: Optional[str] = None; career_id: Optional[int] = None
    location_id: Optional[int] = None
class JobSeekerProfileUpdate(JobSeekerProfileBase): pass

class JobSeekerProfileResponse(JobSeekerProfileBase):
    id: int; user_id: int; cv_filename: Optional[str] = None
    created_at: datetime; updated_at: datetime
    user: Optional[UserInDBBase] = None
    career: Optional[Career] = None; location: Optional[Location] = None
    work_experiences: List[WorkExperience] = []; educations: List[Education] = []
    certificates: List[Certificate] = []; language_skills: List[LanguageSkill] = []
    technical_skills: List[TechnicalSkill] = []
    uploaded_cvs: List[UploadedCV] = []
    class Config: from_attributes = True

class PersonalInfoUpdate(BaseModel):
    name: str; phone_number: str; date_of_birth: date; gender: str
    marital_status: str; location_id: int; address: str

# ==================================
# SCHEMAS CHO TRANG "VIỆC LÀM CỦA TÔI"
# ==================================
class MyJobsLocation(BaseModel):
    name: str
    class Config: from_attributes = True

class AppliedJobResponse(BaseModel):
    job_id: int
    title: str
    company_name: str
    logo_url: Optional[str] = None # Sẽ là filename
    location: Optional[MyJobsLocation] = None
    salary: Optional[str] = None
    application_date: datetime
    status: str
    class Config: from_attributes = True

class SavedJobResponse(BaseModel):
    job_id: int
    title: str
    company_name: str
    logo_url: Optional[str] = None # Sẽ là filename
    location: Optional[MyJobsLocation] = None
    salary: Optional[str] = None
    saved_date: datetime
    class Config: from_attributes = True
    
# ==================================
# XỬ LÝ FORWARD REFERENCES
# ==================================
JobPostResponse.model_rebuild()
UserInDBBase.model_rebuild()
JobSeekerProfileResponse.model_rebuild()