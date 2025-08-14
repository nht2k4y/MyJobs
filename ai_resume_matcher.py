# ai_resume_matcher.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# 1. Load data từ MySQL hoặc CSV
data = pd.read_csv("data/resume_job_data.csv")
X = data["resume_text"]
y = data["job_title"]

# 2. Vector hóa và huấn luyện
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

model = LogisticRegression()
model.fit(X_vec, y)

# 3. Lưu lại
joblib.dump(model, "sec-backend/app/models/matcher_model.pkl")
joblib.dump(vectorizer, "sec-backend/app/models/vectorizer.pkl")

