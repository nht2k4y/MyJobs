import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import JobsPage from './pages/job/JobsPage';
import JobDetailPage from './pages/job/JobDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

// Layout và trang của Nhà tuyển dụng
import EmployerLayout from './components/EmployerLayout';
import CompanyProfile from './pages/employee/CompanyProfile';

// Layout và trang của Admin
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Notifications from './pages/admin/Notifications';
import UsersManager from './pages/admin/UsersManager';
import Careers from './pages/admin/Careers';
import Locations from './pages/admin/Locations';
import Approval from './pages/admin/Approval';

// === BẮT ĐẦU SỬA LỖI: Import các component mới của JobSeeker ===
import JobSeekerLayout from './components/JobSeekerLayout';
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import JobSeekerProfile from './pages/jobseeker/Profile';
import MyJobsPage from './pages/jobseeker/MyJobs';
import MyCompaniesPage from './pages/jobseeker/MyCompanies';
import NotificationsPage from './pages/jobseeker/Notifications';
import SettingsPage from './pages/jobseeker/Settings';


export default function AppRouter() {
    return (
        <Routes>
            {/* ========================================================== */}
            {/* === KHỐI LAYOUT CHÍNH (CÓ NAVBAR VÀ FOOTER) === */}
            {/* ========================================================== */}
            <Route path="/" element={<MainLayout />}>
                
                {/* --- Các trang công khai --- */}
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="jobs/:id" element={<JobDetailPage />} />
                <Route path="company/:employerId" element={<CompanyProfile />} />

                {/* --- Route cho Nhà tuyển dụng (đã có layout riêng bên trong) --- */}
                <Route 
                  path="employer" 
                  element={
                    <ProtectedRoute role="employer">
                      <EmployerLayout />
                    </ProtectedRoute>
                  } 
                />
                
                {/* === BẮT ĐẦU SỬA LỖI: Cập nhật các route con của JobSeekerLayout bằng các component thật sự === */}
                <Route
                    path="my-profile"
                    element={
                        <ProtectedRoute role="jobseeker">
                            <JobSeekerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<JobSeekerDashboard />} />
                    <Route path="profile" element={<JobSeekerProfile />} />
                    <Route path="myjobs" element={<MyJobsPage />} />
                    <Route path="mycompanies" element={<MyCompaniesPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

            </Route>

            {/* === KHỐI LAYOUT ADMIN (VẪN GIỮ NGUYÊN) === */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="users" element={<UsersManager />} />
                <Route path="careers" element={<Careers />} />
                <Route path="locations" element={<Locations />} />
                <Route path="approval" element={<Approval />} />
            </Route>
        </Routes>
    );
}