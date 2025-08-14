// src/components/forms/SkillForm.js
import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner, FaStar } from 'react-icons/fa';

// === SỬA LỖI: Đổi tên component con để tránh xung đột ===
const ProficiencyStars = ({ level, onLevelChange }) => {
    return (
        <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button type="button" key={index} onClick={() => onLevelChange(ratingValue)}>
                        <FaStar
                            size={24}
                            className="cursor-pointer transition-colors"
                            color={ratingValue <= level ? "#ffc107" : "#e4e5e9"}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default function SkillForm({ initialData, onSave, isSubmitting, skillType = 'technical' }) {
    const [formData, setFormData] = useState({ proficiency_level: 0 });
    
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset form khi thêm mới, đảm bảo proficiency_level có giá trị mặc định
            setFormData({ proficiency_level: 0 });
        }
    }, [initialData]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleLevelChange = (level) => setFormData({ ...formData, proficiency_level: level });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    
    const nameField = skillType === 'language' ? 'language_name' : 'skill_name';
    const labelText = skillType === 'language' ? 'Ngôn ngữ *' : 'Tên kỹ năng *';

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
             <div>
                <label className="block text-sm font-medium text-gray-700">{labelText}</label>
                <input type="text" name={nameField} value={formData[nameField] || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Trình độ</label>
                {/* Sử dụng tên component mới */}
                <ProficiencyStars level={formData.proficiency_level} onLevelChange={handleLevelChange} />
            </div>
            <div className="flex justify-end pt-4 border-t mt-6 sticky bottom-0 bg-white py-4 px-6 -mx-6">
                <button type="submit" disabled={isSubmitting} className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />} {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
}