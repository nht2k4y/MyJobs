// src/pages/jobseeker/Settings.js
import React, { useState, useEffect, useCallback, useRef  } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaEdit, FaSpinner, FaTimes } from 'react-icons/fa';
import ProfileUpdateForm from '../../components/jobseekerProfile/ProfileUpdateForm'; // Import component form mới

// Component Modal được tách ra để code sạch hơn
const EditInfoModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Component chính của trang
export default function SettingsPage() {
    const { user, token, login  } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // === BẮT ĐẦU SỬA LỖI: Thêm state cho upload avatar ===
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null); // Để trigger click vào input file ẩn

    const fetchProfile = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/jobseeker-profiles/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Không thể tải dữ liệu hồ sơ.');
            const data = await res.json();
            setProfileData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSavePersonalInfo = async (updatedData) => {
        setIsSubmitting(true);
        console.log("Đang lưu thông tin cá nhân:", updatedData);
        try {
            const res = await fetch('http://localhost:8000/users/me/update-personal-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if(!res.ok) throw new Error("Lỗi khi cập nhật thông tin.");
            
            // === SỬA LỖI: Lấy dữ liệu mới trực tiếp từ response ===
            const newProfileData = await res.json();
            setProfileData(newProfileData); // Cập nhật state với dữ liệu mới nhất
            
            alert('Cập nhật thông tin thành công!');
            setIsModalOpen(false);
            // fetchProfile(); // <-- BỎ DÒNG NÀY ĐI, không cần gọi lại API nữa

        } catch(error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Tạo ảnh preview
        setAvatarPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('avatar_file', file);

        try {
            const res = await fetch('http://localhost:8000/users/me/upload-avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Lỗi khi tải ảnh lên.');

            const updatedUser = await res.json();
            
            // Cập nhật lại AuthContext và state để ảnh hiển thị ngay lập tức
            const updatedProfile = { ...profileData, user: updatedUser };
            setProfileData(updatedProfile);
            
            // Cập nhật lại localStorage và context
            const fullApiResponseForLogin = { access_token: token, ...updatedUser };
            login(fullApiResponseForLogin);

            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            alert(error.message);
            setAvatarPreview(null); // Reset preview nếu lỗi
        }
    };
    
    const handleUpdatePassword = () => {
      alert('Chức năng đổi mật khẩu sẽ được thực hiện ở đây.');
    };
    
    const handleUpdateSettings = () => {
      alert('Đã lưu cài đặt (giả lập).');
    };

    if (loading) {
        return <div className="p-8 text-center"><FaSpinner className="animate-spin inline mr-2" /> Đang tải dữ liệu...</div>;
    }

    if (!profileData) {
        return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu hồ sơ.</div>;
    }

    // Gộp thông tin từ user và profile để dễ sử dụng
    const displayData = {
        name: profileData.user?.name,
        email: profileData.user?.email,
        avatar_url: profileData.user?.avatar_url,
        phone_number: profileData.user?.phone_number,
        ...profileData
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Cột trái: Thông tin tài khoản */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">Thông tin tài khoản</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <img 
                                src={avatarPreview || (displayData.avatar_url ? `http://localhost:8000${displayData.avatar_url}` : '/default-avatar.png')} 
                                alt="Avatar" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-myjob-purple mb-2" 
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                            />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="text-sm text-myjob-purple font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                <FaEdit /> Ảnh đại diện
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                            <input type="text" value={displayData.name || ''} readOnly className="mt-1 w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={displayData.email || ''} readOnly className="mt-1 w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="flex items-center gap-2">
                                <input type="password" value="************" readOnly className="mt-1 w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed" />
                                <button onClick={handleUpdatePassword} className="mt-1 text-sm font-semibold text-myjob-purple whitespace-nowrap">Thay đổi</button>
                            </div>
                        </div>
                        <div className="pt-2">
                             <button className="w-full bg-myjob-purple text-white font-bold py-2 rounded-md hover:opacity-90">CẬP NHẬT</button>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Thông tin cá nhân và cài đặt */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Box thông tin cá nhân */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                            <button onClick={() => setIsModalOpen(true)} className="text-orange-500 hover:text-orange-700 p-2 rounded-full bg-orange-100">
                                <FaEdit />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div><strong className="font-medium text-gray-500 block">Họ và tên:</strong> <span className="text-gray-800">{displayData.name}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Tỉnh/Thành phố:</strong> <span className="text-gray-800">{displayData.location?.name || 'Chưa cập nhật'}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Số điện thoại:</strong> <span className="text-gray-800">{displayData.phone_number || 'Chưa cập nhật'}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Quận/Huyện:</strong> <span className="text-gray-800">{'Chưa có'}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Giới tính:</strong> <span className="text-gray-800">{displayData.gender || 'Chưa cập nhật'}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Địa chỉ:</strong> <span className="text-gray-800">{displayData.address || 'Chưa cập nhật'}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Ngày sinh:</strong> <span className="text-gray-800">{displayData.date_of_birth ? new Date(displayData.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span></div>
                            <div><strong className="font-medium text-gray-500 block">Tình trạng hôn nhân:</strong> <span className="text-gray-800">{displayData.marital_status || 'Chưa cập nhật'}</span></div>
                        </div>
                    </div>

                    {/* Box cài đặt */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h3 className="text-xl font-bold mb-4 text-gray-800">Cài đặt</h3>
                         <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-myjob-purple focus:ring-myjob-purple" />
                                <span className="text-sm text-gray-700">Cho phép gửi email</span>
                            </label>
                             <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-myjob-purple focus:ring-myjob-purple" />
                                <span className="text-sm text-gray-700">Cho phép gửi tin nhắn SMS</span>
                            </label>
                         </div>
                         <div className="pt-6">
                            <button onClick={handleUpdateSettings} className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90">CẬP NHẬT</button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Modal chỉnh sửa giờ sẽ gọi component form riêng */}
            <EditInfoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <ProfileUpdateForm
                    initialData={displayData}
                    onSave={handleSavePersonalInfo}
                    isSubmitting={isSubmitting}
                />
            </EditInfoModal>
        </>
    );
}