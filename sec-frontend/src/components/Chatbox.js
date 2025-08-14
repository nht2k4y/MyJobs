import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
import Tesseract from 'tesseract.js';
import { FaRobot } from 'react-icons/fa6';
// import { GlobalWorkerOptions } from 'pdfjs-dist';
// GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbox = () => setIsOpen(!isOpen);

  const handleSendMessage = async (text, isFile = false) => {
    if (!text.trim()) return;

    const displayText = isFile ? '[file_uploaded]' : text;

    setMessages((prev) => [...prev, { text: displayText, realText: text, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: text }),
      });
      const data = await response.json();
      const reply = Array.isArray(data.suggestions)
        ? '- ' + data.suggestions.join('\n- ')
        : data.suggestion || 'Không có phản hồi từ AI';

      setMessages((prev) => [...prev, { text: reply, sender: 'ai' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: 'Lỗi khi lấy gợi ý từ AI.', sender: 'ai' }]);
    }

    setIsLoading(false);
  };

  const handleTextSubmit = () => handleSendMessage(input);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleTextSubmit();
  };

  const handleFileUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const pageText = text.items.map((item) => item.str).join(' ');
        textContent += pageText + '\n';
      }

      handleSendMessage(textContent, true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImageUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const { data: { text } } = await Tesseract.recognize(reader.result, 'eng');
      handleSendMessage(text, true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      handleFileUpload(file);
    } else if (file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      alert('Chỉ hỗ trợ file PDF hoặc ảnh PNG, JPG.');
    }
  };

  return (
    <>
      {/* ===== SỬA LỖI Ở ĐÂY: LOGO CHATBOX ===== */}
      <div 
        onClick={toggleChatbox}
        // 2. Đổi màu nền và thêm icon robot
        className="fixed bottom-4 right-4 w-16 h-16 rounded-full bg-[#441da0] cursor-pointer shadow-lg flex items-center justify-center z-50 hover:scale-105 transition"
      >
        <FaRobot className="w-8 h-8 text-white" /> 
      </div>



      {/* Chatbox panel */}
      {isOpen && (
        <div className="w-[300px] max-h-[500px] fixed bottom-20 right-4 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden z-50">
          <div className="bg-[#441da0] text-white px-4 py-2 font-semibold text-sm flex justify-between items-center">
            Trợ lý AI Tuyển dụng
            <button onClick={toggleChatbox} className="text-white hover:text-gray-300">✖</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[90%] whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-100 mr-auto'
                }`}
              >
                <span className="block text-xs text-gray-500 mb-1">
                  {msg.sender === 'user' ? 'Bạn' : 'AI'}
                </span>
                {msg.text === '[file_uploaded]' ? (
                  <em className="text-gray-500">📝 CV từ tệp đã được gửi.</em>
                ) : (
                  msg.text
                )}
              </div>
            ))}
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
              />
              <button
                  onClick={handleTextSubmit}
                  className="ml-2 px-4 py-1 bg-[#441da0] text-white rounded hover:bg-indigo-800 transition"
              >
                  Gửi
              </button>
            </div>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="text-sm text-gray-600"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;
