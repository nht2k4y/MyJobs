import React, { useEffect, useState } from 'react';
// Import các icon để giao diện sinh động
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaTrashAlt, 
    FaUserPlus,
    FaHistory, 
    FaRegBell
} from 'react-icons/fa';
// Thư viện để hiển thị thời gian thân thiện (ví dụ: "5 phút trước")
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// DỮ LIỆU GIẢ (MOCK DATA)
const mockActivities = [
    {
        id: 1,
        admin_email: 'admin@myjob.com',
        action_type: 'POST_APPROVED',
        description: "Đã duyệt bài đăng: 'Senior Frontend Developer (ReactJS)'",
        created_at: new Date(Date.now() - 5 * 60 * 1000), // 5 phút trước
    },
    {
        id: 2,
        admin_email: 'superadmin@myjob.com',
        action_type: 'USER_DELETED',
        description: "Đã xóa người dùng: 'testuser@example.com'",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
    },
    {
        id: 3,
        admin_email: 'admin@myjob.com',
        action_type: 'POST_REJECTED',
        description: "Đã từ chối bài đăng: 'Tuyển nhân viên bán hàng'",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
    },
    {
        id: 4,
        admin_email: 'system',
        action_type: 'USER_CREATED',
        description: "Người dùng mới đăng ký: 'new_employer@company.com' (Vai trò: employer)",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
    },
];

// Một đối tượng map để chọn icon dựa trên loại hành động
const actionIcons = {
    "POST_APPROVED": <FaCheckCircle className="text-green-500" />,
    "POST_REJECTED": <FaTimesCircle className="text-red-500" />,
    "USER_DELETED": <FaTrashAlt className="text-gray-500" />,
    "USER_CREATED": <FaUserPlus className="text-blue-500" />,
    // Thêm các loại hành động khác ở đây
    "DEFAULT": <FaHistory className="text-gray-400" />
};

export default function Notifications() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập việc tải dữ liệu từ API
        const timer = setTimeout(() => {
            setActivities(mockActivities);
            setLoading(false);
        }, 1000); // Giả lập độ trễ 1 giây

        // Dọn dẹp timer khi component bị unmount
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Nhật ký hoạt động</h2>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FaRegBell />
                    <span>Hoạt động gần đây</span>
                </span>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-10">Đang tải nhật ký...</p>
            ) : activities.length === 0 ? (
                <div className="text-center py-16">
                    <FaHistory className="mx-auto text-5xl text-gray-300" />
                    <p className="mt-4 text-lg font-semibold text-gray-600">Chưa có hoạt động nào</p>
                    <p className="text-gray-500">Mọi hành động quan trọng trong trang quản trị sẽ được ghi lại ở đây.</p>
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-mb-8">
                        {activities.map((activity, index) => (
                            <li key={activity.id}>
                                <div className="relative pb-8">
                                    {/* Đường kẻ dọc, không vẽ cho item cuối cùng */}
                                    {index !== activities.length - 1 ? (
                                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    ) : null}
                                    
                                    <div className="relative flex items-start space-x-3">
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                                {actionIcons[activity.action_type] || actionIcons["DEFAULT"]}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-medium text-gray-900">{activity.admin_email}</span>
                                                    {' đã thực hiện hành động'}
                                                </p>
                                            </div>
                                            <div className="mt-1 text-sm text-gray-700">
                                                <p>{activity.description}</p>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400">
                                                {/* Hiển thị thời gian dạng "khoảng 5 phút trước" */}
                                                <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: vi })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}