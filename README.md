# 🌐 Tuyển dụng AI — Nền tảng tuyển dụng ứng dụng Trí tuệ Nhân tạo

**Tuyển dụng AI** là một nền tảng tuyển dụng thông minh, nơi nhà tuyển dụng và người tìm việc có thể kết nối, đăng bài, tìm kiếm việc làm và được hỗ trợ bởi chatbot AI. Dự án được xây dựng với mục tiêu đơn giản hóa quá trình tuyển dụng thông qua công nghệ hiện đại.

## 🚀 Tính năng chính

### 👨‍💼 Đối với nhà tuyển dụng:
- Đăng ký / Đăng nhập và phân quyền theo vai trò
- Đăng bài tuyển dụng (tiêu đề, vị trí, mô tả)
- Chỉnh sửa, xoá bài đã đăng
- Quản lý bài viết tại `/manage-jobs`
- Quản lý người ứng tuyển

### 👩‍💻 Đối với người tìm việc:
- Đăng ký / Đăng nhập và phân quyền theo vai trò
- Xem danh sách các công việc tại `/jobs`
- Click vào tiêu đề để xem chi tiết bài đăng
- ấn ứng tuyển sẽ gửi info về cho nhà tuyển dụng

### 🤖 AI Chatbot hỗ trợ:
- Gợi ý công việc phù hợp từ MySQL
- Hỗ trợ xử lý CV và trả lời câu hỏi nhanh

## 🛠️ Công nghệ sử dụng

| Phần      | Công nghệ     |
|-----------|---------------|
| Backend   | FastAPI(Python), SQLAlchemy |
| Cơ sở dữ liệu | MySQL |
| Frontend  | React.js, Tailwind CSS |
| AI Chatbot | (tuỳ chọn) GPT tích hợp phản hồi từ MySQL |
| Authentication | JWT |

---

## ⚙️ Cài đặt & chạy

### 1. Clone dự án

```bash
git clone https://github.com/tenban/tuyen-dung-ai.git
cd tuyen-dung-ai

cài đặt backend:

cd sec-backend
python -m venv .venv
.venv\Scripts\activate  # hoặc source .venv/bin/activate trên macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload

cài đặt frontend:

cd client
npm install
npm start
"# TestCode" 
"# TestCode" 
"# MyJobs" 
"# MyJobs" 
"# MyJobs" 
