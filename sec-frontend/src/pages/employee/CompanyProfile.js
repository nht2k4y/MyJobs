import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// Import các icon cần thiết từ thư viện Heroicons
import {
    BriefcaseIcon,
    UsersIcon,
    CalendarIcon,
    GlobeAltIcon,
    EnvelopeIcon,
    MapPinIcon,
    ShareIcon,
    HashtagIcon, // Icon cho Mã số thuế
} from "@heroicons/react/24/outline";

export default function CompanyProfile() {
    // --- PHẦN LOGIC LẤY DỮ LIỆU CỦA BẠN - GIỮ NGUYÊN HOÀN TOÀN ---
    const { employerId } = useParams();
    const [company, setCompany] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`http://localhost:8000/company/${employerId}`);
                if (!res.ok) throw new Error("Lỗi khi gọi API thông tin công ty");
                const data = await res.json();
                setCompany(data);
            } catch (err) {
                console.error("❌ Lỗi tải công ty:", err.message);
            }
        };
        fetchCompany();
    }, [employerId]);

    if (!company) {
        return <div className="p-6 text-center">Đang tải thông tin công ty...</div>;
    }

    // --- CÁC BIẾN CỦA BẠN - GIỮ NGUYÊN HOÀN TOÀN ---
    const {
        company_name, tax_code, industry, size, founded_date,
        website, facebook, linkedin, youtube, email,
        city, district, address, latitude, longitude,
        description, logo_filename, cover_image_filename // Sử dụng đúng biến cover_image_filename
    } = company;

    const fullAddress = [address, district, city].filter(Boolean).join(", ");
    // Định dạng lại ngày tháng cho đẹp hơn
    const formattedDate = founded_date ? new Date(founded_date).toLocaleDateString('vi-VN') : "Invalid Date";
    // --- KẾT THÚC PHẦN GIỮ NGUYÊN ---

    

    // --- PHẦN GIAO DIỆN (JSX) ĐÃ ĐƯỢC THAY ĐỔI ĐỂ GIỐNG MẪU ---
    return (
        <div className="bg-slate-50">
            {/* PHẦN 1: BANNER */}
            <div
                className="w-full h-60 bg-cover bg-center"
                style={{
                    backgroundImage: company.cover_filename
                    ? `url(http://localhost:8000/static/company/${company.cover_filename})`
                    : "linear-gradient(...)"
                }}
            />

            {/* Container chính cho nội dung bên dưới banner */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* PHẦN 2: THẺ THÔNG TIN CHÍNH (FLOATING CARD) */}
                <div className="bg-white rounded-lg shadow-lg p-6 -mt-20 transform">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        {/* Bên trái: Logo & Thông tin cơ bản */}
                        <div className="flex items-center w-full md:w-auto">
                            <img
                                src={`http://localhost:8000/static/company/${logo_filename}`}
                                alt="Company Logo"
                                className="w-28 h-28 object-contain rounded-md border-4 border-white shadow-md bg-white flex-shrink-0"
                            />
                            <div className="ml-6 flex-grow">
                                <h1 className="text-3xl font-bold text-slate-800">{company_name}</h1>
                                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap text-sm text-gray-600 gap-x-6 gap-y-2">
                                    <span className="flex items-center">
                                        <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-500" />
                                        {industry || "N/A"}
                                    </span>
                                    <span className="flex items-center">
                                        <UsersIcon className="w-4 h-4 mr-2 text-gray-500" />
                                        {size || "N/A"}
                                    </span>
                                    <span className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                                        {formattedDate}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bên phải: QR & Nút chia sẻ */}
                        {/* Phần bên phải: QR & Nút chia sẻ */}
                        <div className="flex items-center gap-4 mt-6 md:mt-0 flex-shrink-0">
                            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-500 p-1 rounded">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}`} alt="QR Code" />
                            </div>
                            <button className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow">
                                <ShareIcon className="w-5 h-5 mr-2" />
                                Chia sẻ
                            </button>
                        </div>
                    </div>
                </div>

                {/* PHẦN 3: NỘI DUNG CHÍNH (2 CỘT) */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột trái (rộng hơn) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Về công ty</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {description || "Chưa có mô tả về công ty."}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Việc làm đang tuyển</h2>
                            <div className="text-gray-500">
                                Hiện chưa có tin tuyển dụng nào.
                            </div>
                        </div>
                    </div>

                    {/* Cột phải (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 space-y-6 sticky top-8">
                            <section>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Website</h3>
                                <div className="flex items-center text-sm">
                                    <GlobeAltIcon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                                    <a href={website} className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                                        {website || "Chưa cập nhật"}
                                    </a>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Theo dõi tại</h3>
                                <div className="flex items-center gap-4">
                                    {/* Facebook Icon */}
                                    {facebook && (
                                        <a href={facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="text-gray-500 hover:text-blue-600">
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    )}
                                    {/* LinkedIn Icon */}
                                    {linkedin && (
                                        <a href={linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-gray-500 hover:text-blue-700">
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </a>
                                    )}
                                    {/* YouTube Icon (Bạn có thể thêm vào nếu cần) */}
                                    {youtube && (
                                        <a href={youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="text-gray-500 hover:text-red-600">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Thông tin chung</h3>
                                <ul className="text-sm text-gray-700 space-y-3">
                                    <li className="flex items-center">
                                        <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                                        <span>{email || "Chưa cập nhật"}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <HashtagIcon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                                        <span>MST: {tax_code || "Chưa cập nhật"}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <MapPinIcon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                                        <span>{fullAddress || "Chưa cập nhật"}</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Bản đồ</h3>
                                {latitude && longitude ? (
                                    <div className="rounded-md overflow-hidden border">
                                        <iframe
                                            title="Bản đồ công ty"
                                            className="w-full h-48"
                                            src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">Chưa có thông tin bản đồ.</div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            {/* Thêm khoảng trống ở cuối trang */}
            <div className="h-16"></div>
        </div>
    );
}