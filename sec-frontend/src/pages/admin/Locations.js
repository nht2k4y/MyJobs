// sec-frontend/src/pages/admin/Locations.js

import React, { useState, useEffect } from 'react';
// Đổi icon FaBriefcase thành FaMapMarkerAlt cho phù hợp hơn
import { FaPlus, FaSearch, FaEdit, FaTrashAlt, FaMapMarkerAlt } from 'react-icons/fa';

// API URL của backend
const API_URL = "http://localhost:8000";

export default function Locations() {
    // Đổi tên các state từ "career" thành "location"
    const [locations, setLocations] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Hàm fetch dữ liệu khu vực từ backend
    const fetchLocations = async () => {
        try {
            // Đổi endpoint từ /careers/ thành /locations/
            const response = await fetch(`${API_URL}/locations/`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.error("Lỗi khi tải khu vực:", error);
            alert("Không thể tải danh sách khu vực từ server.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component được mount
    useEffect(() => {
        fetchLocations();
    }, []);

    // Lọc danh sách khu vực dựa trên từ khóa tìm kiếm
    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(search.toLowerCase())
    );

    // Hàm xử lý thêm khu vực mới
    const handleAddLocation = async () => {
        const newLocationName = prompt("Nhập tên khu vực mới (Tỉnh/Thành phố):");
        if (newLocationName && newLocationName.trim() !== '') {
            try {
                // Đổi endpoint và dữ liệu gửi đi
                const response = await fetch(`${API_URL}/locations/admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newLocationName.trim() })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Có lỗi xảy ra");
                }
                // Tải lại danh sách sau khi thêm thành công
                fetchLocations(); 
            } catch (error) {
                alert(`Lỗi khi thêm: ${error.message}`);
            }
        }
    };

    // Hàm xử lý sửa tên khu vực
    const handleEditLocation = async (id, currentName) => {
        const updatedName = prompt(`Sửa tên khu vực '${currentName}':`, currentName);
        if (updatedName && updatedName.trim() !== '' && updatedName !== currentName) {
            try {
                // Đổi endpoint
                await fetch(`${API_URL}/locations/admin/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: updatedName.trim() })
                });
                fetchLocations();
            } catch (error) {
                alert("Lỗi khi cập nhật.");
            }
        }
    };

    // Hàm xử lý xoá khu vực
    const handleDeleteLocation = async (id, name) => {
        if (window.confirm(`Bạn có chắc muốn xoá khu vực '${name}'?`)) {
            try {
                // Đổi endpoint
                await fetch(`${API_URL}/locations/admin/${id}`, { method: 'DELETE' });
                // Cập nhật state trên frontend để giao diện phản hồi ngay lập tức
                setLocations(locations.filter(l => l.id !== id));
            } catch (error) {
                alert("Lỗi khi xoá.");
            }
        }
    };

    // Giao diện (JSX)
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Khu vực</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaSearch className="text-gray-400" /></span>
                        <input 
                            type="text" 
                            placeholder="Tìm khu vực..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            className="pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition w-full"
                        />
                    </div>
                    <button onClick={handleAddLocation} className="flex-shrink-0 flex items-center gap-2 bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition">
                        <FaPlus /><span>Thêm mới</span>
                    </button>
                </div>
            </div>
            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                        <tr>
                            <th className="py-3 px-6">#</th>
                            <th className="py-3 px-6">Tên Khu vực</th>
                            <th className="py-3 px-6 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="3" className="py-6 px-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : filteredLocations.length > 0 ? filteredLocations.map((location, index) => (
                            <tr key={location.id} className="hover:bg-gray-50">
                                <td className="py-4 px-6 font-medium text-gray-500">{index + 1}</td>
                                <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-teal-500" />
                                    <span>{location.name}</span>
                                </td>
                                <td className="py-4 px-6 text-center space-x-2">
                                    <button title="Sửa" className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition" onClick={() => handleEditLocation(location.id, location.name)}>
                                        <FaEdit />
                                    </button>
                                    <button title="Xoá" className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition" onClick={() => handleDeleteLocation(location.id, location.name)}>
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td className="py-6 px-6 text-center text-gray-500" colSpan="3">Không có khu vực nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}