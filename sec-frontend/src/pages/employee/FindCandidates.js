// src/pages/employee/FindCandidates.js

import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaMoneyBillWave, FaBriefcase, FaTimes } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

// Dữ liệu ứng viên giả lập
const mockCandidates = [
  {
    id: 1,
    name: 'Bùi Khánh Huy',
    age: 23,
    title: 'Software Engineer',
    salary: '10 triệu - 10 triệu',
    experience: '1 năm kinh nghiệm',
    location: 'TP.HCM',
    updatedAt: '21/04/2023',
    interestedCount: 1,
  },
  {
    id: 2,
    name: 'Bùi Khánh Huy',
    age: 23,
    title: 'Lập trình viên Backend',
    salary: '10 triệu - 10 triệu',
    experience: 'Dưới 1 năm kinh nghiệm',
    location: 'TP.HCM',
    updatedAt: '15/06/2023',
    interestedCount: 2,
  },
  // Bạn có thể thêm các ứng viên khác ở đây
];

// --- Component con: Thẻ thông tin ứng viên ---
const CandidateCard = ({ candidate }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-start justify-between">
    <div>
      <h3 className="font-bold text-lg text-indigo-800">{`${candidate.name} (${candidate.age} tuổi)`}</h3>
      <p className="text-gray-600 mb-3">{candidate.title}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          <FaMoneyBillWave className="mr-1.5 text-green-500" /> {candidate.salary}
        </span>
        <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          <FaBriefcase className="mr-1.5 text-blue-500" /> {candidate.experience}
        </span>
        <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          <FaMapMarkerAlt className="mr-1.5 text-red-500" /> {candidate.location}
        </span>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-4">
      <p className="text-xs text-gray-500">Thời gian cập nhật: {candidate.updatedAt}</p>
      <p className="text-xs text-gray-500 mb-2">NTD quan tâm: {candidate.interestedCount}</p>
      <button className="text-gray-400 hover:text-gray-600">
        <BsThreeDotsVertical size={20} />
      </button>
    </div>
  </div>
);


// --- Component con: Dropdown cho bộ lọc ---
const FilterDropdown = ({ label, options }) => (
    <div>
        <label className="text-sm font-semibold text-gray-700 mb-1 block">{label}</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    </div>
);


export default function FindCandidates() {
  const [candidates] = useState(mockCandidates);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      {/* Tiêu đề */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tìm kiếm ứng viên</h1>
        <p className="text-sm text-gray-500">Chuyên</p>
      </div>

      {/* Thanh tìm kiếm chính */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Khánh Huy" 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Chọn Tỉnh/Thành phố</option>
          <option value="hcm">TP. Hồ Chí Minh</option>
          <option value="hanoi">Hà Nội</option>
          <option value="danang">Đà Nẵng</option>
        </select>
        <button className="bg-orange-500 text-white font-bold py-2 px-6 rounded-md hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center">
          <FaSearch className="mr-2" />
          TÌM KIẾM
        </button>
      </div>
      
      {/* Khu vực nội dung chính: Bộ lọc và Kết quả */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cột trái: Bộ lọc nâng cao */}
        <div className="lg:col-span-4 bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Bộ lọc nâng cao</h2>
            <button className="flex items-center text-sm text-red-500 hover:text-red-700 font-semibold">
              <FaTimes className="mr-1" /> Xóa lọc
            </button>
          </div>
          <div className="space-y-4">
              <FilterDropdown label="Ngành nghề" options={['Tất cả ngành nghề', 'Công nghệ thông tin', 'Marketing', 'Kế toán']} />
              <FilterDropdown label="Kinh nghiệm" options={['Tất cả kinh nghiệm', 'Chưa có kinh nghiệm', 'Dưới 1 năm', '1 năm', '2 năm']} />
              <FilterDropdown label="Cấp bậc" options={['Tất cả cấp bậc', 'Intern', 'Junior', 'Senior', 'Manager']} />
              <FilterDropdown label="Học vấn" options={['Tất cả học vấn', 'Đại học', 'Cao đẳng', 'Trung cấp']} />
              <FilterDropdown label="Nơi làm việc" options={['Tất cả nơi làm việc', 'TP.HCM', 'Hà Nội', 'Đà Nẵng']} />
              <FilterDropdown label="Hình thức làm việc" options={['Tất cả hình thức làm việc', 'Toàn thời gian', 'Bán thời gian', 'Remote']} />
              <FilterDropdown label="Giới tính" options={['Tất cả giới tính', 'Nam', 'Nữ']} />
              <FilterDropdown label="Tình trạng hôn nhân" options={['Tất cả tình trạng hôn nhân', 'Độc thân', 'Đã kết hôn']} />
          </div>
        </div>

        {/* Cột phải: Kết quả tìm kiếm */}
        <div className="lg:col-span-8">
            <div className="mb-4">
                <p className="font-semibold text-gray-700">Kết quả tìm thấy: <span className="text-indigo-800 font-bold">{candidates.length} hồ sơ</span></p>
            </div>
            <div className="space-y-4">
                {candidates.map(candidate => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}