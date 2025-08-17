import React, { useEffect, useState } from 'react';
import { FaSearch, FaUserEdit, FaTrashAlt, FaUserTag, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Import useAuth để lấy token

// Component RoleBadge (giữ nguyên)
const RoleBadge = ({ role }) => {
    const roleColors = {
        admin: 'bg-red-100 text-red-800',
        employer: 'bg-blue-100 text-blue-800',
        jobseeker: 'bg-green-100 text-green-800', // Sửa 'user' thành 'jobseeker' nếu cần
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
            <FaUserTag />
            <span className="capitalize">{role}</span>
        </span>
    );
};

export default function UsersManager() {
    const { token } = useAuth(); // Lấy token để xác thực API
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Thêm state để báo lỗi

    // === CẬP NHẬT LOGIC FETCH DỮ LIỆU ===
    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError("Không thể xác thực, vui lòng đăng nhập lại.");
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            try {
                // SỬA LỖI 1: Cập nhật endpoint API và thêm header Authorization
                const response = await fetch("http://localhost:8000/users/admin/all", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải danh sách người dùng. Vui lòng thử lại.');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error("Lỗi khi tải người dùng:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    // SỬA LỖI 2: Cập nhật logic lọc an toàn hơn
    const filteredUsers = users.filter(user => {
        const searchTerm = search.toLowerCase();
        // Kiểm tra an toàn với optional chaining (?.)
        return (
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.role?.toLowerCase().includes(searchTerm)
        );
    });

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xoá người dùng này? Thao tác này không thể hoàn tác.")) {
            try {
                // SỬA LỖI 3: Cập nhật endpoint API và thêm header
                const response = await fetch(`http://localhost:8000/users/admin/${id}`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setUsers(users.filter(u => u.id !== id));
                    alert("Xoá người dùng thành công.");
                } else {
                    const errorData = await response.json().catch(() => ({ detail: "Lỗi không xác định."}));
                    alert(`Có lỗi xảy ra khi xoá người dùng: ${errorData.detail}`);
                }
            } catch (error) {
                console.error("Lỗi khi xoá:", error);
                alert("Lỗi kết nối khi xoá người dùng.");
            }
        }
    };

    // Giao diện giữ nguyên, chỉ thêm phần hiển thị lỗi
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaSearch className="text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, vai trò..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition w-64"
                    />
                </div>
            </div>
            
            {/* Hiển thị thông báo lỗi nếu có */}
            {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                        <tr>
                            <th className="py-3 px-6">Họ tên</th>
                            <th className="py-3 px-6">Email</th>
                            <th className="py-3 px-6">Vai trò</th>
                            <th className="py-3 px-6">Ngày tạo</th>
                            <th className="py-3 px-6 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="py-6 px-6 text-center text-gray-500">
                                    <FaSpinner className="animate-spin inline-block mr-2" /> Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="py-4 px-6 font-medium text-gray-900">{user.name || 'Chưa cập nhật'}</td>
                                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                                <td className="py-4 px-6">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="py-4 px-6 text-gray-600">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="py-4 px-6 text-center space-x-2">
                                    <button
                                        title="Sửa"
                                        className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition"
                                        onClick={() => alert(`Sửa người dùng ${user.id} (chức năng chưa được cài đặt)`)}
                                    >
                                        <FaUserEdit />
                                    </button>
                                    <button
                                        title="Xoá"
                                        className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td className="py-6 px-6 text-center text-gray-500" colSpan="5">
                                    {search ? 'Không tìm thấy người dùng nào phù hợp.' : 'Chưa có người dùng nào.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}