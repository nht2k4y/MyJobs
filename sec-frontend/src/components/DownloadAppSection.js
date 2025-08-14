import React from 'react';

export default function DownloadAppSection() {
  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow max-w-7xl mx-auto mt-12 text-center space-y-6">
      <h3 className="text-2xl font-bold text-[#fca34d]">Tải ứng dụng miễn phí</h3>
      <p className="text-[#6d7681] max-w-3xl mx-auto">
        Tìm việc hiệu quả bằng cách tải Myjob về di động của bạn và sẵn sàng nhận việc làm ngay hôm nay!
      </p>
      <div className="flex justify-center max-w-2xl mx-auto space-x-4">
        <input
          type="text"
          placeholder="Nhập số điện thoại"
          className="flex-1 border rounded px-4 py-2"
        />
        <button
          className="text-white px-6 py-2 rounded"
          style={{ backgroundColor: '#fca34d' }}
        >
          Gửi đi
        </button>
      </div>
      <div className="flex justify-center space-x-6">
        <img src="/icons/google-play-badge.jpg" alt="Google Play" className="h-14" />
        <img src="/icons/app-store-badge.jpg" alt="App Store" className="h-14" />
      </div>
    </div>
  );
}
