// src/components/ProfileUpdateForm.js
import React, { useState, useEffect } from 'react';
import LocationDropdown from '../LocationDropdown'; // Gọi lại component chọn địa chỉ
import { FaSave, FaSpinner } from 'react-icons/fa';

export default function ProfileUpdateForm({ initialData, onSave, isSubmitting }) {
    const [formData, setFormData] = useState({});

    // Sử dụng useEffect để điền dữ liệu vào form khi component nhận được initialData
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                phone_number: initialData.phone_number || '',
                // Chuyển đổi định dạng ngày tháng cho thẻ input type="date"
                date_of_birth: initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : '',
                gender: initialData.gender || '',
                marital_status: initialData.marital_status || '',
                location_id: initialData.location_id || '',
                address: initialData.address || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Gọi hàm onSave được truyền từ component cha
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh *</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                    <input type="tel" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tình trạng hôn nhân *</label>
                    <select name="marital_status" value={formData.marital_status || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required>
                        <option value="">Chọn tình trạng</option>
                        <option value="Độc thân">Độc thân</option>
                        <option value="Đã kết hôn">Đã kết hôn</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Giới tính *</label>
                    <select name="gender" value={formData.gender || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required>
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
                    {/* Sử dụng lại component LocationDropdown */}
                    <LocationDropdown 
                        name="location_id"
                        value={formData.location_id || ''}
                        onChange={handleChange}
                        className="mt-1 w-full border p-2 rounded-md"
                        required={true}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ chi tiết *</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" placeholder="VD: 123 Đường ABC, Phường XYZ..." required />
            </div>
            <div className="flex justify-end pt-4 border-t mt-6">
                <button type="submit" disabled={isSubmitting} className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}