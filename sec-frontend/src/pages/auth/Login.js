import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Lấy user, login, navigate, và location
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Dùng useEffect để xử lý việc chuyển hướng sau khi đăng nhập thành công
    useEffect(() => {
        // Chỉ thực hiện khi `user` có giá trị (đã đăng nhập)
        if (user) {
            // Lấy đường dẫn mà người dùng định truy cập trước khi bị chuyển đến trang login
            const from = location.state?.from?.pathname || '/';

            // Nếu người dùng là admin, luôn chuyển hướng đến trang /admin
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
                return; // Dừng lại để không chạy code bên dưới
            }
            
            // Đối với các vai trò khác, chuyển hướng về trang họ muốn đến hoặc trang chủ
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]); // Mảng phụ thuộc của useEffect

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const res = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Email hoặc mật khẩu không đúng.');
            }
            
            setSuccessMessage(`Đăng nhập thành công! Hệ thống sẽ tự động chuyển hướng...`);
            
            // Gọi hàm login để cập nhật context.
            // useEffect ở trên sẽ tự động xử lý việc điều hướng.
            login(data);

        } catch (err) {
            setErrorMessage(err.message);
            setLoading(false); // Chỉ cho phép thử lại nếu có lỗi
        }
    };

    return (
        <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <FaLock className="h-6 w-6 text-red-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Đăng nhập tài khoản 
                    </h2>
                </div>
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Thất bại! </strong>
                        <span className="block sm:inline">{errorMessage}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Thành công! </strong>
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input
                            id="email" name="email" type="email" autoComplete="email" required
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#441da0] focus:border-[#441da0] sm:text-sm"
                            placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                        <input
                            id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#441da0] focus:border-[#441da0] sm:text-sm"
                            placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500">
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={loading || successMessage} 
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-gradient-to-r from-[#2c1e5d] to-[#1a1138] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <Link to="#" className="font-medium text-gray-600 hover:text-[#441da0]">Quên mật khẩu?</Link>
                        <Link to="/register" className="font-medium text-gray-600 hover:text-[#441da0]">Chưa có tài khoản? Đăng ký</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}