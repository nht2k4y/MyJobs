import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // 1. Import AuthProvider

import App from './App';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Sử dụng React.StrictMode để phát hiện các vấn đề tiềm ẩn
  <React.StrictMode> 
    {/* 2. BrowserRouter để kích hoạt hệ thống định tuyến */}
    <BrowserRouter>
      {/* 3. AuthProvider để cung cấp thông tin xác thực cho toàn bộ ứng dụng */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);