import React from 'react';
import { FaFacebookF, FaFacebookMessenger, FaLinkedinIn, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

export default function Footer() {
    return (
        // --- BƯỚC 1: THAY ĐỔI MÀU NỀN CỦA FOOTER ---
        <footer className="bg-gradient-to-r from-[#2c1e5d] to-[#1a1138] text-white py-12">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Cột 1: Logo và các liên kết chính */}
                <div>
                    <img
                        src="/logo/light-text-logo.png"
                        alt="MyJob Logo"
                        className="h-10 w-auto mb-6"
                    />
                    {/* --- BƯỚC 2: ĐIỀU CHỈNH MÀU TEXT CHO HÀI HÒA --- */}
                    <ul className="space-y-2 text-indigo-200">
                        <li className="hover:text-white cursor-pointer transition-colors">Về MyJob</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Liên Hệ</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Hỏi Đáp</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Thỏa thuận sử dụng</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Quy định bảo mật</li>
                    </ul>
                </div>

                {/* Cột 2: Dành cho nhà tuyển dụng */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 uppercase text-white">Dành cho nhà tuyển dụng</h3>
                    <ul className="space-y-2 text-indigo-200">
                        <li className="hover:text-white cursor-pointer transition-colors">Đăng Tin Tuyển Dụng</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Tìm Kiếm Hồ Sơ</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Quản Lý Nhà Tuyển Dụng</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Tin Nhắn</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Thông Báo</li>
                    </ul>
                </div>

                {/* Cột 3: Dành cho ứng viên */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 uppercase text-white">Dành cho ứng viên</h3>
                    <ul className="space-y-2 text-indigo-200">
                        <li className="hover:text-white cursor-pointer transition-colors">Việc Làm</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Công ty</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Quản Lý Ứng Viên</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Tin Nhắn</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Thông Báo</li>
                    </ul>
                </div>

                {/* Cột 4: Ứng dụng và mạng xã hội */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 uppercase text-white">Ứng dụng di động</h3>
                    <div className="flex space-x-4 mb-6">
                        <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
                        </a>
                        <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                            <img src="/icons/app-store-badge.jpg" alt="App Store" className="h-10" />
                        </a>
                    </div>
                    
                    <h4 className="mb-2 uppercase text-white">Kết nối với MyJob</h4>
                    <div className="flex space-x-4 text-2xl text-indigo-200">
                        <a href="#" className="hover:text-white transition-colors"><FaFacebookF /></a>
                        <a href="#" className="hover:text-white transition-colors"><FaFacebookMessenger /></a>
                        <a href="#" className="hover:text-white transition-colors"><FaLinkedinIn /></a>
                        <a href="#" className="hover:text-white transition-colors"><FaInstagram /></a>
                        <a href="#" className="hover:text-white transition-colors"><FaYoutube /></a>
                        <a href="#" className="hover:text-white transition-colors"><FaTwitter /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}