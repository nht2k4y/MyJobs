// src/pages/admin/AdminLayout.js
import React, { useState } from 'react'; // BƯỚC 1: Import thêm useState
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; 

// Các component SidebarSection và SidebarLink giữ nguyên, không thay đổi
const SidebarSection = ({ title, children }) => (
    <div className="mb-6">
        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3 px-2">{title}</p>
        <ul className="space-y-1">
            {children}
        </ul>
    </div>
);

const SidebarLink = ({ to, children }) => {
    const navLinkClasses = "flex items-center p-2 rounded-md hover:bg-gray-700 transition";
    const activeLinkClasses = "bg-teal-500 text-white font-bold";
    const inactiveLinkClasses = "text-gray-300";

    if (to === "#") {
        return (
            <li>
                <a href="#" className={`${navLinkClasses} ${inactiveLinkClasses}`} onClick={(e) => e.preventDefault()}>
                    {children}
                </a>
            </li>
        );
    }

    return (
        <li>
            <NavLink 
                to={to} 
                end 
                className={({ isActive }) => 
                    `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                }
            >
                {children}
            </NavLink>
        </li>
    );
};


export default function AdminLayout() {
    const navigate = useNavigate();
    // BƯỚC 2: Thêm state để kiểm soát quá trình đăng xuất
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useAuth();

    const handleLogout = () => {
        // Chỉ cần gọi hàm logout từ context.
        // ProtectedRoute sẽ tự động xử lý việc chuyển hướng.
        logout();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar giữ nguyên */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
                <h2 className="text-2xl font-bold mb-8 text-center text-white">
                    MyJob <span className="text-teal-400">Admin</span>
                </h2>
                
                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Các section của sidebar giữ nguyên */}
                    <SidebarSection title="Tổng quan">
                        <SidebarLink to="/admin">Bảng điều khiển</SidebarLink> 
                        <SidebarLink to="/admin/notifications">Thông báo</SidebarLink>
                    </SidebarSection>
                    
                    <SidebarSection title="Xác thực">
                        <SidebarLink to="/admin/users">Người dùng</SidebarLink>
                        <SidebarLink to="#">Token quên mật khẩu</SidebarLink>
                    </SidebarSection>

                    <SidebarSection title="Quản lý chung">
                        <SidebarLink to="/admin/careers">Ngành nghề</SidebarLink>
                        <SidebarLink to="/admin/locations">Khu vực</SidebarLink>
                    </SidebarSection>

                    <SidebarSection title="Thông tin">
                        <SidebarLink to="#">Công ty</SidebarLink> 
                        <SidebarLink to="#">Công ty đã theo dõi</SidebarLink>
                        <SidebarLink to="#">Hồ sơ người tìm việc</SidebarLink>
                        <SidebarLink to="#">CV đã tải lên</SidebarLink>
                        <SidebarLink to="#">CV đã lưu</SidebarLink>
                        <SidebarLink to="#">CV đã xem</SidebarLink>
                    </SidebarSection>

                    <SidebarSection title="Việc làm">
                        <SidebarLink to="/admin/approval">Duyệt bài đăng</SidebarLink>
                        <SidebarLink to="#">Tất cả bài đăng</SidebarLink>
                        <SidebarLink to="#">Hoạt động bài đăng</SidebarLink>
                        <SidebarLink to="#">Việc làm đã lưu</SidebarLink>
                    </SidebarSection>

                     <SidebarSection title="MyJob">
                        <SidebarLink to="#">Banner</SidebarLink> 
                    </SidebarSection>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-bold"
                    >
                        <FaSignOutAlt />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}