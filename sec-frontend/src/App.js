import React from 'react';
// Không cần import { BrowserRouter as Router } từ react-router-dom nữa.

import Chatbox from './components/Chatbox';
import AppRouter from './router';


export default function App() {
    // Component App giờ chỉ trả về các thành phần giao diện chính.
    // Thẻ <Router> (hay <BrowserRouter>) đã được xử lý ở file index.js
    return (
        <>
            
            <AppRouter />
            <div className="fixed bottom-4 right-4 z-50">
                <Chatbox />
            </div>
        </>
    );
}