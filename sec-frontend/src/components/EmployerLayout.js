// src/components/EmployerLayout.js
import React from 'react'; // Bỏ các import không dùng đến
import { useSearchParams } from 'react-router-dom';
import { 
    FaClipboardList, FaUserCheck, FaSearch, FaBuilding, FaUserCog, 
    FaFileAlt, FaWallet, FaLevelUpAlt 
} from 'react-icons/fa';

// Import các component con (Không thay đổi)
import PostManager from '../pages/employee/PostManager';
import ApplicationManager from '../pages/employee/ApplicationManager';
import Dashboard from '../pages/employee/Dashboard';
import CompanyInfo from '../pages/employee/CompanyInfo';
import SavedProfiles from '../pages/employee/SavedProfiles';
import FindCandidates from '../pages/employee/FindCandidates';

// --- GIAO DIỆN CỦA SidebarButton ĐÃ ĐƯỢC CẬP NHẬT ---
const SidebarButton = ({ text, icon: Icon, onClick, isActive }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm text-left transition-all duration-200 group ${
                isActive 
                ? 'bg-white text-indigo-800 font-bold shadow-sm' 
                : 'text-indigo-100 hover:bg-white/10 hover:text-white'
            }`}
        >
            <Icon className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${isActive ? 'text-indigo-700' : 'text-indigo-300 group-hover:text-white'}`} />
            <span>{text}</span>
        </button>
    </li>
);

// --- Component MỚI cho các nút chưa có chức năng ---
const DisabledSidebarButton = ({ text, icon: Icon }) => (
    <li>
        <button
            disabled
            className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm text-left text-indigo-400 opacity-50 cursor-not-allowed"
        >
            <Icon className="mr-3 flex-shrink-0 h-5 w-5 text-indigo-400" />
            <span>{text}</span>
        </button>
    </li>
);


export default function EmployerLayout() {
  // === TOÀN BỘ LOGIC CHỨC NĂNG CỦA BẠN ĐƯỢC GIỮ NGUYÊN 100% ===
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get('page') || 'dashboard';

  const navigateToPage = (pageName) => {
    setSearchParams({ page: pageName });
  };
  
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'posts':
        return <PostManager />;
      case 'applications':
        return <ApplicationManager />;
      case 'company-info':
        return <CompanyInfo />;
      case 'saved-profiles':
        return <SavedProfiles />;
      case 'find-candidates':
        return <FindCandidates />;
      default:
        return <Dashboard />;
    }
  };

  return (
    // Nền chung của trang
    <div className="flex min-h-screen bg-gray-100">
      
      {/* --- GIAO DIỆN SIDEBAR ĐÃ ĐƯỢC CẬP NHẬT (NỀN TÍM ĐEN) --- */}
      <div className="w-64 bg-gradient-to-b from-[#2c1e5d] to-[#1a1138] p-4 flex flex-col flex-shrink-0 shadow-2xl">
        <div className="mb-10 text-center">
          {/* Bạn có thể thay bằng logo ảnh nếu muốn */}
          <h1 className="text-3xl font-bold text-white mb-1 tracking-wider">MyJob</h1>
          <p className="text-sm text-indigo-200">Nhà tuyển dụng</p>
        </div>

        <ul className="space-y-2 flex-1">
          {/* Nhóm 1 */}
          <li className="font-semibold text-indigo-300 text-xs uppercase tracking-wider mt-4 mb-2 px-4">Tổng quan</li>
          <SidebarButton text="Bản điều khiển" icon={FaClipboardList} onClick={() => navigateToPage('dashboard')} isActive={currentPage === 'dashboard'} />

          {/* Nhóm 2 */}
          <li className="font-semibold text-indigo-300 text-xs uppercase tracking-wider mt-4 mb-2 px-4">Quản lý đăng tuyển</li>
          <SidebarButton text="Danh sách tin đăng" icon={FaClipboardList} onClick={() => navigateToPage('posts')} isActive={currentPage === 'posts'} />

          {/* Nhóm 3 */}
          <li className="font-semibold text-indigo-300 text-xs uppercase tracking-wider mt-4 mb-2 px-4">Quản lý ứng viên</li>
          <SidebarButton text="Hồ sơ ứng tuyển" icon={FaUserCheck} onClick={() => navigateToPage('applications')} isActive={currentPage === 'applications'} />
          <SidebarButton text="Hồ sơ đã lưu" icon={FaFileAlt} onClick={() => navigateToPage('saved-profiles')} isActive={currentPage === 'saved-profiles'} />
          <SidebarButton 
              text="Tìm ứng viên" 
              icon={FaSearch} 
              onClick={() => navigateToPage('find-candidates')} 
              isActive={currentPage === 'find-candidates'} 
          />
          
          {/* Nhóm 4 */}
          <li className="font-semibold text-indigo-300 text-xs uppercase tracking-wider mt-4 mb-2 px-4">Quản lý tài khoản</li>
          <SidebarButton text="Thông tin công ty" icon={FaBuilding} onClick={() => navigateToPage('company-info')} isActive={currentPage === 'company-info'} />
          <DisabledSidebarButton text="Tài khoản" icon={FaUserCog} />

          {/* === CÁC MỤC MỚI (TỰ CHẾ) === */}
          <li className="font-semibold text-indigo-300 text-xs uppercase tracking-wider mt-4 mb-2 px-4">Dịch vụ & Tiện ích</li>
          <DisabledSidebarButton text="Nâng cấp tài khoản" icon={FaLevelUpAlt} />
          <DisabledSidebarButton text="Lịch sử giao dịch" icon={FaWallet} />
        </ul>
      </div>

      {/* Main Content (Không thay đổi) */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}