import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
// Import các icon cần thiết cho giao diện
import { FaUsers, FaUserTie, FaClipboardList, FaFileSignature } from 'react-icons/fa';

// === COMPONENT CON GIÚP CODE SẠCH HƠN ===

// 1. Component cho các thẻ thống kê chính
const StatCard = ({ icon, title, value, color, loading }) => (
    <div className="bg-white p-5 rounded-lg shadow flex items-center gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            )}
        </div>
    </div>
);

// 2. Component cho các card chứa biểu đồ
const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
             {children}
        </div>
    </div>
);


// === COMPONENT DASHBOARD CHÍNH ===

export default function Dashboard() {
    // State không thay đổi
    const [stats, setStats] = useState({ jobSeekers: 0, employers: 0, jobPosts: 0, applications: 0 });
    const [monthlyStats, setMonthlyStats] = useState(null);
    const [careersData, setCareersData] = useState(null);
    const [applicationStatusData, setApplicationStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    // === BẮT ĐẦU CẬP NHẬT ===
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Sử dụng Promise.all để tải song song, nhanh hơn
                const [statsRes, monthlyRes, careersRes, appStatusRes] = await Promise.all([
                    fetch("http://localhost:8000/admin/stats"),
                    fetch("http://localhost:8000/admin/monthly-stats"),
                    fetch("http://localhost:8000/admin/top-careers"),
                    fetch("http://localhost:8000/admin/application-status")
                ]);

                // Xử lý từng response
                if (statsRes.ok) setStats(await statsRes.json());
                if (monthlyRes.ok) setMonthlyStats(await monthlyRes.json());
                
                // SỬA LỖI: Xử lý Careers Data, đảm bảo 'datasets' luôn là một mảng
                if (careersRes.ok) {
                    const rawData = await careersRes.json();
                    setCareersData({
                        ...rawData,
                        datasets: rawData.datasets || [] // Đảm bảo datasets là một mảng
                    });
                } else {
                    // Dữ liệu dự phòng khi API lỗi
                    setCareersData({
                        labels: ['Kinh doanh', 'Kế toán', 'Marketing', 'CNTT', 'Xây dựng'],
                        datasets: [{ data: [5, 3, 4, 2, 1], backgroundColor: ['#8b5cf6', '#facc15', '#10b981', '#3b82f6', '#ef4444'] }]
                    });
                }
                
                // SỬA LỖI: Xử lý Application Status, đảm bảo 'datasets' luôn là một mảng
                if (appStatusRes.ok) {
                    const rawData = await appStatusRes.json();
                    setApplicationStatusData({
                        ...rawData,
                        datasets: rawData.datasets || [] // Đảm bảo datasets là một mảng
                    });
                } else {
                     // Dữ liệu dự phòng khi API lỗi
                    setApplicationStatusData({
                        labels: ['Chờ xác nhận', 'Đã liên hệ', 'Test', 'Phỏng vấn', 'Trúng tuyển', 'Bị loại'],
                        datasets: [{ label: 'Hồ sơ', data: [8, 4, 3, 2, 1, 5], backgroundColor: '#fb923c' }]
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
                // Có thể set dữ liệu dự phòng ở đây nếu cần
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Cấu hình chung cho các biểu đồ (không thay đổi)
    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 12 } } },
        },
        scales: {
            y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } },
            x: { grid: { display: false } }
        }
    };

    const pieChartOptions = {
        ...commonChartOptions,
        scales: {} // Pie chart không có scales
    };

    // Chuẩn bị dữ liệu cho biểu đồ
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    
    // SỬA LỖI: Đảm bảo các thuộc tính data luôn là một mảng
    const lineData = monthlyStats ? {
        labels: months,
        datasets: [
            { label: 'Người tìm việc', data: monthlyStats.seekers || [], borderColor: '#3b82f6', backgroundColor: '#3b82f6', tension: 0.3 },
            { label: 'Nhà tuyển dụng', data: monthlyStats.employers || [], borderColor: '#1f2937', backgroundColor: '#1f2937', tension: 0.3 }
        ]
    } : null;

    const barData = monthlyStats ? {
        labels: months,
        datasets: [
            { label: 'Bài đăng', data: monthlyStats.posts || [], backgroundColor: '#f97316' },
            { label: 'Hồ sơ ứng tuyển', data: monthlyStats.applications || [], backgroundColor: '#10b981' }
        ]
    } : null;
    // === KẾT THÚC CẬP NHẬT ===
    
    
    // Giao diện (không thay đổi)
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển</h1>

            {/* Thống kê tổng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FaUsers size={28} className="text-blue-800"/>} title="Người tìm việc" value={stats.jobSeekers} color="bg-blue-200" loading={loading} />
                <StatCard icon={<FaUserTie size={28} className="text-green-800"/>} title="Nhà tuyển dụng" value={stats.employers} color="bg-green-200" loading={loading} />
                <StatCard icon={<FaClipboardList size={28} className="text-yellow-800"/>} title="Bài đăng" value={stats.jobPosts} color="bg-yellow-200" loading={loading} />
                <StatCard icon={<FaFileSignature size={28} className="text-purple-800"/>} title="Hồ sơ ứng tuyển" value={stats.applications} color="bg-purple-200" loading={loading} />
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Tăng trưởng người dùng theo tháng">
                    {lineData ? <Line data={lineData} options={commonChartOptions} /> : <p className="text-gray-500">Đang tải dữ liệu...</p>}
                </ChartCard>
                <ChartCard title="Bài đăng và ứng tuyển theo tháng">
                    {barData ? <Bar data={barData} options={commonChartOptions} /> : <p className="text-gray-500">Đang tải dữ liệu...</p>}
                </ChartCard>
                <ChartCard title="Top 5 ngành nghề">
                    {careersData ? <Pie data={careersData} options={pieChartOptions} /> : <p className="text-gray-500">Đang tải dữ liệu...</p>}
                </ChartCard>
                <ChartCard title="Trạng thái hồ sơ ứng tuyển">
                    {applicationStatusData ? <Bar data={applicationStatusData} options={commonChartOptions} /> : <p className="text-gray-500">Đang tải dữ liệu...</p>}
                </ChartCard>
            </div>
        </div>
    );
}