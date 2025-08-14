// src/components/forms/UploadCVForm.js
import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaSpinner, FaUpload } from 'react-icons/fa';

export default function UploadCVForm({ initialData, onSave, isSubmitting }) {
    const [formData, setFormData] = useState({});
    const [cvFile, setCvFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Điền trước các thông tin chung từ profile chính
        if (initialData) {
            setFormData({
                desired_position: initialData.desired_position || '',
                desired_level: initialData.desired_level || '',
                education_level: initialData.education_level || '',
                experience_years: initialData.experience_years || '',
                // ... các trường khác bạn muốn điền sẵn
            });
        }
    }, [initialData]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) setCvFile(file);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!cvFile) {
            alert('Vui lòng chọn một tệp CV.');
            return;
        }
        // Vì có file upload, chúng ta phải dùng FormData
        const data = new FormData();
        data.append('cv_file', cvFile);
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tệp CV của bạn *</label>
                <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-myjob-purple hover:text-myjob-purple-dark focus-within:outline-none">
                                <span>Tải file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" ref={fileInputRef} />
                            </label>
                            <p className="pl-1">hoặc kéo thả vào đây</p>
                        </div>
                        {cvFile ? (
                            <p className="text-sm font-semibold text-green-600">{cvFile.name}</p>
                        ) : (
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX dung lượng tối đa 5MB</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Các trường thông tin chung */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Vị trí mong muốn *</label><input type="text" name="desired_position" value={formData.desired_position || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                <div><label className="block text-sm font-medium text-gray-700">Cấp bậc mong muốn *</label><input type="text" name="desired_level" value={formData.desired_level || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required /></div>
                {/* ... Thêm các trường select/input khác tương tự như GeneralInfoForm ... */}
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