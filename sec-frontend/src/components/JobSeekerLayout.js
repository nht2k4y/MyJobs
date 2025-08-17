import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
    FaUserCircle, 
    FaFileContract, 
    FaBriefcase, 
    FaBuilding, 
    FaBell, 
    FaCog 
} from 'react-icons/fa';

// Component NavTab đã được thiết kế lại, không cần thay đổi
const NavTab = ({ to, icon, label }) => (
    <NavLink
        to={to}
        // SỬA LỖI: Cập nhật điều kiện 'end' để khớp với route gốc mới
        end={to === "/my-profile"} 
        className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-4 font-semibold border-b-2 transition-colors duration-300 ${
                isActive 
                ? 'text-myjob-purple border-myjob-purple' 
                : 'text-gray-600 border-transparent hover:text-myjob-purple'
            }`
        }
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export default function JobSeekerLayout() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Thanh điều hướng ngang mới */}
            <nav className="flex items-center space-x-4 sm:space-x-6 border-b border-gray-200 overflow-x-auto">
                {/* 
                  SỬA LỖI: Cập nhật tất cả các đường dẫn 'to' để bắt đầu bằng /my-profile
                */}
                <NavTab to="/my-profile" icon={<FaUserCircle />} label="MY MYJOB" />
                <NavTab to="/my-profile/profile" icon={<FaFileContract />} label="Hồ sơ xin việc" />
                <NavTab to="/my-profile/myjobs" icon={<FaBriefcase />} label="Việc làm của tôi" />
                <NavTab to="/my-profile/mycompanies" icon={<FaBuilding />} label="Công ty của tôi" />
                <NavTab to="/my-profile/notifications" icon={<FaBell />} label="MyJob Thông báo" />
                <NavTab to="/my-profile/settings" icon={<FaCog />} label="Tài khoản & Cài đặt" />
            </nav>

            {/* Vùng hiển thị nội dung chính */}
            <main className="py-8">
                <Outlet />
            </main>
        </div>
    );
}