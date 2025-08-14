# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Import tất cả các router của bạn
from app.auth import router as auth_router
from app.routes import (
    company, 
    jobseeker_profiles, 
    careers, 
    locations, 
    job_posts, 
    users, 
    saved_profiles
    # Thêm router AI ở đây nếu bạn tạo file mới
    # ai, 
)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="MyJob API",
    description="API cho nền tảng tuyển dụng việc làm MyJob",
    version="1.0.0"
)

# Cấu hình CORS (An toàn hơn cho production)
origins = [
    "http://localhost:3000", # Cho phép React dev server
    # "https://your-production-frontend.com", # Thêm domain thật của bạn ở đây
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Sử dụng danh sách origins an toàn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Bao gồm tất cả các router API ===
app.include_router(auth_router)
app.include_router(users.router)
app.include_router(careers.router)
app.include_router(locations.router)
app.include_router(company.router)
app.include_router(job_posts.router)
app.include_router(saved_profiles.router)
app.include_router(jobseeker_profiles.router)
# app.include_router(ai.router) # Thêm router AI nếu đã di chuyển

# === Cấu hình phục vụ file tĩnh và ứng dụng React ===

# 1. Phục vụ các file trong thư mục 'static' (logos, cvs, ...)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Phục vụ ứng dụng React đã được build
# Dòng này phải nằm ở CUỐI CÙNG
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react_app(full_path: str):
    # Đường dẫn đến file build của React
    build_dir = "sec-frontend/build"
    index_path = os.path.join(build_dir, "index.html")

    # Nếu đường dẫn yêu cầu là một file thực sự trong thư mục build (ví dụ: main.js, main.css)
    requested_path = os.path.join(build_dir, full_path)
    if os.path.exists(requested_path) and os.path.isfile(requested_path):
        return FileResponse(requested_path)

    # Nếu không, trả về index.html để React Router xử lý
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # Nếu không tìm thấy gì, trả về lỗi 404
    return {"error": "Not Found"}, 404