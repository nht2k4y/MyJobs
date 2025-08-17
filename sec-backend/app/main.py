# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# ==========================================================
# === SỬA LẠI PHẦN IMPORT ROUTER ===
# ==========================================================

# 1. Import router authentication
from app.auth import router as auth_router

# 2. Import các router nằm trực tiếp trong thư mục `app/routes`
from app.routes import (
    company,
    careers,
    locations,
    job_posts,
    users,
    saved_profiles,
    ai,
)

# 3. Import các router nằm trong thư mục con `app/routes/jobseeker`
# Python sẽ tự động tìm file __init__.py và coi `jobseeker` là một package
from app.routes.jobseeker import (
    dashboard,
    jobseeker_profiles,
    my_jobs,
)

# ==========================================================

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="MyJob API",
    description="API cho nền tảng tuyển dụng việc làm MyJob",
    version="1.0.0"
)

# Cấu hình CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Bao gồm tất cả các router API ===
# Thứ tự include không quá quan trọng, nhưng nên nhóm lại cho dễ đọc
app.include_router(auth_router)
app.include_router(users.router)
app.include_router(careers.router)
app.include_router(locations.router)
app.include_router(company.router)
app.include_router(job_posts.router)
app.include_router(saved_profiles.router)

# Include các router từ package `jobseeker`
app.include_router(jobseeker_profiles.router)
app.include_router(dashboard.router)
app.include_router(my_jobs.router)

app.include_router(ai.router)

# === Cấu hình phục vụ file tĩnh và ứng dụng React ===
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react_app(full_path: str):
    build_dir = "sec-frontend/build"
    index_path = os.path.join(build_dir, "index.html")
    requested_path = os.path.join(build_dir, full_path)
    if os.path.exists(requested_path) and os.path.isfile(requested_path):
        return FileResponse(requested_path)
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Not Found"}, 404