import React, { useEffect, useState } from 'react';
import { Link, useSearchParams  } from 'react-router-dom';
import { FaBriefcase, FaSearch, FaMapMarkerAlt, FaDollarSign, FaRegCalendarAlt, FaSlidersH, FaChevronDown } from 'react-icons/fa';
import CareerDropdown from '../../components/CareerDropdown'; // Đảm bảo đường dẫn này đúng
import LocationDropdown from '../../components/LocationDropdown';

// --- CÁC COMPONENT CON (JobCard, SuggestedJobCard) GIỮ NGUYÊN ---
const JobCard = ({ job }) => (
    <Link
        key={job.id}
        to={`/jobs/${job.id}`}
        className="block bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-300 hover:shadow-lg hover:border-myjob-purple hover:-translate-y-1"
    >
        <div className="flex items-start gap-4">
            <img
                src={job.logo_url ? `http://localhost:8000${job.logo_url}` : 'https://via.placeholder.com/80'}
                alt={`${job.poster_name} logo`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-md object-contain border p-1 flex-shrink-0 bg-white"
            />
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-myjob-purple transition-colors mb-1">
                    {job.title}
                </h3>
                <p className="text-gray-600 font-medium mb-3">{job.poster_name || "Tên công ty"}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5"><FaDollarSign /><span>{job.salary || 'Thương lượng'}</span></div>
                    <div className="flex items-center gap-1.5"><FaMapMarkerAlt /><span>{job.location?.name || 'Nhiều nơi'}</span></div>
                    <div className="flex items-center gap-1.5"><FaRegCalendarAlt /><span>{new Date(job.created_at).toLocaleDateString('vi-VN')}</span></div>
                </div>
            </div>
            <div className="flex-shrink-0">
                {job.is_hot && (
                     <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">HOT</span>
                )}
            </div>
        </div>
    </Link>
);

const SuggestedJobCard = ({ job }) => (
    <Link to={`/jobs/${job.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
         <img
            src={job.logo_url ? `http://localhost:8000${job.logo_url}` : 'https://via.placeholder.com/40'}
            alt={`${job.poster_name} logo`}
            className="w-10 h-10 rounded-md object-contain border flex-shrink-0 bg-white"
        />
        <div>
            <h4 className="font-semibold text-sm text-gray-800 leading-tight">{job.title}</h4>
            <p className="text-xs text-gray-500">{job.poster_name}</p>
        </div>
    </Link>
);

// === COMPONENT CHÍNH: JOBS PAGE ===
export default function JobsPage() {
    // --- BƯỚC 2.2: Đọc tham số từ URL ---
    const [searchParams, setSearchParams] = useSearchParams();

    
    // State cho dữ liệu
    const [jobs, setJobs] = useState([]); 
    const [filteredJobs, setFilteredJobs] = useState([]); 
    const [loading, setLoading] = useState(true);

    // State cho các ô filter (lấy giá trị ban đầu từ URL)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedCareerId, setSelectedCareerId] = useState(searchParams.get('career') || '');
    const [selectedLocationId, setSelectedLocationId] = useState(searchParams.get('location_id') || '');
    
    // State cho các chức năng khác
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  
    useEffect(() => {
        setLoading(true);
        // THAY ĐỔI: API endpoint bây giờ đã được cải tiến để trả về nhiều thông tin hơn
        fetch('http://localhost:8000/job-posts') // Giả sử API này đã được cập nhật để trả về location object
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setJobs(data);

                    let results = [...data];
                    
                    const keywordParam = searchParams.get('q');
                    const careerParam = searchParams.get('career_id');
                    const locationParam = searchParams.get('location_id'); // <-- THAY ĐỔI 4.1

                    if (keywordParam) {
                        results = results.filter(job =>
                            job.title.toLowerCase().includes(keywordParam.trim().toLowerCase())
                        );
                    }
                    if (careerParam) {
                        results = results.filter(job => job.career_id == careerParam);
                    }
                    if (locationParam) {
                        // <-- THAY ĐỔI 4.2: Lọc theo location_id
                        results = results.filter(job => job.location_id == locationParam);
                    }

                    setFilteredJobs(results);
                } else {
                    console.error("Dữ liệu không hợp lệ:", data);
                }
            })
            .catch(err => console.error('Lỗi khi lấy dữ liệu:', err))
            .finally(() => setLoading(false));
            
    }, [searchParams]);

    // --- BƯỚC 2.5: Cập nhật hàm handleSearch để thay đổi URL ---
    const handleSearch = () => {
        const newParams = new URLSearchParams();

        if (searchTerm) newParams.set('q', searchTerm);
        if (selectedCareerId) newParams.set('career', selectedCareerId);
        //nếu muốn bật lọc khu vực thì mở đoạn code này ra
        // if (selectedLocationId) newParams.set('location_id', selectedLocationId); 
        
        setSearchParams(newParams);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* KHỐI TÌM KIẾM - Đã kết nối với state */}
                <div className="bg-gradient-to-r from-myjob-purple to-indigo-600 p-6 rounded-xl shadow-lg mb-8 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                        {/* Input tìm kiếm */}
                        <div className="relative lg:col-span-2">
                             <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-purple-200" />
                            <input
                                type="text"
                                placeholder="Tên công việc, vị trí bạn muốn ứng tuyển..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white/20 rounded-md placeholder-purple-200 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                        </div>
                        
                        {/* CareerDropdown */}
                        <CareerDropdown
                            value={selectedCareerId}
                            onChange={(e) => setSelectedCareerId(e.target.value)}
                            required={false}
                            className="w-full h-12 px-4 bg-white/20 rounded-md focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white appearance-none text-white"
                            // Thêm style để option dễ nhìn hơn trên nền tối
                            optionClassName="text-black" 
                        />

                        {/* Select Địa điểm */}
                        <LocationDropdown
                            value={selectedLocationId}
                            onChange={(e) => setSelectedLocationId(e.target.value)}
                            name="location_id"
                            required={false}
                            className="w-full h-12 px-4 bg-white/20 rounded-md focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white appearance-none text-white"
                        />
                        
                        {/* Nút tìm kiếm và lọc */}
                        <div className="flex items-center gap-2">
                             <button
                                onClick={handleSearch} // Giữ nguyên chức năng lọc trên trang này
                                className="w-full h-12 bg-white text-myjob-purple font-bold rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow"
                            >
                                <FaSearch />
                                TÌM
                            </button>
                            <button
                                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                                className="w-full h-12 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow"
                            >
                                <FaSlidersH />
                                LỌC
                            </button>
                        </div>
                    </div>
                    
                    {/* === KHỐI LỌC NÂNG CAO (HIỂN THỊ KHI CLICK) === */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAdvancedFilterOpen ? 'max-h-96 mt-4 pt-4 border-t border-white/20' : 'max-h-0'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select className="w-full h-12 px-4 bg-white/20 rounded-md focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white appearance-none">
                                <option value="">Mức lương</option>
                                <option>Dưới 10 triệu</option>
                                <option>10 - 15 triệu</option>
                                <option>15 - 20 triệu</option>
                                <option>Trên 20 triệu</option>
                            </select>
                            <select className="w-full h-12 px-4 bg-white/20 rounded-md focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white appearance-none">
                                <option value="">Kinh nghiệm</option>
                                <option>Chưa có kinh nghiệm</option>
                                <option>Dưới 1 năm</option>
                                <option>1 - 2 năm</option>
                                <option>Trên 2 năm</option>
                            </select>
                             <select className="w-full h-12 px-4 bg-white/20 rounded-md focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white appearance-none">
                                <option value="">Loại hình công việc</option>
                                <option>Toàn thời gian</option>
                                <option>Bán thời gian</option>
                                <option>Thực tập</option>
                                <option>Remote</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* LAYOUT CHÍNH 2 CỘT (Không thay đổi) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Kết quả tìm kiếm ({filteredJobs.length} tin đăng)
                        </h2>
                        <div className="space-y-4">
                            {loading ? (
                                <p>Đang tải dữ liệu...</p>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map(job => <JobCard key={job.id} job={job} />)
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                                    <FaBriefcase className="mx-auto text-6xl text-gray-300 mb-4"/>
                                    <p className="text-gray-500 text-lg">Không tìm thấy công việc nào phù hợp.</p>
                                    <p className="text-gray-400 mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-3">Việc làm đề xuất</h3>
                            <div className="space-y-2">
                                {jobs.slice(0, 5).map(job => <SuggestedJobCard key={`suggest-${job.id}`} job={job} />)}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <Link to="#">
                                <img src="/images/entry-banner.webp" alt="Poster 1" className="w-full rounded-lg shadow-md transition-transform hover:scale-105" />
                            </Link>
                             <Link to="#">
                                <img src="/images/Website-Banner.webp" alt="Poster 2" className="w-full rounded-lg shadow-md transition-transform hover:scale-105" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}