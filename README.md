# 🌐 Tuyển dụng AI (MyJob)

Một nền tảng tuyển dụng thông minh, ứng dụng Trí tuệ Nhân tạo để kết nối Nhà tuyển dụng và Người tìm việc một cách hiệu quả.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Demo & Giao diện

*(Ghi chú: Hãy thay thế bằng ảnh GIF hoặc ảnh chụp màn hình đẹp nhất của dự án)*

![Ảnh GIF demo dự án](https://link-toi-anh-gif-cua-ban.gif)

---

## 📖 Mục lục

- [Giới thiệu](#-giới-thiệu-dự-án)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Lộ trình phát triển](#-lộ-trình-phát-triển)

---

## 🌟 Giới thiệu dự án

**Tuyển dụng AI (MyJob)** được xây dựng để đơn giản hóa và tối ưu hóa quá trình tuyển dụng. Dự án giải quyết các thách thức trong tuyển dụng truyền thống bằng cách ứng dụng Trí tuệ Nhân tạo (AI) để nâng cao hiệu quả tìm kiếm, sàng lọc và tương tác, mang lại trải nghiệm tốt nhất cho cả hai bên.

---

## ✨ Tính năng chính

### 👨‍💼 Đối với Nhà tuyển dụng:
- **📊 Dashboard quản lý:** Giao diện quản trị trực quan để theo dõi tin đăng, số lượng ứng viên và các thống kê quan trọng.
- **📝 Quản lý tin tuyển dụng:** Dễ dàng đăng tải, chỉnh sửa, và xóa các bài đăng.
- **📂 Quản lý ứng viên:** Tiếp cận và quản lý thông tin của các ứng viên đã ứng tuyển vào vị trí.

### 👩‍💻 Đối với Người tìm việc:
- **🔍 Tìm kiếm thông minh:** Tìm kiếm và lọc công việc theo ngành nghề, vị trí, khu vực.
- **📄 Quản lý hồ sơ chuyên nghiệp:** Xây dựng một hồ sơ chi tiết (kinh nghiệm, học vấn, kỹ năng) để thu hút nhà tuyển dụng.
- **🚀 Ứng tuyển nhanh chóng:** Nộp hồ sơ trực tiếp trên nền tảng chỉ với vài cú nhấp chuột.

### 🤖 Trợ lý AI Chatbot:
- **💬 Hỗ trợ 24/7:** Giải đáp thắc mắc và gợi ý các công việc phù hợp.
- **🔬 Phân tích & Gợi ý CV:** (Dự kiến) Hỗ trợ phân tích CV và đưa ra đề xuất cải thiện.

---

## 🛠️ Công nghệ sử dụng

| Phần | Công nghệ |
| :--- | :--- |
| **Backend** | `FastAPI (Python)`, `SQLAlchemy` |
| **Frontend** | `React.js`, `Tailwind CSS` |
| **Cơ sở dữ liệu** | `MySQL` |
| **Xác thực** | `JWT (JSON Web Tokens)` |

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu tiên quyết
- Git
- Python 3.8+
- Node.js 16+ & npm
- MySQL Server

### 2. Cài đặt Backend (FastAPI)
```bash
# Clone repository
git clone https://github.com/tenban/tuyen-dung-ai.git
cd tuyen-dung-ai/sec-backend

# Tạo và kích hoạt môi trường ảo
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt

# Cấu hình file .env (sao chép từ .env.example)
# và điền thông tin kết nối database

# Chạy server
uvicorn app.main:app --reload

3. Cài đặt Frontend (React)

# Từ thư mục gốc, đi tới thư mục frontend
cd ../sec-frontend

# Cài đặt các gói
npm install

# Chạy ứng dụng
npm start

###📁 Cấu trúc dự án

.
├── sec-backend/         # Toàn bộ mã nguồn Backend FastAPI
│   ├── app/
│   ├── static/
│   └── ...
├── sec-frontend/        # Toàn bộ mã nguồn Frontend React
│   ├── src/
│   └── ...
└── README.md


###🗺️ Lộ trình phát triển

Dự án vẫn đang trong quá trình phát triển với các tính năng dự kiến:
- [ ] **Hệ thống Gợi ý (Recommendation System):** Tự động gợi ý việc làm/ứng viên phù hợp.
- [ ] **Tìm kiếm Ngữ nghĩa (Semantic Search):** Tìm kiếm bằng ngôn ngữ tự nhiên.
- [ ] **Hoàn thiện Chatbot AI:** Nâng cao khả năng phân tích CV và tương tác.
- [ ] **Triển khai (Deploy):** Đưa ứng dụng lên môi trường production.