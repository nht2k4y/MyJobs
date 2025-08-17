// src/components/Chatbox.js (PHIÊN BẢN SỬA LỖI HOÀN CHỈNH)

import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { FaRobot } from 'react-icons/fa6';
import JobSuggestionCard from './JobSuggestionCard';

// Thiết lập worker một lần duy nhất
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbox = () => setIsOpen(!isOpen);

  // TÁCH RIÊNG HÀM GỌI AI
  const getAiSuggestions = async (resumeText) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      const data = await response.json();

      // <<< LOGIC MỚI ĐỂ XỬ LÝ GÓI DỮ LIỆU KẾT HỢP >>>
      
      // Kịch bản 1: Có cả kiến thức và gợi ý việc làm
      if (data.knowledge_text) {
        // Hiển thị phần kiến thức trước
        setMessages((prev) => [...prev, { text: data.knowledge_text, sender: 'ai' }]);
        
        // Sau đó, nếu có gợi ý việc làm, hiển thị chúng
        if (data.suggestions && data.suggestions.length > 0) {
           setMessages((prev) => [...prev, { 
             sender: 'ai', 
             type: 'suggestions', 
             // Thêm một dòng text giới thiệu
             intro_text: "Tiện đây, tôi tìm thấy một vài công việc có thể bạn sẽ quan tâm:",
             data: data.suggestions 
           }]);
        }
      } 
      // Kịch bản 2: Chỉ có gợi ý việc làm (khi upload CV)
      else if (data.suggestions && data.suggestions.length > 0) {
        setMessages((prev) => [...prev, { sender: 'ai', type: 'suggestions', data: data.suggestions }]);
      } 
      // Kịch bản 3: Chỉ có tin nhắn văn bản (chào hỏi, lỗi, không tìm thấy việc...)
      else {
        const reply = data.message || data.error || 'Không có gợi ý nào phù hợp.';
        setMessages((prev) => [...prev, { text: reply, sender: 'ai' }]);
      }

    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setMessages((prev) => [...prev, { text: 'Lỗi kết nối đến máy chủ AI.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // HÀM XỬ LÝ GỬI VĂN BẢN
  const handleTextSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setMessages((prev) => [...prev, { text: trimmedInput, sender: 'user' }]);
    setInput('');
    getAiSuggestions(trimmedInput);
  };

  // HÀM XỬ LÝ TẢI FILE LÊN
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages((prev) => [...prev, { text: `📝 CV từ tệp "${file.name}" đã được gửi.`, sender: 'user' }]);
    setIsLoading(true);

    let extractedText = '';

    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        const fileBuffer = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
        
        const typedArray = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        
        // BƯỚC 1: Thử đọc text trực tiếp (cách nhanh)
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
        }

        // BƯỚC 2: Nếu không có text, thử phương pháp OCR (cách mạnh hơn)
        if (extractedText.trim().length < 20) { // Kiểm tra nếu text quá ngắn hoặc rỗng
          console.log("Không tìm thấy text, chuyển sang chế độ OCR cho PDF...");
          extractedText = ''; // Reset lại text
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // Tăng scale để ảnh nét hơn
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const imageDataUrl = canvas.toDataURL();
            const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng');
            extractedText += text + '\n';
          }
        }

      } else if (file.type.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        extractedText = text;
      } else {
        alert('Chỉ hỗ trợ file PDF hoặc ảnh (PNG, JPG).');
        setMessages(prev => prev.slice(0, -1)); 
        setIsLoading(false);
        return;
      }

      // Sau khi xử lý file thành công, gọi AI
      console.log("Văn bản trích xuất được:", extractedText);
      getAiSuggestions(extractedText);

    } catch (error) {
      console.error("Lỗi xử lý file:", error);
      setMessages((prev) => [...prev, { text: 'Đã xảy ra lỗi khi đọc file.', sender: 'ai' }]);
      setIsLoading(false);
    } finally {
      e.target.value = null;
    }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    }
  };
  
  return (
    <>
      {/* ===== LOGO CHATBOX ===== */}
      <div 
        onClick={toggleChatbox}
        className="fixed bottom-4 right-4 w-16 h-16 rounded-full bg-[#441da0] cursor-pointer shadow-lg flex items-center justify-center z-50 hover:scale-105 transition"
      >
        <FaRobot className="w-8 h-8 text-white" /> 
      </div>

      {/* ===== KHUNG CHATBOX ===== */}
      {isOpen && (
        <div className="w-[350px] max-h-[500px] fixed bottom-20 right-4 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden z-50">
          <div className="bg-[#441da0] text-white px-4 py-2 font-semibold text-sm flex justify-between items-center">
            Trợ lý AI Tuyển dụng
            <button onClick={toggleChatbox} className="text-white hover:text-gray-300">✖</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, index) => {
              if (msg.type === 'suggestions') {
                return (
                  <div key={index} className="mr-auto">
                    <span className="block text-xs text-gray-500 mb-2 ml-1">AI gợi ý các công việc sau:</span>
                    {msg.data.map((job) => <JobSuggestionCard key={job.jobId} job={job} />)}
                  </div>
                );
              } else {
                return (
                  <div key={index} className={`p-2 rounded-lg max-w-[90%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-100 mr-auto'}`}>
                    <span className="block text-xs text-gray-500 mb-1">{msg.sender === 'user' ? 'Bạn' : 'AI'}</span>
                    {msg.text}
                  </div>
                );
              }
            })}
            {isLoading && <div className="text-xs text-gray-400">Đang xử lý...</div>}
          </div>

          <div className="flex flex-col gap-2 border-t p-2">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập nội dung CV..."
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring"
                disabled={isLoading}
              />
              <button
                  onClick={handleTextSubmit}
                  className="ml-2 px-4 py-1 bg-[#441da0] text-white rounded hover:bg-indigo-800 transition disabled:bg-gray-400"
                  disabled={isLoading}
              >
                  Gửi
              </button>
            </div>
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="text-sm text-gray-600 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-[#441da0] hover:file:bg-indigo-100"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;