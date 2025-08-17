// src/pages/Dashboard.js
import React from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

export default function Dashboard() {
  const chartDataTuyenDung = {
    labels: ['Không trúng tuyển', 'Trúng tuyển', 'Phỏng vấn', 'Test', 'Liên hệ', 'Chờ xác nhận'],
    datasets: [
      {
        label: 'Số lượng',
        data: [3, 1, 4, 2, 1, 2],
        backgroundColor: ['#f43f5e', '#0ea5e9', '#a78bfa', '#fbbf24', '#10b981', '#f97316'],
      },
    ],
  };

  const chartDataUngVien = {
    labels: ['01/04', '05/04', '10/04', '15/04', '20/04'],
    datasets: [
      {
        label: 'Ứng viên',
        data: [1, 3, 2, 4, 2],
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f640',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Bản điều khiển tuyển dụng</h2>

      {/* Box thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Tất cả tin tuyển dụng</p>
          <p className="text-xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Tin chờ duyệt</p>
          <p className="text-xl font-bold text-yellow-500">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Tin hết hạn</p>
          <p className="text-xl font-bold text-red-500">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Ứng viên ứng tuyển</p>
          <p className="text-xl font-bold text-blue-500">0</p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Biểu đồ tuyển dụng</h3>
          <Bar data={chartDataTuyenDung} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Biểu đồ ứng viên</h3>
          <Line data={chartDataUngVien} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Biểu đồ tuyển dụng theo cấp bậc</h3>
        <div className="text-center text-gray-400 h-32 flex items-center justify-center border border-dashed rounded">
          (Đang cập nhật...)
        </div>
      </div>
    </div>
  );
}
