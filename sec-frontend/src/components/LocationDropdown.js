// src/components/LocationDropdown.js
import React, { useState, useEffect } from 'react';

const API_URL = "http://localhost:8000";

// Đổi tên component và default prop 'name'
export default function LocationDropdown({ value, onChange, name = "location_id", required = true, className }) {
    // Đổi tên state
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Đổi tên hàm fetch và endpoint API
        const fetchLocations = async () => {
            try {
                const response = await fetch(`${API_URL}/locations/`);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setLocations(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách khu vực:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
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
                // Đổi văn bản loading
                <option className="text-black" value="">Đang tải khu vực...</option>
            ) : (
                <>
                    {/* Đổi văn bản mặc định */}
                    <option className="text-black" value="">-- Chọn khu vực --</option>
                    {/* Đổi biến lặp */}
                    {locations.map(location => (
                        <option className="text-black" key={location.id} value={location.id}>
                            {location.name}
                        </option>
                    ))}
                </>
            )}
        </select>
    );
}