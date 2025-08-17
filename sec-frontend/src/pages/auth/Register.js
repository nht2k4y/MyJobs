import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'jobseeker',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Gửi yêu cầu đăng ký
            const registerRes = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const registerData = await registerRes.json();
            
            if (!registerRes.ok) {
                throw new Error(registerData.detail || 'Đăng ký thất bại');
            }

            // 2. Nếu đăng ký thành công, tự động gọi API đăng nhập
            const loginData = new URLSearchParams();
            loginData.append('username', form.email);
            loginData.append('password', form.password);

            const loginRes = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: loginData.toString(),
            });
            const loginInfo = await loginRes.json();
            
            if (!loginRes.ok) {
                // Xử lý trường hợp đăng ký OK nhưng tự động đăng nhập thất bại
                alert('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
                navigate('/login');
                return; // Kết thúc hàm ở đây
            }

            // 3. Nếu đăng nhập thành công, cập nhật context và chuyển hướng ngay
            login(loginInfo);
            navigate('/'); // Chuyển hướng ngay lập tức đến trang chủ

        } catch (err) {
            setError(err.message);
            setLoading(false); // Cho phép thử lại nếu có lỗi
        }
    };

    return (
        <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <FaUserPlus className="h-6 w-6 text-green-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Đăng ký tài khoản</h2>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Lỗi! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Họ tên</label>
                        <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#441da0] focus:border-[#441da0] sm:text-sm" placeholder="Nhập họ tên của bạn"/>
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#441da0] focus:border-[#441da0] sm:text-sm" placeholder="Nhập địa chỉ email"/>
                    </div>
                    <div className="relative">
                        <label htmlFor="password">Mật khẩu</label>
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange} className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#441da0] focus:border-[#441da0] sm:text-sm" placeholder="Nhập mật khẩu"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                    </div>
                    <div>
                        <label htmlFor="role">Bạn là</label>
                        <select id="role" name="role" value={form.role} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#441da0] focus:border-[#441da0] sm:text-sm rounded-md">
                            <option value="jobseeker">Người tìm việc</option>
                            <option value="employer">Nhà tuyển dụng</option>
                        </select>
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-gradient-to-r from-[#2c1e5d] to-[#1a1138] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <Link to="/login" className="font-medium text-gray-600 hover:text-[#441da0]">Đã có tài khoản? Đăng nhập</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}