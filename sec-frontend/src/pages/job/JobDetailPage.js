import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';
import {
    FaArrowLeft, FaBriefcase, FaBuilding, FaFileAlt,
    FaBullseye, FaGift, FaEnvelope, FaRegCalendarAlt, FaClock
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function JobDetailPage() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [showForm, setShowForm] = useState(false); // Dòng cho showForm
    const [isSubmitting, setIsSubmitting] = useState(false); // Dòng cho isSubmitting
    const navigate = useNavigate();
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const location = useLocation();
    const { user } = useAuth()
    

    // === GIỮ NGUYÊN LOGIC FETCH KẾT HỢP 2 API NHƯNG SỬA LẠI CÁCH GỘP DỮ LIỆU ===
    useEffect(() => {
        const fetchJobData = async () => {
            try {
                // 1. Gọi API chi tiết để lấy các trường description, requirements VÀ employer_id
                const detailRes = await fetch(`http://localhost:8000/job-posts/${id}`);
                if (!detailRes.ok) throw new Error("Không tìm thấy chi tiết công việc");
                const jobDetailData = await detailRes.json();

                // 2. Gọi API danh sách để lấy logo_url và poster_name đã được xử lý sẵn
                const listRes = await fetch(`http://localhost:8000/job-posts`);
                if (!listRes.ok) throw new Error("Không thể tải danh sách công việc");
                const jobListData = await listRes.json();
                
                const jobListItem = jobListData.find(item => item.id.toString() === id);

                // 3. Kết hợp dữ liệu
                const combinedJobData = {
                    ...jobDetailData, // Nền là dữ liệu chi tiết
                    // Lấy logo và tên từ danh sách nếu có, nếu không thì dùng lại từ chi tiết
                    logo_url: jobListItem?.logo_url || jobDetailData.logo_url,
                    poster_name: jobListItem?.poster_name || jobDetailData.employer?.company_info?.company_name,
                    // QUAN TRỌNG: Đảm bảo employer_id luôn tồn tại từ API chi tiết
                    employer_id: jobDetailData.employer_id, 
                };
                
                console.log("🔥 DỮ LIỆU KẾT HỢP CUỐI CÙNG:", combinedJobData);
                setJob(combinedJobData);

            } catch (err) {
                console.error("Lỗi khi fetch dữ liệu công việc:", err);
                setJob(null);
            }
        };

        fetchJobData();
    }, [id]);

    // BƯỚC 3: Hàm kiểm tra quyền trước khi mở form
    const handleApplyClick = () => {
        if (!user) {
            alert("Vui lòng đăng nhập để ứng tuyển!");
            // Chuyển hướng đến trang login và lưu lại trang hiện tại để quay về
            navigate('/login', { state: { from: location } }); 
            return;
        }

        if (user.role !== 'jobseeker') {
            alert("Chỉ tài khoản Người tìm việc mới có thể ứng tuyển.");
            return;
        }

        // Nếu mọi thứ hợp lệ, mở form ứng tuyển
        setShowForm(true);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn trang tải lại
        setIsSubmitting(true);
        setSubmitError('');

        const form = e.target;
        const formData = new FormData();

        // 1. Lấy dữ liệu từ các input, select, textarea
        formData.append('full_name', form.full_name.value);
        formData.append('gender', form.gender.value);
        formData.append('email', form.email.value);
        formData.append('phone', form.phone.value);
        formData.append('birth_year', form.birth_year.value);
        formData.append('preferred_location', form.preferred_location.value);
        formData.append('cover_letter', form.cover_letter.value);
        
        // 2. Lấy dữ liệu từ các radio button
        // Lưu ý: Đảm bảo chỉ có một radio được chọn cho mỗi nhóm
        const experiencePlaces = form.querySelector('input[name="experience_places"]:checked');
        const certificates = form.querySelector('input[name="certificates"]:checked');
        
        if (experiencePlaces) {
            formData.append('experience_places', experiencePlaces.value);
        } else {
            // Xử lý nếu người dùng chưa chọn (mặc dù có 'required', nhưng đây là phòng vệ)
            setSubmitError("Vui lòng chọn nơi bạn đã có kinh nghiệm làm việc.");
            setIsSubmitting(false);
            return;
        }
        
        if (certificates) {
            formData.append('certificates', certificates.value);
        } else {
            setSubmitError("Vui lòng chọn chứng chỉ ngoại ngữ của bạn.");
            setIsSubmitting(false);
            return;
        }

        // 3. Xử lý checkbox (trường experience_fields mà API nhận là list)
        const checkedFields = form.querySelectorAll('input[name="experience_fields"]:checked');
        if (checkedFields.length === 0) {
            setSubmitError("Vui lòng chọn ít nhất một lĩnh vực kinh nghiệm.");
            setIsSubmitting(false);
            return;
        }
        // API của bạn nhận List[str], FormData có thể gửi nhiều giá trị với cùng một key
        checkedFields.forEach(checkbox => {
            formData.append('experience_fields', checkbox.value);
        });
        
        // 4. Lấy file CV
        const cvFile = form.cv.files[0];
        if (cvFile) {
            formData.append('cv', cvFile);
        } else {
            setSubmitError("Vui lòng tải lên CV của bạn.");
            setIsSubmitting(false);
            return;
        }
        
        // 5. Thêm ID của công việc đang ứng tuyển
        formData.append('job_id', id);

        // --- GỬI DỮ LIỆU ĐẾN API ---
        try {
            const response = await fetch('http://localhost:8000/apply', { // <-- Endpoint của bạn
                method: 'POST',
                body: formData, // Khi dùng FormData, trình duyệt tự đặt Content-Type
            });

            if (!response.ok) {
                // Cố gắng đọc lỗi từ server để hiển thị
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `Lỗi máy chủ: ${response.statusText}`);
            }

            // Thành công
            alert('Hồ sơ của bạn đã được gửi thành công!');
            setShowForm(false); // Đóng form sau khi gửi

        } catch (error) {
            console.error('Lỗi khi ứng tuyển:', error);
            setSubmitError(`Gửi hồ sơ thất bại: ${error.message}`);
            // Không đóng form để người dùng có thể sửa lỗi
        } finally {
            setIsSubmitting(false); // Kết thúc trạng thái "đang gửi"
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleDateString('vi-VN');
    };

    if (!job) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <p className="text-lg text-gray-500">Đang tải dữ liệu hoặc không tìm thấy công việc...</p>
        </div>
    );
    
    // Hàm điều hướng sẽ hoạt động vì 'job.employer_id' đã được thêm vào
    const navigateToCompanyProfile = () => {
        if (job && job.employer_id) {
            // Sửa lại path cho đúng với router của bạn
            navigate(`/company/${job.employer_id}`);
        } else {
            console.warn("Không tìm thấy employer_id để điều hướng.");
        }
    };
    
    // Giao diện giữ nguyên, không thay đổi
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-gray-600 hover:text-[#441da0] font-semibold transition">
                        <FaArrowLeft />
                        <span>Quay lại danh sách</span>
                    </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-8 border-b">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                             {/* Bỏ gạch chân và thêm onClick */}
                            <div
                                onClick={navigateToCompanyProfile}
                                className="cursor-pointer transition-transform hover:scale-105"
                                title="Xem trang công ty"
                            >
                                <img
                                    src={job.logo_url ? `http://localhost:8000${job.logo_url}` : 'https://via.placeholder.com/150'}
                                    alt="Logo công ty"
                                    className="w-24 h-24 rounded-xl object-contain border p-2 flex-shrink-0"
                                />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                <div
                                    className="text-lg font-semibold text-[#441da0] cursor-pointer hover:text-indigo-700 transition-colors mb-3"
                                    onClick={navigateToCompanyProfile}
                                >
                                    {job.poster_name || "Tên công ty"}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 text-sm">
                                    <div className="flex items-center"><FaBriefcase className="mr-2"/><span>{job.position}</span></div>
                                    <div className="flex items-center"><FaRegCalendarAlt className="mr-2"/><span>Đăng ngày: {formatDate(job.created_at)}</span></div>
                                    {job.deadline && <div className="flex items-center text-red-600 font-medium"><FaClock className="mr-2"/><span>Hạn nộp: {formatDate(job.deadline)}</span></div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung chi tiết sẽ hiển thị */}
                    <div className="p-8 space-y-8">
                                            <div className="job-section">
                                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FaBuilding className="text-[#441da0]"/>Giới thiệu công ty</h2>
                                                <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.company_intro || "Chưa cung cấp thông tin."}</p>
                                            </div>
                                            <div className="job-section">
                                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FaFileAlt className="text-[#441da0]"/>Mô tả công việc</h2>
                                                <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.description || "Không có mô tả."}</p>
                                            </div>
                                            <div className="job-section">
                                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FaBullseye className="text-[#441da0]"/>Yêu cầu ứng viên</h2>
                                                <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.requirements || "Không yêu cầu cụ thể."}</p>
                                            </div>
                                            <div className="job-section">
                                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FaGift className="text-[#441da0]"/>Chính sách đãi ngộ</h2>
                                                <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.benefits || "Không có thông tin."}</p>
                                            </div>
                                            <div className="job-section">
                                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FaEnvelope className="text-[#441da0]"/>Cách thức ứng tuyển</h2>
                                                <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.how_to_apply || "Không có thông tin."}</p>
                                            </div>
                                        </div>
                </div>

                <div className="mt-8 text-center">
                    {/* BƯỚC 4: Cập nhật onClick của nút này */}
                    <button onClick={handleApplyClick} className="bg-[#441da0] text-white px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-800 transition font-bold text-lg">
                        Ứng tuyển ngay
                    </button>
                </div>
            </div>
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-3xl relative">
                        
                        {/* === TIÊU ĐỀ VÀ NÚT ĐÓNG === */}
                        <div className="flex justify-between items-center pb-4 border-b mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Ứng tuyển vị trí</h2>
                                <p className="text-[#441da0] font-semibold">{job.title}</p>
                            </div>
                            <button 
                                className="text-gray-400 hover:text-red-500 transition text-3xl disabled:text-gray-300" 
                                onClick={() => setShowForm(false)}
                                disabled={isSubmitting}
                            >
                                ×
                            </button>
                        </div>

                        {/* === FORM === */}
                        <form className="space-y-6 overflow-y-auto max-h-[70vh] pr-2" onSubmit={handleSubmit} noValidate>
                            {/* === KHỐI THÔNG TIN CÁ NHÂN === */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                                    <input name="full_name" id="full_name" type="text" defaultValue={user?.name || ''} className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                                    <select name="gender" id="gender" className="form-input" required>
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input name="email" id="email" type="email" defaultValue={user?.email || ''} className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                    <input name="phone" id="phone" type="tel" placeholder="0123456789" className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="birth_year" className="block text-sm font-medium text-gray-700 mb-1">Năm sinh *</label>
                                    <input name="birth_year" id="birth_year" type="number" placeholder="1995" className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="preferred_location" className="block text-sm font-medium text-gray-700 mb-1">Bạn muốn làm việc tại *</label>
                                    <input name="preferred_location" id="preferred_location" type="text" placeholder="Hà Nội, TP.HCM,..." className="form-input" required />
                                </div>
                            </div>

                            {/* === KHỐI KINH NGHIỆM VÀ CHỨNG CHỈ === */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                                <fieldset className="md:col-span-1">
                                    <legend className="text-sm font-medium text-gray-700 mb-2">Kinh nghiệm làm việc tại *</legend>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2"><input type="radio" name="experience_places" value="Công ty nước ngoài" className="form-radio" required/> Công ty nước ngoài</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="experience_places" value="Công ty Việt Nam" className="form-radio" /> Công ty Việt Nam</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="experience_places" value="Nhà nước/NGO" className="form-radio" /> Nhà nước/NGO</label>
                                    </div>
                                </fieldset>
                                <fieldset className="md:col-span-1">
                                    <legend className="text-sm font-medium text-gray-700 mb-2">Chứng chỉ ngoại ngữ *</legend>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2"><input type="radio" name="certificates" value="Không có" className="form-radio" required/> Không có</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="certificates" value="IELTS" className="form-radio" /> IELTS</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="certificates" value="TOEIC" className="form-radio" /> TOEIC</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="certificates" value="TOEFL" className="form-radio" /> TOEFL</label>
                                    </div>
                                </fieldset>
                                <fieldset className="md:col-span-1">
                                    <legend className="text-sm font-medium text-gray-700 mb-2">Lĩnh vực kinh nghiệm *</legend>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2"><input type="checkbox" name="experience_fields" value="Marketing" className="form-checkbox"/> Marketing</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="experience_fields" value="Bán hàng" className="form-checkbox"/> Bán hàng</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="experience_fields" value="Lập trình" className="form-checkbox"/> Lập trình</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="experience_fields" value="Kế toán" className="form-checkbox"/> Kế toán</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="experience_fields" value="Thiết kế" className="form-checkbox"/> Thiết kế</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="experience_fields" value="Dịch vụ khách hàng" className="form-checkbox"/> Dịch vụ khách hàng</label>
                                    </div>
                                </fieldset>
                            </div>
                            
                            {/* === KHỐI THƯ GIỚI THIỆU VÀ CV === */}
                            <div className="pt-4 border-t">
                                <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-1">Thư ứng tuyển (Cover Letter) *</label>
                                <textarea name="cover_letter" id="cover_letter" placeholder="Viết vài dòng giới thiệu về bản thân và tại sao bạn phù hợp với vị trí này..." className="form-input h-28" required></textarea>
                            </div>
                            <div>
                                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">Tải lên CV của bạn *</label>
                                <input name="cv" id="cv" type="file" accept=".pdf,.doc,.docx" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#441da0] hover:file:bg-violet-100" required />
                                <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file .pdf, .doc, .docx</p>
                            </div>

                            {/* === HIỂN THỊ LỖI (NẾU CÓ) === */}
                            {submitError && (
                                <div className="text-center p-3 bg-red-100 text-red-700 rounded-md text-sm font-medium">
                                    {submitError}
                                </div>
                            )}
                            
                            {/* === CÁC NÚT BẤM === */}
                            <div className="flex gap-4 pt-6 border-t">
                                <button 
                                    type="submit" 
                                    className="w-full bg-[#441da0] text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-800 transition font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'ĐANG GỬI...' : 'GỬI HỒ SƠ ỨNG TUYỂN'}
                                </button>
                                <button 
                                    type="button" 
                                    className="w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    onClick={() => setShowForm(false)}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
        </div>
    );
}