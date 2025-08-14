import React, { useState } from 'react'; // <--- GIỮ LẠI MỘT DÒNG DUY NHẤT
import Slider from "react-slick";
import { FaDesktop, FaMicrochip, FaUserTie, FaBuilding, FaPenRuler, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom'; // QUAN TRỌNG: Hook để điều hướng
import CareerDropdown from '../components/CareerDropdown'; // Import component ngành nghề
import LocationDropdown from '../components/LocationDropdown';


// --- DỮ LIỆU GIẢ (Đầy đủ cho phân trang) ---
// --- MOCK DATA (DỮ LIỆU GIẢ) ---
// Trong thực tế, bạn sẽ lấy dữ liệu này từ APi
const urgentJobs = [
    // Trang 1
    { id: 1, title: 'Kiến Trúc Sư', company: 'Công Ty Cổ Phần Đầu Tư Xây Dựng...', salary: '15 triệu - 20 triệu', location: 'Hà Nội', date: '01/05/2024', logo: "/logo/1.webp", isHot: true },
    { id: 2, title: 'Nhân Viên Lễ Tân', company: 'Công Ty CP Xây Dựng Newdaycons', salary: '7 triệu - 9 triệu', location: 'TP.HCM', date: '05/05/2024', logo: "/logo/2.jpg", isUrgent: true },
    { id: 3, title: 'Nhân Viên Kinh Doanh', company: 'Công Ty Cổ Phần Thanh Bình H.T.C Việt Nam', salary: '12 triệu - 20 triệu', location: 'Hà Nội', date: '31/07/2024', logo: "/logo/3.jpg", isUrgent: true },
    { id: 4, title: 'Kỹ Sư Nông Nghiệp', company: 'Công ty TNHH Ánh Dương Tây Nguyên', salary: '8 triệu - 15 triệu', location: 'Gia Lai', date: '21/09/2024', logo: "/logo/4.png", isUrgent: true },
    { id: 5, title: 'Hub Supervisor (Hải Phòng)', company: 'Công Ty TNHH Giao Hàng Siêu Speed', salary: '10 triệu - 15 triệu', location: 'Hà Nội', date: '07/06/2024', logo: "/logo/5.jpg", isUrgent: true },
    { id: 6, title: 'Kế Toán Bán Hàng', company: 'Công Ty Cổ Phần Đầu Tư và Phát Triển Y Tế An Sinh', salary: '7 triệu - 12 triệu', location: 'Thanh Hóa', date: '22/11/2024', logo: "/logo/6.png", isUrgent: true },
    { id: 7, title: 'Giám Sát Thi Công Điện', company: 'Công ty Cổ phần Cơ Điện Đo Lường...', salary: '10 triệu - 12 triệu', location: 'Nghệ An', date: '05/07/2024', logo: "/logo/7.jpg", isHot: true },
    { id: 8, title: 'Điều Dưỡng Viên', company: 'Công ty Cổ phần Vaccom Việt Nam', salary: '7 triệu - 10 triệu', location: 'Hà Nội', date: '20/08/2024', logo: "/logo/8.webp", isUrgent: true },
    { id: 9, title: 'Thư Ký Dự Án', company: 'Công Ty Cổ Phần Nội Thất NEM', salary: '7 triệu - 10 triệu', location: 'TP.HCM', date: '02/08/2024', logo: "/logo/9.jpg", isUrgent: true },
    // Trang 2
    { id: 10, title: 'Trưởng Phòng Chất Lượng', company: 'Công Ty TNHH Challenge Knght VTube', salary: '15 triệu - 20 triệu', location: 'Hải Dương', date: '12/06/2024', logo: "/logo/10.png", isHot: true },
    { id: 11, title: 'Giáo Viên', company: 'Trường TH, THCS và THPT Thạch Bình', salary: '15 triệu - 20 triệu', location: 'TP.HCM', date: '24/09/2024', logo: "/logo/11.jpg", isUrgent: false },
    { id: 12, title: 'Phiên Dịch Tiếng Trung', company: 'Công Ty CP Sản Xuất Container Hòa Phát', salary: '15 triệu - 16 triệu', location: 'Bà Rịa - Vũng Tàu', date: '21/06/2024', logo: "/logo/12.png", isUrgent: false },
    { id: 13, title: 'Trưởng Phòng Chất Lượng', company: 'Công Ty TNHH Challenge Knght VTube', salary: '15 triệu - 20 triệu', location: 'Hải Dương', date: '12/06/2024', logo: "/logo/13.png"},
    { id: 14, title: 'Giáo Viên', company: 'Trường TH, THCS và THPT Thạch Bình', salary: '15 triệu - 20 triệu', location: 'TP.HCM', date: '24/09/2024', logo: "/logo/14.jpg"},
    
];

// Hãy tìm mảng const softwareJobs và cập nhật nó như sau:

// Trong file Home.js, cập nhật lại mảng softwareJobs

const softwareJobs = [
    // Trang 1
    { id: 1, title: 'Lập Trình Viên .Net Developer', company: 'Văn Phòng Đại Diện Nexus Frontier...', salary: '20 triệu - 35 triệu', location: 'Bình Dương', date: '27/10/2024', logo: "/logo/14.jpg", isHot: true },
    { id: 2, title: 'Project Manager (1500$ - 2000$)', company: 'Công Ty TNHH Giao Vận Toàn Cầu', salary: '34 triệu - 46 triệu', location: 'Hà Nội', date: '19/06/2024', logo: "/logo/12.png", isUrgent: false },
    { id: 3, title: 'Nhân Viên Quản Trị Web', company: 'Công Ty TNHH Thiết Kế Đầu Tư Xây Dựng Minh Trí', salary: '10 triệu - 15 triệu', location: 'TP.HCM', date: '19/06/2024', logo: "/logo/13.png", isHot: true },
    { id: 4, title: 'Lập Trình Viên PHP', company: 'Công Ty Cổ Phần SX - TM - DV NGỌC TÙNG', salary: '11 triệu - 12 triệu', location: 'Lâm Đồng', date: '04/10/2024', logo: "/logo/10.png", isUrgent: false },
    { id: 5, title: 'Nhân Viên Hỗ Trợ Audit Thời Vụ', company: 'Công Ty TNHH Phát Triển Nhân Lực G-GLE', salary: '8 triệu - 14 triệu', location: 'Hưng Yên', date: '02/09/2024', logo: "/logo/7.jpg", isUrgent: false },
    { id: 6, title: 'Senior Angular Developer', company: 'Công ty TNHH Mầm Non Ái Thơ NA', salary: 'Thỏa thuận', location: 'Hà Nội', date: '25/10/2024', logo: "/logo/8.webp", isHot: true },
    
    // Trang 2 (Dữ liệu thêm vào)
    { id: 7, title: 'Data Scientist', company: 'Tập đoàn FPT', salary: 'Trên 30 triệu', location: 'Đà Nẵng', date: '15/11/2024', logo: "/logo/1.webp", isHot: true },
    { id: 8, title: 'Game Developer (Unity)', company: 'VNG Corporation', salary: '25 triệu - 40 triệu', location: 'TP.HCM', date: '10/12/2024', logo: "/logo/3.jpg", isUrgent: false },
    { id: 9, title: 'Frontend Developer (ReactJS)', company: 'Tiki Corporation', salary: '18 triệu - 30 triệu', location: 'TP.HCM', date: '01/11/2024', logo: "/logo/4.png", isHot: false },
];

// Trong file Home.js, hãy tìm và cập nhật mảng này:

const hardwareJobs = [
    // Trang 1
    { id: 1, title: 'IT Security Manager', company: 'Công Ty Cổ Phần Phát Triển Nhân Lực Quốc Gia', salary: 'Thỏa thuận', location: 'Hưng Yên', date: '09/06/2024', logo: "/logo/1.webp", isHot: true },
    { id: 2, title: 'Viettel Construction Gia Lai', company: 'Chi Nhánh Công Trình Viettel Gia Lai', salary: '8 triệu - 20 triệu', location: 'Gia Lai', date: '30/11/2024', logo: "/logo/14.jpg", isUrgent: false },
    { id: 3, title: 'Nhân Viên Kỹ Thuật Mạng', company: 'Công ty TNHH Brains Da-Vin-Ci Việt Nam', salary: '10 triệu - 15 triệu', location: 'Hà Nội', date: '03/09/2024', logo: "/logo/8.webp", isHot: false },
    // Trang 2
    { id: 4, title: 'IT Helpdesk', company: 'Tập đoàn Golden Gate (Cổng Vàng)', salary: 'Thỏa thuận', location: 'Hà Nội', date: '11/11/2024', logo: "/logo/9.jpg", isUrgent: false },
    { id: 5, title: 'Kỹ Sư Presale', company: 'Công Ty Cổ Phần Đầu Tư Công Nghệ Việt Nam', salary: '15 triệu - 30 triệu', location: 'Hà Nội', date: '05/06/2024', logo: "/logo/10.png", isHot: true },
    { id: 5, title: 'Viettel Construction Gia Lai', company: 'Chi Nhánh Công Trình Viettel Gia Lai', salary: '8 triệu - 20 triệu', location: 'Gia Lai', date: '30/11/2024', logo: "/logo/11.jpg", isUrgent: false },
    { id: 6, title: 'Nhân Viên Kỹ Thuật Mạng', company: 'Công ty TNHH Brains Da-Vin-Ci Việt Nam', salary: '10 triệu - 15 triệu', location: 'Hà Nội', date: '03/09/2024', logo: "/logo/12.png", isHot: false },
    // Trang 2
    { id: 7, title: 'IT Helpdesk', company: 'Tập đoàn Golden Gate (Cổng Vàng)', salary: 'Thỏa thuận', location: 'Hà Nội', date: '11/11/2024', logo: "/logo/13.png", isUrgent: false },
    { id: 8, title: 'Kỹ Sư Presale', company: 'Công Ty Cổ Phần Đầu Tư Công Nghệ Việt Nam', salary: '15 triệu - 30 triệu', location: 'Hà Nội', date: '05/06/2024', logo: "/logo/2.jpg", isHot: true },
];

const keyIndustries = [
    { name: 'Kế toán', jobs: 941, icon: <FaUserTie className="w-8 h-8" /> },
    { name: 'Bán buôn - Bán lẻ', jobs: 774, icon: <FaBuilding className="w-8 h-8" /> },
    { name: 'Hành chính - Thư ký', jobs: 546, icon: <FaPenRuler className="w-8 h-8" /> },
    { name: 'Marketing', jobs: 520, icon: <FaDesktop className="w-8 h-8" /> },
    { name: 'Khoa học - Kỹ thuật', jobs: 513, icon: <FaMicrochip className="w-8 h-8" /> },
];

const testimonials = [
    { name: 'Phạm Thị Hương', quote: 'Ứng dụng thực sự là một ứng dụng tuyệt vời để tìm kiếm việc làm. Chỉ đơn giản là một trang web thông thường.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'Trần Hải Nam', quote: 'MyJob là một ứng dụng xuất sắc và không thể thiếu cho những người đang tìm kiếm việc làm. Tôi đã sử dụng nhiều trang web tìm việc khác nhau trước đây.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Trần Cẩm Trang', quote: 'MyJob là ứng dụng tuyệt vời để giúp tìm kiếm việc làm trong bối cảnh kinh tế khó khăn hiện nay. Với nhiều công ty và doanh nghiệp đang giảm nhân sự hoặc ngừng tuyển dụng.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Nguyễn Văn Hoàn', quote: 'MyJob là một trong những ứng dụng tuyệt vời nhất mà tôi đã từng sử dụng để tìm kiếm việc làm. Không chỉ vì giao diện đẹp mắt và dễ sử dụng.', avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { name: 'Lê Nguyễn Phi Hùng', quote: 'Tôi đã sử dụng MyJob để tìm kiếm việc làm và tôi thực sự rất hài lòng với trải nghiệm của mình. MyJob có rất nhiều thông tin về việc làm và cung cấp cho người dùng các công cụ tìm kiếm tuyệt vời để giúp.', avatar: 'https://randomuser.me/api/portraits/men/86.jpg' },
];
const companyList = [
    { name: 'Cocochip - Thế Giới Đồ Lót', logo: "/logo/1.webp" },
    { name: 'Công Ty TNHH Cơ Khí Và Thư...', logo: "/logo/3.jpg" },
    { name: 'Công Ty Cổ Phần Đầu Tư Kin...', logo: "/logo/4.png" },
    { name: 'Công Ty Cổ Phần Sáng Tạo V...', logo: "/logo/5.jpg"},
    { name: 'Công Ty Cổ Phần Phát Triển ...', logo: "/logo/6.png" },
    { name: 'FPT Software', logo: '/logo/2.jpg' },
];

// ==========================================================
// COMPONENT PHÂN TRANG TÁI SỬ DỤNG
// ==========================================================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => onPageChange(page)} className={`flex items-center justify-center h-10 w-10 rounded-md border text-lg font-semibold transition ${currentPage === page ? 'bg-[#441da0] text-white border-[#441da0]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <FaChevronRight />
            </button>
        </div>
    );
};

export default function Home() {
    // --- BƯỚC 1.2: Thêm state cho thanh tìm kiếm ---
    const [keyword, setKeyword] = useState('');
    const [selectedCareerId, setSelectedCareerId] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const navigate = useNavigate(); // Khởi tạo hook điều hướng

    // --- BƯỚC 1.3: Tạo hàm xử lý tìm kiếm ---
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Ngăn form tải lại trang

        const queryParams = new URLSearchParams();

        if (keyword) {
            queryParams.set('q', keyword);
        }
        if (selectedCareerId) {
            queryParams.set('career', selectedCareerId);
        }
        //nếu muốn lọc khu vực thì mở khúc này ra tương tự như bên jobspage
        // if (selectedLocationId) {
        //     queryParams.set('location_id', selectedLocationId);
        // }

        navigate(`/jobs?${queryParams.toString()}`);
    };

    const [showMenu, setShowMenu] = useState(false);
    // ==========================================================
    // KHAI BÁO LOGIC PHÂN TRANG CHO TỪNG SECTION
    // ==========================================================
    // State và logic cho "Việc làm tuyển gấp"
    const [urgentCurrentPage, setUrgentCurrentPage] = useState(1);
    const URGENT_JOBS_PER_PAGE = 9;
    const totalUrgentPages = Math.ceil(urgentJobs.length / URGENT_JOBS_PER_PAGE);
    const currentUrgentJobs = urgentJobs.slice((urgentCurrentPage - 1) * URGENT_JOBS_PER_PAGE, urgentCurrentPage * URGENT_JOBS_PER_PAGE);

    // State và logic cho "IT - Phần mềm"
    const [softwareCurrentPage, setSoftwareCurrentPage] = useState(1);
    const SOFTWARE_JOBS_PER_PAGE = 6;
    const totalSoftwarePages = Math.ceil(softwareJobs.length / SOFTWARE_JOBS_PER_PAGE);
    const currentSoftwareJobs = softwareJobs.slice((softwareCurrentPage - 1) * SOFTWARE_JOBS_PER_PAGE, softwareCurrentPage * SOFTWARE_JOBS_PER_PAGE);

    // State và logic cho "IT - Phần cứng"
    const [hardwareCurrentPage, setHardwareCurrentPage] = useState(1);
    const HARDWARE_JOBS_PER_PAGE = 6; // Đảm bảo hiển thị 2 hàng (6 công việc)
    const totalHardwarePages = Math.ceil(hardwareJobs.length / HARDWARE_JOBS_PER_PAGE);
    const currentHardwareJobs = hardwareJobs.slice((hardwareCurrentPage - 1) * HARDWARE_JOBS_PER_PAGE, hardwareCurrentPage * HARDWARE_JOBS_PER_PAGE);

    const JobCard = ({ job }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 transition hover:shadow-lg hover:border-[#441da0] h-full">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <img src={job.logo} alt={job.company} className="w-12 h-12 border rounded-md object-contain" />
                    <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-1">{job.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{job.company}</p>
                    </div>
                </div>
                {job.isHot && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">HOT</span>}
                {job.isUrgent && !job.isHot && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Tuyển gấp</span>}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t mt-auto">
                <span>💰 {job.salary}</span>
                <span>📍 {job.location}</span>
                <span>📅 {job.date}</span>
            </div>
        </div>
    );
    
    const companySliderSettings = {
        dots: true, infinite: true, speed: 500, slidesToShow: 5, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000,
        responsive: [ { breakpoint: 1024, settings: { slidesToShow: 3, } }, { breakpoint: 640, settings: { slidesToShow: 2, } } ]
    };
    const testimonialSliderSettings = {
        dots: true, infinite: true, speed: 500, slidesToShow: 3, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000,
        responsive: [ { breakpoint: 1024, settings: { slidesToShow: 2, } }, { breakpoint: 768, settings: { slidesToShow: 1, } } ]
    };

    return (
        <div className="min-h-screen font-sans bg-gray-50">
            {/* Thanh menu ngành nghề */}
            <nav className="bg-white shadow-sm border-b overflow-x-auto">
                <div className="max-w-7xl mx-auto flex items-center gap-x-6 px-4 py-2.5 text-sm">
                    <div className='cursor-pointer flex-shrink-0' onClick={() => setShowMenu(!showMenu)}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    </div>
                    <span className="whitespace-nowrap cursor-pointer text-gray-800 hover:text-[#441da0] font-medium">Kinh doanh</span>
                    <span className="whitespace-nowrap cursor-pointer text-gray-800 hover:text-[#441da0]">Kế toán</span>
                    <span className="whitespace-nowrap cursor-pointer text-gray-800 hover:text-[#441da0]">Bán buôn - Bán lẻ</span>
                    <span className="whitespace-nowrap cursor-pointer text-gray-800 hover:text-[#441da0]">Hành chính - Thư ký</span>
                    <span className="whitespace-nowrap cursor-pointer text-gray-800 hover:text-[#441da0]">Marketing</span>
                    <span className="whitespace-nowrap cursor-pointer text-gray-800 hover:text-[#441da0]">Khoa học - Kỹ thuật</span>
                </div>
            </nav>
            
            {/* HERO SECTION & SEARCH */}
            <section 
                className="relative py-10 bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop')" }}
            >
                {/* Lớp phủ gradient (Đã đúng) */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800/80 via-indigo-900/90 to-black/80"></div>

                {/* SỬA LỖI 1: Thêm class 'relative' vào đây để nội dung nằm trên lớp phủ */}
                <div className="relative max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    
                    {/* SỬA LỖI 2: Thay đổi toàn bộ class của div này để có hiệu ứng "thủy tinh mờ" */}
                    <div className="lg:col-span-3 bg-black bg-opacity-25 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10">
                        
                        {/* Form tìm kiếm bên trong không cần thay đổi */}
                        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
                            <div className="flex w-full">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm cơ hội việc làm" 
                                        className="w-full p-3 pl-10 rounded-l-md rounded-r-none border-0 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                </div>
            
                                <button 
                                    type="submit"
                                    className="bg-[#441da0] text-white px-6 py-3 rounded-r-md rounded-l-none 
                                            font-semibold uppercase shadow-md border-0 
                                            transition-colors duration-300
                                            hover:bg-purple-950" // <-- Thay đổi ở đây
                                >
                                    Tìm kiếm
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CareerDropdown
                                    value={selectedCareerId}
                                    onChange={(e) => setSelectedCareerId(e.target.value)}
                                    required={false}
                                    className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                />
                                <LocationDropdown
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value)}
                                    name="location_id"
                                    required={false}
                                    className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="lg:col-span-2 hidden lg:block relative group rounded-lg overflow-hidden shadow-lg">
                        {/* Ảnh gốc của bạn */}
                        <img 
                            src="/logo/banner-search.png" 
                            alt="Báo cáo thị trường" 
                            className="w-full h-full object-cover" 
                        />

                        {/* Lớp phủ màu tím */}
                        <div className="absolute inset-0 bg-purple-400 bg-opacity-40 mix-blend-multiply group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                </div>
            </section>
            
            <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Các công ty nổi bật</h2>
                    <Slider {...companySliderSettings}>
                        {companyList.map((company, index) => (
                            <div key={index} className="px-2">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 h-40 flex flex-col items-center justify-center text-center cursor-pointer transition hover:shadow-md hover:border-purple-300">
                                    <img src={company.logo} alt={company.name} className="h-16 w-auto object-contain mb-3" />
                                    <p className="text-sm font-medium text-gray-700 line-clamp-2">{company.name}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </section>

                <section>
                    <div className="bg-[#441da0] text-white p-3 rounded-t-lg flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg><h2 className="text-xl font-bold">Việc làm tuyển gấp</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {currentUrgentJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                    <Pagination
                        currentPage={urgentCurrentPage}
                        totalPages={totalUrgentPages}
                        onPageChange={setUrgentCurrentPage}
                    />
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Ngành nghề trọng điểm</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {keyIndustries.map(industry => (
                            <div key={industry.name} className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:shadow-lg hover:border-[#441da0] transition">
                                <div className="text-[#441da0]">{industry.icon}</div>
                                <h3 className="font-semibold text-gray-800">{industry.name}</h3>
                                <p className="text-sm text-gray-500">{industry.jobs} Việc làm</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== CALL TO ACTION BANNER ===== */}
                <section className="relative rounded-lg overflow-hidden bg-cover bg-center h-48 flex items-center justify-center text-white" style={{backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')"}}>
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 px-6 text-center md:text-left">
                        <img src="https://i.pravatar.cc/100?u=a042581f4e29026704d" alt="Tư vấn viên" className="w-24 h-24 rounded-full border-4 border-white"/>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">Cần tìm việc làm phù hợp cho bạn?</h2>
                            <p className="text-gray-200">Chúng tôi sẵn sàng giúp đỡ bạn</p>
                        </div>
                        <button className="bg-white text-[#441da0] font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition whitespace-nowrap mt-4 md:mt-0">
                            Bắt đầu khám phá
                        </button>
                    </div>
                </section>

                {/* ===== VIỆC LÀM IT - PHẦN MỀM (ĐÃ SỬ DỤNG COMPONENT PAGINATION) ===== */}
                <section>
                    {/* Phần tiêu đề section (giữ nguyên) */}
                    <div className="bg-[#441da0] text-white p-3 rounded-t-lg flex items-center gap-3">
                        <FaDesktop className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Việc làm IT - Phần mềm</h2>
                    </div>

                    {/* Lưới hiển thị các công việc (giữ nguyên) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {currentSoftwareJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>

                    {/* ===== PHÂN TRANG (CÁCH LÀM MỚI VÀ ĐÚNG) ===== */}
                    <Pagination
                        currentPage={softwareCurrentPage}
                        totalPages={totalSoftwarePages}
                        onPageChange={setSoftwareCurrentPage}
                    />
                </section>

                {/* ===== VIỆC LÀM IT - PHẦN CỨNG (GIỐNG HỆT PHẦN MỀM) ===== */}
                <section>
                    {/* Phần tiêu đề section */}
                    <div className="bg-[#441da0] text-white p-3 rounded-t-lg flex items-center gap-3">
                        <FaMicrochip className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Việc làm IT - Phần cứng & Mạng</h2>
                    </div>

                    {/* Lưới hiển thị các công việc */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {currentHardwareJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>

                    {/* Component Pagination, sử dụng logic của Phần cứng */}
                    <Pagination
                        currentPage={hardwareCurrentPage}
                        totalPages={totalHardwarePages}
                        onPageChange={setHardwareCurrentPage}
                    />
                </section>

                {/* ===== NGƯỜI DÙNG ĐÁNH GIÁ ===== */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Người dùng đánh giá</h2>
                    <Slider {...testimonialSliderSettings}>
                        {testimonials.map(item => (
                            <div key={item.name} className="px-3 py-4">
                                <div className="bg-white border rounded-lg p-6 h-full flex flex-col items-center text-center">
                                    <img src={item.avatar} alt={item.name} className="w-20 h-20 rounded-full mb-4"/>
                                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                                    <p className="text-gray-500 mt-2 text-sm">“{item.quote}”</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </section>
                
                {/* ===== VIỆC LÀM THEO DANH MỤC ===== */}
                <section className="bg-white p-8 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Việc làm theo ngành nghề</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Hành chính - Thư ký</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">An ninh - Bảo vệ</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Thiết kế - Sáng tạo nghệ thuật</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Kiến trúc - Thiết kế nội thất</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Khách sạn - Nhà hàng - Du lịch</a></li>
                                <li><a href="#" className="font-semibold text-[#441da0] hover:underline">Xem tất cả ngành nghề ›</a></li>
                            </ul>
                        </div>
                        <div>
                             <h3 className="font-bold text-lg mb-4 text-gray-800">Việc làm theo khu vực</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Hà Nội</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">TP.HCM</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">An Giang</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Bà Rịa - Vũng Tàu</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Bắc Giang</a></li>
                                <li><a href="#" className="font-semibold text-[#441da0] hover:underline">Xem tất cả khu vực ›</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Việc làm theo hình thức</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Nhân viên chính thức</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Bán thời gian</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Thời vụ - Nghỉ tự do</a></li>
                                <li><a href="#" className="hover:text-[#441da0] hover:underline">Thực tập</a></li>
                            </ul>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}