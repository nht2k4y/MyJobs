# intent_classifier.py
from transformers import AutoModel, AutoTokenizer
import torch
from sklearn.metrics.pairwise import cosine_similarity

# Tải mô hình PhoBERT (chỉ cần làm 1 lần, lần sau sẽ dùng cache)
phobert = AutoModel.from_pretrained("vinai/phobert-base")
tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base")

# Định nghĩa các ý định và các câu mẫu
INTENTS = {
    "tim_viec_theo_ten": [
        # Mẫu trực tiếp
        "Tìm cho tôi công việc Lập trình viên", "ứng tuyển vị trí Digital Marketing", "tìm việc kế toán", "kiếm việc sales",
        "tuyển dụng frontend developer",

        # Mẫu hỏi nghi vấn
        "Có job nào về kế toán không?", "Ở đây có tuyển nhân viên kinh doanh không?", "có vị trí frontend nào đang tuyển không",
        "công ty có tuyển backend developer không", "cho mình hỏi có việc làm kếtoán không", "có việc làm nào fullstack đang tuyển không",

        # Mẫu ngôn ngữ tự nhiên
        "Gợi ý việc làm cho nhân viên kinh doanh", "Cho mình xem các job về marketing online", "Kiếm cho mình một chân designer",
        "Mình muốn tìm việc làm phân tích dữ liệu", "Các công việc liên quan đến nhân sự", "kiếm giúp mình một việc sale",
        "có chỗ nào đang tuyển việc fullstack không", "xem các vị trí devops", "cho mình coi job marketing",

        # Mẫu câu ngắn
        "lập trình viên", "digital marketing", "backend", "fullstack developer"
    ],
    "hoi_ky_nang": [
        # Mẫu trực tiếp
        "Để làm Kế toán cần kỹ năng gì?", "Học gì để trở thành một nhà thiết kế đồ họa?", "Yêu cầu của vị trí phân tích dữ liệu là gì?",
        "Kỹ năng cần có của một trưởng phòng kinh doanh là gì?",

        # Mẫu tư vấn
        "Làm sao để trở thành một lập trình viên giỏi?", "Mình cần chuẩn bị những gì cho công việc nhân sự?",
        "Muốn làm designer thì phải biết những gì?", "Làm thế nào để apply vị trí backend?",

        # Mẫu "bẫy", dễ nhầm
        "Cho mình hỏi về công việc marketing", "Thông tin về vị trí kế toán", "công việc của một tester là làm gì?"
    ],
    "chao_hoi": [
        "Xin chào", "Chào bạn", "Hello AI", "Hi", "Chào buổi sáng", "chào shop", "ơi"
    ],
    "out_of_scope": [
        "Cảm ơn bạn nhiều", "Bạn thật tuyệt vời", "Tạm biệt nhé", "Thời tiết hôm nay thế nào?", "Bạn là ai?",
        "ok cảm ơn", "tuyệt vời", "bye"
    ],
    "hoi_ky_nang": [
        "Để làm Kế toán cần kỹ năng gì?",
        "Học gì để trở thành một nhà thiết kế đồ họa?",
        "Yêu cầu của vị trí phân tích dữ liệu là gì?",
        "Làm sao để trở thành một lập trình viên giỏi?",
        "Mình cần chuẩn bị những gì cho công việc nhân sự?",
        "Cho mình hỏi về công việc marketing",
        "Kỹ năng cần có của một trưởng phòng kinh doanh là gì?"
    ],
    "chao_hoi": [
        "Xin chào",
        "Chào bạn",
        "Hello AI",
        "Hi",
        "Chào buổi sáng"
    ],
    # Thêm một ý định "out of scope" để xử lý các câu hỏi không liên quan
    "out_of_scope": [
        "Cảm ơn bạn nhiều",
        "Bạn thật tuyệt vời",
        "Tạm biệt nhé",
        "Thời tiết hôm nay thế nào?",
        "Bạn là ai?"
    ]
}

# --- Các hàm xử lý ---

def get_sentence_embedding(sentence):
    """Chuyển một câu thành vector embedding sử dụng PhoBERT."""
    input_ids = tokenizer.encode(sentence, return_tensors='pt')
    with torch.no_grad():
        features = phobert(input_ids)
    # Lấy embedding của token [CLS] (đại diện cho cả câu)
    return features[0][:, 0, :].numpy()

# Tính toán trước embedding cho tất cả các câu mẫu để tăng tốc độ
print("Đang khởi tạo bộ phân loại ý định...")
intent_embeddings = {}
for intent, examples in INTENTS.items():
    intent_embeddings[intent] = [get_sentence_embedding(ex) for ex in examples]
print("Khởi tạo hoàn tất!")


def classify_intent(user_query):
    """Phân loại ý định của câu người dùng nhập vào."""
    if not user_query:
        return None, 0.0

    query_embedding = get_sentence_embedding(user_query)
    best_match_intent = None
    highest_similarity = -1.0

    for intent, examples_embeddings in intent_embeddings.items():
        for example_embedding in examples_embeddings:
            sim = cosine_similarity(query_embedding, example_embedding)[0][0]
            if sim > highest_similarity:
                highest_similarity = sim
                best_match_intent = intent
    
    # Đặt một ngưỡng tin cậy, nếu dưới ngưỡng này thì coi là không hiểu
    if highest_similarity < 0.6: # Bạn có thể tinh chỉnh ngưỡng này
        return "khong_hieu", highest_similarity

    return best_match_intent, highest_similarity

# --- Ví dụ sử dụng ---
if __name__ == "__main__":
    test_query1 = "cho mình xem các job về marketing online"
    intent1, score1 = classify_intent(test_query1)
    print(f"Câu: '{test_query1}' -> Ý định: {intent1} (Độ tương đồng: {score1:.2f})")

    test_query2 = "làm sao để trở thành một lập trình viên giỏi"
    intent2, score2 = classify_intent(test_query2)
    print(f"Câu: '{test_query2}' -> Ý định: {intent2} (Độ tương đồng: {score2:.2f})")

    test_query3 = "cảm ơn bạn"
    intent3, score3 = classify_intent(test_query3)
    print(f"Câu: '{test_query3}' -> Ý định: {intent3} (Độ tương đồng: {score3:.2f})")