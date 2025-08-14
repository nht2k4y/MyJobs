import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';

export default function CertificateForm({ initialData, onSave, isSubmitting }) {
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        const data = initialData ? {
            ...initialData,
            issue_date: initialData.issue_date ? new Date(initialData.issue_date).toISOString().split('T')[0] : '',
            expiry_date: initialData.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : '',
        } : {};
        setFormData(data);
    }, [initialData]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
             <div><label className="block text-sm font-medium text-gray-700">Tên chứng chỉ *</label><input type="text" name="certificate_name" value={formData.certificate_name || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Trường/Trung tâm đào tạo</label><input type="text" name="issuing_organization" value={formData.issuing_organization || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Ngày cấp *</label><input type="date" name="issue_date" value={formData.issue_date || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Ngày hết hạn</label><input type="date" name="expiry_date" value={formData.expiry_date || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" /></div>
            </div>
            <div className="flex justify-end pt-4 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 -mx-6">
                <button type="submit" disabled={isSubmitting} className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />} {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}