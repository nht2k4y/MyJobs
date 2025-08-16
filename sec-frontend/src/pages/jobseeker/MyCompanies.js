// src/pages/jobseeker/MyCompanies.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaBriefcase, FaBookmark, FaSpinner } from 'react-icons/fa';

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const mockCompanies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    logo_url: 'https://placehold.co/100x100/7c3aed/ffffff/png?text=TS',
    cover_url: 'https://placehold.co/400x150/e9d5ff/7c3aed/png?text=TechCorp',
    industry: 'Công nghệ thông tin',
    location: 'TP. Hồ Chí Minh',
    size: '100-500 nhân viên',
    new_jobs_count: 5
  },
  {
    id: 2,
    name: 'Innovate Digital',
    logo_url: 'https://placehold.co/100x100/db2777/ffffff/png?text=ID',
    cover_url: 'https://placehold.co/400x150/fbcfe8/db2777/png?text=Innovate',
    industry: 'Marketing & Agency',
    location: 'Đà Nẵng',
    size: '50-100 nhân viên',
    new_jobs_count: 2
  },
  {
    id: 3,
    name: 'GreenLife Foods',
    logo_url: 'https://placehold.co/100x100/16a34a/ffffff/png?text=GF',
    cover_url: 'https://placehold.co/400x150/dcfce7/16a34a/png?text=GreenLife',
    industry: 'Thực phẩm & Đồ uống',
    location: 'Hà Nội',
    size: '500+ nhân viên',
    new_jobs_count: 0
  },
];


// --- CÁC COMPONENT CON ---
const CompanyCard = ({ company }) => {
    const handleUnfollow = (e) => {
        e.preventDefault(); // Ngăn thẻ Link điều hướng khi bấm nút
        alert(`Bạn đã bỏ theo dõi ${company.name}`);
        // Thêm logic gọi API để bỏ theo dõi ở đây
    };

    return (
        <Link to={`/companies/${company.id}`} className="block rounded-lg shadow-md overflow-hidden bg-white group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative">
                <img src={company.cover_url} alt={`${company.name} cover`} className="w-full h-32 object-cover" />
                <div className="absolute -bottom-10 left-4 w-20 h-20 rounded-full border-4 border-white bg-white shadow-md">
                    <img src={company.logo_url} alt={`${company.name} logo`} className="w-full h-full object-contain rounded-full" />
                </div>
            </div>
            <div className="p-4 pt-12"> {/* pt-12 để tạo khoảng trống cho logo */}
                <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-myjob-purple">{company.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><FaBuilding /> {company.industry}</p>
                <div className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5"><FaMapMarkerAlt /> {company.location}</div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5"><FaUsers /> {company.size}</div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <FaBriefcase />
                    {company.new_jobs_count > 0 ? `${company.new_jobs_count} việc làm mới` : 'Chưa có việc làm mới'}
                </p>
                <button 
                    onClick={handleUnfollow}
                    className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline"
                >
                    Bỏ theo dõi
                </button>
            </div>
        </Link>
    );
};

const EmptyState = ({ message, imageSrc }) => (
    <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
        <img src={imageSrc} alt="Empty state" className="h-40 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-700">Chưa có công ty nào</h3>
        <p className="text-gray-500 mt-2">{message}</p>
        <Link to="/companies" className="mt-6 inline-block bg-myjob-purple text-white font-bold px-6 py-2.5 rounded-md hover:opacity-90 transition">
            Tìm kiếm công ty ngay
        </Link>
    </div>
);


// --- COMPONENT CHÍNH ---
export default function MyCompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập việc gọi API
        const timer = setTimeout(() => {
            setCompanies(mockCompanies); // Dùng dữ liệu giả
            setLoading(false);
        }, 1000); // Giả lập độ trễ 1 giây

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <FaBookmark className="text-myjob-purple" />
                    Công ty của tôi
                </h2>
                <p className="mt-1 text-gray-500">Danh sách các công ty bạn đang theo dõi để nhận thông báo về việc làm mới nhất từ họ.</p>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <FaSpinner className="animate-spin inline-block text-4xl text-myjob-purple" />
                    <p className="mt-4 text-gray-600">Đang tải danh sách công ty...</p>
                </div>
            ) : companies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map(company => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            ) : (
                <EmptyState 
                    message="Hãy theo dõi một công ty để cập nhật những cơ hội việc làm tốt nhất!"
                    imageSrc="/images/undraw_building_re_xfcm.svg" // Tải ảnh này từ unDraw.co và đặt vào public/images
                />
            )}
        </div>
    );
}