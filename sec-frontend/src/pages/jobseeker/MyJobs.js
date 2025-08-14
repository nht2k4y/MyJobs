// src/pages/jobseeker/MyJobs.js
import React from 'react';

export default function MyJobsPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Việc làm của tôi</h2>
      <p>Theo dõi các công việc bạn đã quan tâm và ứng tuyển.</p>

      {/* Phần 1: Việc làm đã ứng tuyển */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-semibold">Việc làm đã ứng tuyển</h3>
        <p className="text-gray-600">Danh sách các công việc bạn đã gửi hồ sơ sẽ hiển thị ở đây...</p>
      </div>

      {/* Phần 2: Việc làm đã lưu */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-semibold">Việc làm đã lưu</h3>
        <p className="text-gray-600">Danh sách các công việc bạn đã lưu lại để xem sau sẽ hiển thị ở đây...</p>
      </div>
    </div>
  );
}