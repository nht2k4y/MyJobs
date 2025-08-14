// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout'; // Import AdminLayout
import EmployerLayout from './EmployerLayout'; // Import EmployerLayout (nếu cần)

export default function ProtectedRoute({ children, role }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Rất quan trọng: Chờ cho đến khi AuthContext xác định xong trạng thái đăng nhập
    if (isLoading) {
        // Bạn có thể hiển thị một spinner toàn màn hình ở đây
        return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
    }

    // Nếu không loading nữa và không có user, chuyển hướng đến trang login
    if (!user) {
        // Lưu lại trang hiện tại để có thể quay lại sau khi đăng nhập thành công
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu có yêu cầu về role, và role của user không khớp
    if (role && user.role !== role) {
        // Chuyển hướng về trang chủ hoặc trang dashboard của vai trò tương ứng nếu muốn
        // Ở đây, chuyển về trang chủ là an toàn nhất.
        console.warn(`Truy cập bị từ chối. Yêu cầu role: ${role}, user có role: ${user.role}.`);
        return <Navigate to="/" replace />;
    }

    // Nếu tất cả điều kiện đều ổn, render component con (children)
    // children ở đây chính là <AdminLayout /> hoặc <EmployerLayout />
    return children;
}