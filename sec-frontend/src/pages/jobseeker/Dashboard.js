// src/pages/jobseeker/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaFileAlt, FaBookmark, FaEye, FaHeart, FaCheckCircle, FaArrowRight, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// THÊM MỚI: Import thư viện biểu đồ
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các module cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- CÁC COMPONENT CON (StatCard, ProgressRing) GIỮ NGUYÊN ---
const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4">
        <div className={`text-2xl p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ProgressRing = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                <circle className="text-myjob-purple" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" transform="rotate(-90 60 60)" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-myjob-purple">{percentage}</span>
        </div>
    );
};

// THÊM MỚI: Component cho biểu đồ đường
const LineChart = ({ chartData }) => {
    const data = {
        labels: chartData.map(d => d.label),
        datasets: [
            {
                label: 'Việc đã ứng tuyển',
                data: chartData.map(d => d.applied),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };
    return <Line options={options} data={data} />;
};


export default function JobSeekerDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:8000/api/jobseeker/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch dashboard data');
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error(error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) {
        return <div className="p-8 text-center"><FaSpinner className="animate-spin inline mr-2" /> Đang tải dữ liệu...</div>;
    }
    
    if (!dashboardData || !dashboardData.user || !dashboardData.stats || !dashboardData.cv_summary) {
        return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu cho bảng điều khiển. Vui lòng thử lại.</div>;
    }

    const { user, stats, profile_completeness, cv_summary, activity_chart_data, suggested_jobs } = dashboardData;

    return (
        <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4">
                        {/* SỬA LẠI: Hiển thị avatar người dùng */}
                        <img 
                            src={user?.avatar_url ? `http://localhost:8000${user.avatar_url}` : '/default-avatar.png'} 
                            alt="User Avatar" 
                            className="w-16 h-16 rounded-full border object-cover" 
                        />
                        <div>
                            <p className="text-gray-500">Chào mừng trở lại,</p>
                            <h3 className="text-xl font-bold text-gray-800">{user?.name || 'Người dùng'}</h3>
                            {user?.is_verified && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                                    <FaCheckCircle />
                                    <span>Tài khoản đã xác thực</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm text-center">
                        <h4 className="text-lg font-bold text-gray-800">CV của bạn đã đủ tốt?</h4>
                        <p className="text-sm text-gray-500 mt-1">Bao nhiêu NTD đang quan tâm tới Hồ sơ của bạn?</p>
                        <div className="my-4 flex justify-center">
                            <ProgressRing percentage={profile_completeness || 0} />
                        </div>
                        <p className="text-sm text-gray-600">Mỗi lượt Nhà tuyển dụng xem CV mang đến một cơ hội để bạn gần hơn với công việc phù hợp.</p>
                        <button className="mt-4 w-full bg-myjob-purple text-white font-bold py-2.5 rounded-md hover:opacity-90 transition">KHÁM PHÁ NGAY</button>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                        <Link to="/my-profile/ho-so" className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-bold text-gray-800">Hồ sơ xin việc</h4>
                            <FaArrowRight className="text-gray-400" />
                        </Link>
                        <p className="text-xs text-gray-400">Sửa lần cuối {cv_summary?.last_updated ? new Date(cv_summary.last_updated).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                        {cv_summary?.is_searchable ? (
                             <div className="mt-2 flex items-center gap-2 text-sm text-green-600"><FaCheckCircle /><span>Cho phép tìm kiếm</span></div>
                        ) : (
                            <div className="mt-2 flex items-center gap-2 text-sm text-red-500"><FaTimesCircle /><span>Không cho phép tìm kiếm</span></div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={<FaFileAlt />} title="Việc làm đã ứng tuyển" value={stats?.applied_jobs_count || 0} color="bg-blue-100 text-blue-500" />
                        <StatCard icon={<FaBookmark />} title="Việc làm đã lưu" value={stats?.saved_jobs_count || 0} color="bg-purple-100 text-purple-500" />
                        <StatCard icon={<FaEye />} title="NTD đã xem hồ sơ" value={stats?.profile_views_count || 0} color="bg-cyan-100 text-cyan-500" />
                        <StatCard icon={<FaHeart />} title="NTD đang theo dõi" value={stats?.followed_employers_count || 0} color="bg-pink-100 text-pink-500" />
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Hoạt động của bạn</h4>
                        {/* SỬA LẠI: Render biểu đồ thật */}
                        <div className="h-72 relative">
                            <LineChart chartData={activity_chart_data} />
                        </div>
                         <div className="flex justify-center items-center gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span><span>Việc đã ứng tuyển</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-pink-400 rounded-sm"></span><span>Việc đã lưu</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span><span>Công ty đang theo dõi</span></div>
                        </div>
                    </div>
                    {/* Việc làm gợi ý */}
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                      <h4 className="text-lg font-bold text-gray-800">Việc làm gợi ý</h4>
                      
                      {/* Kiểm tra xem có việc làm gợi ý không */}
                      {suggested_jobs && suggested_jobs.length > 0 ? (
                          // Nếu CÓ, hiển thị danh sách
                          <div className="mt-4 space-y-3">
                              {suggested_jobs.map(job => (
                                  <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                      
                                      {/* ========================================================== */}
                                      {/* SỬA LỖI 1: Thêm đường dẫn đúng cho logo công ty */}
                                      {/* ========================================================== */}
                                      <img 
                                          src={`http://localhost:8000${job.logo_url}`} 
                                          alt={job.company_name} 
                                          className="w-12 h-12 rounded-md border" 
                                      />

                                      <div>
                                          <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-800 hover:text-myjob-purple">{job.title}</Link>
                                          <p className="text-sm text-gray-500">{job.company_name}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          // Nếu KHÔNG, hiển thị ảnh empty.svg
                          <div className="text-center py-10">

                              {/* ========================================================== */}
                              {/* SỬA LỖI 2: Sử dụng ảnh empty.svg của bạn */}
                              {/* ========================================================== */}
                              <img 
                                  src="/images/empty.svg" 
                                  alt="Không có việc làm gợi ý" 
                                  className="h-32 mx-auto" 
                              />
                              
                              <p className="mt-4 text-gray-500">Chưa có việc làm nào được gợi ý cho bạn.</p>
                              <p className="text-sm text-gray-400">Hãy cập nhật hồ sơ để nhận được gợi ý tốt hơn!</p>
                          </div>
                      )}
                  </div>
                                         
                </div>
            </div>
        </div>
    );
}