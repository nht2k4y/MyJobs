import React from 'react';
import DownloadAppSection from '../components/DownloadAppSection';

export default function About() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12">

            {/* Về chúng tôi */}
            {/* === THAY ĐỔI: Thêm nền mờ, bo góc và đổ bóng === */}
            <div className="space-y-4 text-left bg-gray-50 p-8 rounded-xl shadow">
                <h2 className="text-3xl font-bold text-[#fca34d]">Về chúng tôi</h2>
                <p className="text-[#4a4a4a] max-w-5xl">
                    MyJob - Kênh thông tin tuyển dụng và việc làm dành cho mọi Doanh nghiệp và Ứng viên. 
                    Chúng tôi tin tưởng sẽ đem lại “HY VỌNG” cho Doanh nghiệp tìm kiếm nhân tài và cho Ứng viên 
                    tìm kiếm cơ hội nghề nghiệp. Với 2 hệ thống: Website & App, MyJob mang lại trải nghiệm mới mẻ,
                    kết nối ước mơ chinh phục công việc.
                </p>
            </div>

            {/* Grid 4 cột */}
            {/* === THAY ĐỔI: Thêm nền mờ, bo góc và đổ bóng === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-50 p-8 rounded-xl shadow">
                {/* Sửa lại gap-8 để khoảng cách đồng đều hơn một chút khi có padding */}
                <div>
                    <h3 className="text-lg font-semibold text-[#fca34d]">Website</h3>
                    <p className="text-[#4a4a4a] text-justify">
                        Website hỗ trợ Nhà Tuyển Dụng tìm kiếm nhân sự, quản lý công việc, ứng viên, xây dựng nguồn dữ liệu phong phú.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[#fca34d]">Mobile</h3>
                    <p className="text-[#4a4a4a] text-justify">
                        Ứng dụng giúp Người Tìm Việc tiếp cận công việc phù hợp nhất ở mọi nơi, mọi thời điểm.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[#fca34d]">Ngành tập trung</h3>
                    <p className="text-[#4a4a4a] text-justify">
                        Tuyển dụng & tìm việc 3 lĩnh vực: CNTT, Quảng cáo trực tuyến, PR - Marketing, kết nối đúng nhu cầu.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[#fca34d]">Tiết kiệm chi phí</h3>
                    <p className="text-[#4a4a4a] text-justify">
                        Tiết kiệm chi phí, thời gian, đạt hiệu quả tối ưu, đáp ứng nhu cầu tìm việc & nhân tài.
                    </p>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-[#fca34d]">Mobile App MyJob</h3>

            <div className="space-y-12">

                {/* Block 1: tiêu đề bên trái, ảnh bên phải */}
                <div className="flex flex-col md:flex-row items-start gap-8 bg-gray-50 p-8 rounded-xl shadow">
                    <div className="flex-1 space-y-4 order-2 md:order-1">
                        <h3 className="text-2xl font-bold text-[#fca34d]">Chọn đúng việc - Đi đúng hướng</h3>
                        <p className="text-[#6d7681]">
                            Cá nhân hoá tìm việc: Gợi ý việc làm, tìm kiếm việc & công ty, chatbot hỗ trợ nhanh chóng.
                        </p>
                    </div>
                    <div className="flex-1 order-1 md:order-2">
                        <img src="/about-images/job-post.jpg" alt="Job Post" className="w-full rounded-xl" />
                    </div>
                </div>

                {/* Block 2: tiêu đề bên phải, ảnh bên trái */}
                <div className="flex flex-col-reverse md:flex-row items-start gap-8 bg-gray-50 p-8 rounded-xl shadow">
                    <div className="flex-1">
                        <img src="/about-images/profile.jpg" alt="Profile" className="w-full rounded-xl" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-bold text-[#fca34d]">Tạo CV & Profile</h3>
                        <p className="text-[#6d7681]">
                            CV online + tải CV đính kèm. Nhanh chóng, chuyên nghiệp, tăng 80% tỉ lệ ứng tuyển thành công.
                        </p>
                    </div>
                </div>

                {/* Block 3: tiêu đề bên trái, ảnh bên phải */}
                <div className="flex flex-col md:flex-row items-start gap-8 bg-gray-50 p-8 rounded-xl shadow">
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-bold text-[#fca34d]">Việc làm xung quanh bạn</h3>
                        <p className="text-[#6d7681]">
                            Tìm việc gần nhà dễ dàng, thuận tiện đi lại mà không cần lọc hàng trăm tin tuyển dụng.
                        </p>
                    </div>
                    <div className="flex-1">
                        <img src="/about-images/around-job-post.jpg" alt="Around Job Post" className="w-full rounded-xl" />
                    </div>
                </div>

                {/* Block 4: tiêu đề bên phải, ảnh bên trái */}
                <div className="flex flex-col-reverse md:flex-row items-start gap-8 bg-gray-50 p-8 rounded-xl shadow">
                    <div className="flex-1">
                        <img src="/about-images/job-post-notification.jpg" alt="Job Notification" className="w-full rounded-xl" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-bold text-[#fca34d]">Thông báo việc làm mọi lúc</h3>
                        <p className="text-[#6d7681]">
                            Nhận việc làm mới nhất qua email mỗi tuần từ các nhà tuyển dụng hàng đầu.
                        </p>
                    </div>
                </div>
            </div>

            <DownloadAppSection />
        </div>
    );
}