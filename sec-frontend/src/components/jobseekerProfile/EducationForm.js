import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';

export default function EducationForm({ initialData, onSave, isSubmitting }) {
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        const data = initialData ? {
            ...initialData,
            start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
            end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        } : {};
        setFormData(data);
    }, [initialData]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
             <div><label className="block text-sm font-medium text-gray-700">Tên bằng cấp/chứng chỉ *</label><input type="text" name="degree_name" value={formData.degree_name || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Trường/Trung tâm đào tạo *</label><input type="text" name="school_name" value={formData.school_name || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Chuyên ngành đào tạo</label><input type="text" name="major" value={formData.major || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Ngày bắt đầu *</label><input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Ngày hoàn thành</label><input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Mô tả thêm</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="mt-1 w-full border p-2 rounded-md" /></div>
            <div className="flex justify-end pt-4 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 -mx-6">
                <button type="submit" disabled={isSubmitting} className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />} {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}