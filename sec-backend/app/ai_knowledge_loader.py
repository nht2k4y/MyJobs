# sec-backend/app/ai_knowledge_loader.py
import json
import os

def load_knowledge_base():
    """Đọc file JSON và trả về một danh sách các từ khóa đã được sắp xếp."""
    try:
        # Xây dựng đường dẫn tuyệt đối đến file JSON
        # Giả định file này nằm trong thư mục app
        base_dir = os.path.dirname(os.path.abspath(__file__)) 
        # Đi lên một cấp để ra khỏi thư mục app, vào thư mục sec-backend
        knowledge_file_path = os.path.join(base_dir, '..', 'ai_knowledge.json')

        with open(knowledge_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        all_keywords = []
        for category in data.get('categories', []):
            all_keywords.extend(category.get('keywords', []))
            
        # Sắp xếp các từ khóa từ dài nhất đến ngắn nhất.
        # Điều này cực kỳ quan trọng để đảm bảo trích xuất chính xác.
        # Ví dụ: "frontend developer" sẽ được kiểm tra trước "frontend".
        all_keywords.sort(key=len, reverse=True)
        
        print(f"Đã tải thành công {len(all_keywords)} từ khóa vào Cơ sở Tri thức của AI.")
        return all_keywords
    except Exception as e:
        print(f"LỖI NGHIÊM TRỌNG: Không thể tải Cơ sở Tri thức của AI. Lỗi: {e}")
        return []

# Tải kiến thức ngay khi module này được import
KNOWLEDGE_KEYWORDS = load_knowledge_base()