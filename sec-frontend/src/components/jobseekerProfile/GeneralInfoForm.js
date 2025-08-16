import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';

// THÊM MỚI: Import 2 component dropdown có sẵn của bạn
import CareerDropdown from '../../components/CareerDropdown';
import LocationDropdown from '../../components/LocationDropdown';

export default function GeneralInfoForm({ initialData, onSave, isSubmitting }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Gán giá trị ban đầu, đảm bảo các ID là chuỗi rỗng nếu null/undefined
        if (initialData) {
            setFormData({
                ...initialData,
                career_id: initialData.career_id || '',
                location_id: initialData.location_id || '',
            });
        }
    }, [initialData]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Các trường input cũ giữ nguyên */}
                <div><label className="block text-sm font-medium text-gray-700">Vị trí mong muốn *</label><input type="text" name="desired_position" value={formData.desired_position || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Cấp bậc mong muốn *</label><input type="text" name="desired_level" value={formData.desired_level || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Trình độ học vấn *</label><input type="text" name="education_level" value={formData.education_level || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Kinh nghiệm làm việc *</label><input type="text" name="experience_years" value={formData.experience_years || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Lương tối thiểu (VND) *</label><input type="number" name="min_salary" value={formData.min_salary || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Lương tối đa (VND) *</label><input type="number" name="max_salary" value={formData.max_salary || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>

                {/* ========================================================== */}
                {/* === THAY ĐỔI VÀ BỔ SUNG CÁC TRƯỜNG DROPDOWN === */}
                {/* ========================================================== */}

                {/* THÊM MỚI: Sử dụng CareerDropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngành nghề *</label>
                    <CareerDropdown
                        name="career_id"
                        value={formData.career_id || ''}
                        onChange={handleChange}
                        required={true}
                        className="mt-1 w-full border p-2 rounded-md"
                    />
                </div>

                {/* SỬA LẠI: Thay thế input "Nơi làm việc" bằng LocationDropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Địa điểm làm việc *</label>
                    <LocationDropdown
                        name="location_id"
                        value={formData.location_id || ''}
                        onChange={handleChange}
                        required={true}
                        className="mt-1 w-full border p-2 rounded-md"
                    />
                </div>

                {/* CẢI TIẾN: Chuyển các trường còn lại thành select để dữ liệu đồng nhất */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Nơi làm việc mong muốn *</label>
                    <select name="workplace_type" value={formData.workplace_type || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required>
                        <option value="">-- Chọn nơi làm việc --</option>
                        <option value="Tại văn phòng">Tại văn phòng</option>
                        <option value="Từ xa">Từ xa (Remote)</option>
                        <option value="Linh hoạt">Linh hoạt (Hybrid)</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Hình thức làm việc *</label>
                    <select name="employment_type" value={formData.employment_type || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required>
                        <option value="">-- Chọn hình thức --</option>
                        <option value="Toàn thời gian">Toàn thời gian</option>
                        <option value="Bán thời gian">Bán thời gian</option>
                        <option value="Thực tập">Thực tập</option>
                        <option value="Thời vụ">Thời vụ / Hợp đồng</option>
                    </select>
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700">Mục tiêu nghề nghiệp</label>
                 <textarea name="career_goals" value={formData.career_goals || ''} onChange={handleChange} rows="5" className="mt-1 w-full border p-2 rounded-md" />
            </div>
            <div className="flex justify-end pt-4 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 -mx-6">
                <button type="submit" disabled={isSubmitting} className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}