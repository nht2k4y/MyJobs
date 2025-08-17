import React from 'react';

export default function NotificationsPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">MyJob Thông báo</h2>
      <p className="text-gray-600 mb-6">
        Tất cả các thông báo từ hệ thống, từ nhà tuyển dụng, và các cập nhật trạng thái hồ sơ sẽ được hiển thị ở đây.
      </p>
      
      <div className="space-y-4">
        {/* Ví dụ về một thông báo (chưa đọc) */}
        <div className="p-4 border-l-4 border-myjob-purple bg-purple-50 rounded-r-lg flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
             <div className="w-2.5 h-2.5 bg-myjob-purple rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Công ty Zest Media vừa xem hồ sơ của bạn</p>
            <p className="text-sm text-gray-600">Lúc 10:30, Hôm nay</p>
          </div>
        </div>

        {/* Ví dụ về một thông báo (đã đọc) */}
        <div className="p-4 border-l-4 border-gray-300 bg-gray-50 rounded-r-lg flex items-start gap-4">
           <div className="flex-shrink-0 mt-1">
             <div className="w-2.5 h-2.5 bg-transparent rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-700">Hồ sơ ứng tuyển vị trí "Content Creator" đã được gửi thành công.</p>
            <p className="text-sm text-gray-500">Lúc 15:45, Hôm qua</p>
          </div>
        </div>

        <div className="p-4 border-l-4 border-gray-300 bg-gray-50 rounded-r-lg flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
             <div className="w-2.5 h-2.5 bg-transparent rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-700">Chào mừng bạn đến với MyJob! Hãy hoàn thiện hồ sơ để tăng cơ hội tìm được việc làm mơ ước.</p>
            <p className="text-sm text-gray-500">2 ngày trước</p>
          </div>
        </div>
      </div>
    </div>
  );
}