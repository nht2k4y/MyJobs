# sec-backend/export_and_train.py (PHIÊN BẢN CUỐI CÙNG - TÍCH HỢP TIỀN XỬ LÝ)

import pandas as pd
import joblib
import mysql.connector
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report # Dùng để đánh giá sâu hơn

# --- CẤU HÌNH DATABASE (Giữ nguyên) ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '2212',
    'database': 'job_platform'
}

# === THÊM MỚI: HÀM TIỀN XỬ LÝ VĂN BẢN ===
def preprocess_text(text):
    """Làm sạch văn bản: chuyển chữ thường, xóa số và dấu câu."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = text.strip()
    return text

def export_data_from_db():
    # ... (Hàm này giữ nguyên, không cần thay đổi)
    print("Đang kết nối đến cơ sở dữ liệu...")
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        query = """
            SELECT 
                CONCAT_WS(' ', title, description, requirements) AS resume_text,
                title AS job_title
            FROM job_posts
            WHERE 
                description IS NOT NULL AND LENGTH(description) > 50
                AND requirements IS NOT NULL AND LENGTH(requirements) > 50
                AND status = 'approved';
        """
        df = pd.read_sql(query, conn)
        conn.close()
        print(f"Đã lấy thành công {len(df)} mẫu dữ liệu huấn luyện từ bảng 'job_posts'.")
        return df
    except Exception as e:
        print(f"Lỗi khi lấy dữ liệu từ CSDL: {e}")
        return None

def train_and_save_model(data):
    """Huấn luyện và lưu lại mô hình từ dữ liệu DataFrame."""
    if data is None or data.empty:
        print("Không có dữ liệu để huấn luyện. Dừng lại.")
        return

    data.dropna(subset=['resume_text', 'job_title'], inplace=True)
    
    # === CẬP NHẬT: ÁP DỤNG HÀM TIỀN XỬ LÝ ===
    print("Đang tiền xử lý dữ liệu văn bản...")
    data['cleaned_text'] = data['resume_text'].apply(preprocess_text)
    
    if len(data) < 10:
        print(f"Dữ liệu quá ít ({len(data)} mẫu), không đủ để huấn luyện và đánh giá.")
        return

    print("Bắt đầu quá trình huấn luyện AI phân tích CV...")
    X = data["cleaned_text"] # Dùng cột đã được làm sạch
    y = data["job_title"]

    # Chia dữ liệu để huấn luyện và kiểm tra
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Thêm class_weight='balanced' để xử lý trường hợp một ngành có quá nhiều tin tuyển dụng
    model = LogisticRegression(max_iter=1000, class_weight='balanced')
    model.fit(X_train_vec, y_train)
    
    # === CẬP NHẬT: In ra báo cáo đánh giá chi tiết ===
    print("\n" + "="*60)
    print("BÁO CÁO ĐÁNH GIÁ MÔ HÌNH PHÂN TÍCH CV")
    print("="*60)
    y_pred = model.predict(X_test_vec)
    print(classification_report(y_test, y_pred, zero_division=0))
    print("="*60 + "\n")

    # Huấn luyện lại trên toàn bộ dữ liệu để có mô hình cuối cùng tốt nhất
    print("Huấn luyện lại mô hình trên toàn bộ dữ liệu...")
    final_vectorizer = TfidfVectorizer(max_features=5000)
    X_full_vec = final_vectorizer.fit_transform(X) # Dùng lại X (đã làm sạch)
    
    final_model = LogisticRegression(max_iter=1000, class_weight='balanced')
    final_model.fit(X_full_vec, y)

    output_dir = os.path.join("app", "models") # Đường dẫn an toàn hơn
    os.makedirs(output_dir, exist_ok=True)
    joblib.dump(final_model, os.path.join(output_dir, "matcher_model.pkl"))
    joblib.dump(final_vectorizer, os.path.join(output_dir, "vectorizer.pkl"))
    print(f"Đã huấn luyện và lưu thành công mô hình PHÂN TÍCH CV vào thư mục '{output_dir}'.")

if __name__ == "__main__":
    training_data = export_data_from_db()
    train_and_save_model(training_data)