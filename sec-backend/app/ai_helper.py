import os
import joblib
from .db import get_connection

# BASE_DIR = D:\TuyenDungAI\KhoaLuan\
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")


vectorizer = joblib.load(os.path.join(MODELS_DIR, "vectorizer.pkl"))
model = joblib.load(os.path.join(MODELS_DIR, "matcher_model.pkl"))


def get_job_suggestions(resume_text: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jobs")
    jobs = cursor.fetchall()
    conn.close()

    # Logic đơn giản: lọc công việc có kỹ năng phù hợp
    matched_jobs = []
    for job in jobs:
        required_skills = job["skills_required"].lower().split(", ")
        if any(skill in resume_text.lower() for skill in required_skills):
            matched_jobs.append(job["title"])

    if not matched_jobs:
        return ["Không tìm thấy công việc phù hợp"]
    return matched_jobs
