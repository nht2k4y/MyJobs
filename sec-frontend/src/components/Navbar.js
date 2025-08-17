import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaBriefcase, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { HiUserCircle } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    // --- TOÀN BỘ LOGIC CỦA BẠN ĐƯỢC GIỮ NGUYÊN ---
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [visible, setVisible] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const lastScrollY = useRef(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100 && window.scrollY > lastScrollY.current) {
                setVisible(false);
                setIsDropdownOpen(false);
            } else {
                setVisible(true);
            }
            lastScrollY.current = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
        navigate('/login');
    };
    
    return (
        // --- BƯỚC 1: THAY ĐỔI MÀU NỀN CỦA HEADER ---
        <header
            className={`bg-gradient-to-r from-[#2c1e5d] to-[#1a1138] shadow-lg fixed w-full top-0 z-50 transform transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link to="/">
                        <img 
                            src="/logo/light-text-logo.png"
                            alt="MyJob Logo" 
                            className="h-9 w-auto"
                        />
                    </Link>
                    <div className="h-8 w-px bg-white/20 hidden md:block"></div> 
                    
                    {/* --- BƯỚC 2: ĐIỀU CHỈNH MÀU TEXT CHO HÀI HÒA HƠN --- */}
                    <div className="hidden md:flex items-center space-x-2">
                        <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>Trang Chủ</NavLink>
                        <NavLink to="/jobs" className={({ isActive }) => `px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>Việc Làm</NavLink>
                        <NavLink to="/about" className={({ isActive }) => `px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}>Về Chúng Tôi</NavLink>
                    </div>
                </div>

                {/* --- BƯỚC 3: ĐIỀU CHỈNH MỘT SỐ MÀU SẮC NHỎ KHÁC --- */}
                <div className="flex items-center space-x-4">
                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-white font-semibold px-4 py-2 rounded-md hover:bg-white/10 transition-colors duration-300">Đăng nhập</Link>
                            <Link to="/register" className="bg-white text-[#2c1e5d] font-bold px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-300 shadow">Đăng ký</Link>
                        </div>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition">
                                <HiUserCircle className="text-white h-7 w-7" /> 
                                <span className="font-medium text-white">{user.name}</span>
                                <FaChevronDown className={`text-indigo-200 text-xs transition-transform ${isDropdownOpen && 'rotate-180'}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 animate-fade-in-down">
                                    <div className="px-4 py-2 border-b">
                                        <p className="font-bold text-gray-800 truncate">{user.name}</p>
                                        <p className="text-sm text-gray-500 capitalize">{user.role === 'employer' ? 'Nhà tuyển dụng' : 'Người tìm việc'}</p>
                                    </div>
                                    <ul className="mt-2">
                                        {user.role === 'employer' && (
                                            <li>
                                                <Link to="/employer" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                                                    <FaBriefcase />
                                                    <span>Quản lý tuyển dụng</span>
                                                </Link>
                                            </li>
                                        )}
                                        {user.role === 'jobseeker' && (
                                            <li>
                                                <Link to="/my-profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                                                    <FaUserCircle />
                                                    <span>Hồ sơ của tôi</span>
                                                </Link>
                                            </li>
                                        )}
                                        <li>
                                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition">
                                                <FaSignOutAlt />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}