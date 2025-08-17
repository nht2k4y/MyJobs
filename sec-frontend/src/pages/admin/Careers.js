import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrashAlt, FaBriefcase } from 'react-icons/fa';

// API URL - Nên đặt ở file config chung
const API_URL = "http://localhost:8000";

export default function Careers() {
    const [careers, setCareers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Hàm fetch dữ liệu từ backend
    const fetchCareers = async () => {
        try {
            const response = await fetch(`${API_URL}/careers/`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            setCareers(data);
        } catch (error) {
            console.error("Lỗi khi tải ngành nghề:", error);
            alert("Không thể tải danh sách ngành nghề từ server.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component được mount
    useEffect(() => {
        fetchCareers();
    }, []);

    const filteredCareers = careers.filter(career =>
        career.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddCareer = async () => {
        const newCareerName = prompt("Nhập tên ngành nghề mới:");
        if (newCareerName && newCareerName.trim() !== '') {
            try {
                const response = await fetch(`${API_URL}/careers/admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCareerName.trim() })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Có lỗi xảy ra");
                }
                // Tải lại danh sách sau khi thêm thành công
                fetchCareers(); 
            } catch (error) {
                alert(`Lỗi khi thêm: ${error.message}`);
            }
        }
    };

    const handleEditCareer = async (id, currentName) => {
        const updatedName = prompt(`Sửa tên ngành nghề '${currentName}':`, currentName);
        if (updatedName && updatedName.trim() !== '' && updatedName !== currentName) {
            try {
                await fetch(`${API_URL}/careers/admin/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: updatedName.trim() })
                });
                fetchCareers();
            } catch (error) {
                alert("Lỗi khi cập nhật.");
            }
        }
    };

    const handleDeleteCareer = async (id, name) => {
        if (window.confirm(`Bạn có chắc muốn xoá ngành nghề '${name}'?`)) {
            try {
                await fetch(`${API_URL}/careers/admin/${id}`, { method: 'DELETE' });
                // Thay vì fetch lại, có thể lọc trên frontend để nhanh hơn
                setCareers(careers.filter(c => c.id !== id));
            } catch (error) {
                alert("Lỗi khi xoá.");
            }
        }
    };

    // Giao diện giữ nguyên như thiết kế trước
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Ngành nghề</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaSearch className="text-gray-400" /></span><input type="text" placeholder="Tìm ngành nghề..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition w-full"/></div>
                    <button onClick={handleAddCareer} className="flex-shrink-0 flex items-center gap-2 bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition"><FaPlus /><span>Thêm mới</span></button>
                </div>
            </div>
            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-semibold"><tr><th className="py-3 px-6">#</th><th className="py-3 px-6">Tên Ngành nghề</th><th className="py-3 px-6 text-center">Hành động</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (<tr><td colSpan="3" className="py-6 px-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>) : 
                        filteredCareers.length > 0 ? filteredCareers.map((career, index) => (
                            <tr key={career.id} className="hover:bg-gray-50">
                                <td className="py-4 px-6 font-medium text-gray-500">{index + 1}</td>
                                <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-2"><FaBriefcase className="text-teal-500" /><span>{career.name}</span></td>
                                <td className="py-4 px-6 text-center space-x-2">
                                    <button title="Sửa" className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition" onClick={() => handleEditCareer(career.id, career.name)}><FaEdit /></button>
                                    <button title="Xoá" className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition" onClick={() => handleDeleteCareer(career.id, career.name)}><FaTrashAlt /></button>
                                </td>
                            </tr>
                        )) : (<tr><td className="py-6 px-6 text-center text-gray-500" colSpan="3">Không có ngành nghề nào.</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}