// src/components/CareerDropdown.js
import React, { useState, useEffect } from 'react';

const API_URL = "http://localhost:8000";

export default function CareerDropdown({ value, onChange, name = "career_id", required = true, className }) {
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch(`${API_URL}/careers/`);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setCareers(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách ngành nghề:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCareers();
    }, []);

    const finalClassName = className 
        ? className 
        : "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition";

    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={loading}
            className={finalClassName}
            required={required}
        >
            {loading ? (
                // === THÊM CLASS Ở ĐÂY ===
                <option className="text-black" value="">Đang tải ngành nghề...</option>
            ) : (
                <>
                    {/* === VÀ CẢ Ở ĐÂY === */}
                    <option className="text-black" value="">-- Chọn ngành nghề --</option>
                    {careers.map(career => (
                        // === VÀ Ở ĐÂY ===
                        <option className="text-black" key={career.id} value={career.id}>
                            {career.name}
                        </option>
                    ))}
                </>
            )}
        </select>
    );
}