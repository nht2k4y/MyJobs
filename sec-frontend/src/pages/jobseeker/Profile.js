import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner, FaEdit, FaPlus, FaTrash, FaTimes, FaStar, FaUpload, FaSearch, FaDownload, FaFileAlt, FaBriefcase, FaUserTie, FaDollarSign, FaRegCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

// Giả định các file form này đã được tạo trong thư mục `src/components/forms/`
// Nếu đường dẫn khác, bạn vui lòng sửa lại cho đúng.
import Modal from '../../components/jobseekerProfile/Modal';
import ProfileUpdateForm from '../../components/jobseekerProfile/ProfileUpdateForm';
import GeneralInfoForm from '../../components/jobseekerProfile/GeneralInfoForm';
import WorkExperienceForm from '../../components/jobseekerProfile/WorkExperienceForm';
import EducationForm from '../../components/jobseekerProfile/EducationForm';
import CertificateForm from '../../components/jobseekerProfile/CertificateForm';
import SkillForm from '../../components/jobseekerProfile/SkillForm';
import UploadCVForm from '../../components/jobseekerProfile/UploadCVForm';

// ===============================================
// === CÁC COMPONENT CON (ĐỊNH NGHĨA NỘI BỘ) ===
// ===============================================

const SectionCard = ({ id, title, onEdit, onAdd, children }) => (
    <div id={id} className="bg-white p-6 rounded-lg shadow-md scroll-mt-24">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {onEdit && (
                <button onClick={onEdit} className="text-orange-500 hover:text-orange-700 p-2 rounded-full bg-orange-100">
                    <FaEdit />
                </button>
            )}
        </div>
        <div>{children}</div>
        {onAdd && (
            <button onClick={onAdd} className="mt-4 text-myjob-purple font-bold flex items-center gap-2 text-sm hover:underline">
                <FaPlus /> Thêm mới
            </button>
        )}
    </div>
);

const TimelineItem = ({ item, onEdit, onDelete, type }) => {
    const title = type === 'experience' ? item.job_title : item.degree_name;
    const subtitle = type === 'experience' ? item.company_name : item.school_name;
    const date = `${new Date(item.start_date).toLocaleDateString('vi-VN')} - ${item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : 'Hiện tại'}`;
    const description = type === 'experience' ? item.description : item.major;

    return (
        <div className="relative pl-8 pb-8 border-l-2 border-gray-200 group last:pb-0 last:border-transparent">
            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-myjob-purple rounded-full"></div>
            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="text-blue-500"><FaEdit /></button>
                <button onClick={() => onDelete(item.id)} className="text-red-500"><FaTrash /></button>
            </div>
            <p className="font-bold text-gray-800">{title}</p>
            <p className="text-sm font-medium text-gray-600">{subtitle}</p>
            <p className="text-xs text-gray-500 mb-2">{date}</p>
            {description && <p className="text-sm text-gray-700 whitespace-pre-line">{description}</p>}
        </div>
    );
};

const CertificateItem = ({ item, onEdit, onDelete }) => {
    const date = `${new Date(item.issue_date).toLocaleDateString('vi-VN')} - ${item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}`;
    return (
        <div className="relative pl-8 pb-8 border-l-2 border-gray-200 group last:pb-0 last:border-transparent">
            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-myjob-purple rounded-full"></div>
            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="text-blue-500"><FaEdit /></button>
                <button onClick={() => onDelete(item.id)} className="text-red-500"><FaTrash /></button>
            </div>
            <p className="font-bold text-gray-800">{item.certificate_name}</p>
            <p className="text-sm font-medium text-gray-600">{item.issuing_organization}</p>
            <p className="text-xs text-gray-500 mb-2">{date}</p>
        </div>
    );
};

const SkillItem = ({ item, onEdit, onDelete }) => (
    <div className="flex justify-between items-center py-2 group">
        <div className="flex items-center gap-4">
            <span className="font-medium text-gray-800">{item.skill_name || item.language_name}</span>
            <div className="flex">
                {[...Array(5)].map((_, i) => <FaStar key={i} color={i < item.proficiency_level ? '#ffc107' : '#e4e5e9'} />)}
            </div>
        </div>
         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)} className="text-blue-500"><FaEdit /></button>
            <button onClick={() => onDelete(item.id)} className="text-red-500"><FaTrash /></button>
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <strong className="font-medium text-gray-500 block">{label}</strong>
        <span className="text-gray-800">{value || 'Chưa cập nhật'}</span>
    </div>
);

const CVCard = ({ cv, onDelete }) => {
    // THAY ĐỔI 1: Xây dựng URL đến file PDF thực tế
    // Giả định server của bạn phục vụ file CV tại /static/uploaded_cvs/
    // và object 'cv' có thuộc tính 'cv_filename'
    const cvUrl = cv.cv_filename 
        ? `http://localhost:8000/static/uploaded_cvs/${cv.cv_filename}`
        : null;

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col bg-white">
            {/* Phần Thumbnail */}
            <div className="h-56 bg-gray-100 flex items-center justify-center relative group">
                
                {/* THAY ĐỔI 2: Thay thế <img> bằng <iframe> để hiển thị PDF */}
                {cvUrl ? (
                    <iframe
                        src={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        title={cv.desired_position || 'CV Preview'}
                        className="w-full h-full border-0"
                        // Thuộc tính không chuẩn nhưng hữu ích trên một số trình duyệt
                        scrolling="no" 
                    >
                        <p>Trình duyệt của bạn không hỗ trợ xem PDF. <a href={cvUrl}>Tải xuống tại đây</a>.</p>
                    </iframe>
                ) : (
                    // Fallback nếu không có file CV
                    <div className="text-center text-gray-500">
                        <FaFileAlt className="text-4xl mx-auto mb-2" />
                        <p>Không có ảnh xem trước</p>
                    </div>
                )}
                
                {/* Lớp phủ khi hover (giữ nguyên) */}
                {cvUrl && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-white font-bold px-4 py-2 rounded-md bg-myjob-purple opacity-0 group-hover:opacity-100 transition-opacity">
                            Xem chi tiết
                        </a>
                    </div>
                )}
                 
                 {/* Nút toggle (giữ nguyên) */}
                <div className="absolute top-2 right-2">
                    <button className="text-xs bg-white/80 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full flex items-center gap-1 shadow">
                        <FaSearch size={10} />
                        <span>Cho phép tìm kiếm</span>
                    </button>
                </div>
            </div>

            {/* Phần Nội dung (giữ nguyên) */}
            <div className="p-4 flex-grow border-t">
                <h4 className="font-bold text-gray-800 truncate" title={cv.desired_position || 'Hồ sơ chung'}>
                    {cv.desired_position || 'Hồ sơ chung'}
                </h4>
                <p className="text-sm text-gray-500">Cập nhật lần cuối: {new Date(cv.updated_at).toLocaleDateString('vi-VN')}</p>
            </div>

            {/* Phần Chân trang (Footer) - Cập nhật nút Tải xuống */}
            <div className="px-4 py-2 bg-gray-50 border-t flex justify-between items-center">
                <a href={cvUrl} download className="text-sm font-semibold text-myjob-purple flex items-center gap-1.5 hover:underline">
                    <FaDownload />
                    <span>Tải xuống</span>
                </a>
                <button onClick={() => onDelete(cv.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

// === COMPONENT CHÍNH CỦA TRANG PROFILE ===
// =======================================
export default function JobSeekerProfile() {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null, title: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/jobseeker-profiles/me', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Không thể tải dữ liệu hồ sơ.');
            const data = await res.json();
            setProfile(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);
    
    const handleOpenModal = (type, title, data = null) => setModalState({ isOpen: true, type, data, title });
    const handleCloseModal = () => setModalState({ isOpen: false });

    // --- CÁC HÀM handleSave và handleDelete GIỮ NGUYÊN ---
    const handleSave = async (formData) => {
        setIsSubmitting(true);
        const { type, data } = modalState;
        const isEditing = data && data.id;
        let endpoint = '';
        let method = isEditing ? 'PUT' : 'POST';
        let body = {};
        let isFormData = false;

        switch (type) {
            case 'personalInfo':
                endpoint = `http://localhost:8000/users/me/update-personal-info`;
                method = 'POST';
                body = { name: formData.name, phone_number: formData.phone_number, date_of_birth: formData.date_of_birth, gender: formData.gender, marital_status: formData.marital_status, location_id: formData.location_id, address: formData.address };
                break;
            case 'generalInfo':
                endpoint = `http://localhost:8000/jobseeker-profiles/me`;
                method = 'POST';
                body = { desired_position: formData.desired_position, desired_level: formData.desired_level, education_level: formData.education_level, experience_years: formData.experience_years, workplace_type: formData.workplace_type, employment_type: formData.employment_type, min_salary: formData.min_salary, max_salary: formData.max_salary, career_goals: formData.career_goals, career_id: formData.career_id, location_id: formData.location_id };
                break;
            case 'workExperience':
                endpoint = `http://localhost:8000/jobseeker-profiles/me/work-experiences${isEditing ? `/${data.id}` : ''}`;
                body = { job_title: formData.job_title, company_name: formData.company_name, start_date: formData.start_date, end_date: formData.end_date || null, description: formData.description };
                break;
            case 'education':
                endpoint = `http://localhost:8000/jobseeker-profiles/me/educations${isEditing ? `/${data.id}` : ''}`;
                body = formData;
                break;
            case 'certificate':
                endpoint = `http://localhost:8000/jobseeker-profiles/me/certificates${isEditing ? `/${data.id}` : ''}`;
                body = formData;
                break;
            case 'languageSkill':
                endpoint = `http://localhost:8000/jobseeker-profiles/me/language-skills${isEditing ? `/${data.id}` : ''}`;
                body = formData;
                break;
            case 'technicalSkill':
                endpoint = `http://localhost:8000/jobseeker-profiles/me/technical-skills${isEditing ? `/${data.id}` : ''}`;
                body = formData;
                break;
            case 'uploadCV':
                endpoint = `http://localhost:8000/jobseeker-profiles/me/upload-cv-with-info`;
                method = 'POST';
                body = formData;
                isFormData = true;
                break;
            default:
                setIsSubmitting(false);
                return;
        }

        try {
            const headers = isFormData ? { 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            const bodyToSend = isFormData ? body : JSON.stringify(body);
            const res = await fetch(endpoint, { method, headers, body: bodyToSend });

            if (!res.ok) {
                 const errorData = await res.json().catch(() => ({ detail: `Lỗi không xác định.` }));
                 throw new Error(`Lỗi khi lưu ${modalState.title}: ${errorData.detail}`);
            }
            alert('Lưu thành công!');
            handleCloseModal();
            fetchProfile();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (type, id) => {
        const typeMap = {
            workExperience: { name: 'kinh nghiệm làm việc', endpoint: 'work-experiences' },
            education: { name: 'thông tin học vấn', endpoint: 'educations' },
            certificate: { name: 'chứng chỉ', endpoint: 'certificates' },
            languageSkill: { name: 'kỹ năng ngôn ngữ', endpoint: 'language-skills' },
            technicalSkill: { name: 'kỹ năng chuyên môn', endpoint: 'technical-skills' },
            uploadedCV: { name: 'hồ sơ', endpoint: 'uploaded-cvs'}
        };
        const itemInfo = typeMap[type];
        if (!itemInfo) return;
        if (window.confirm(`Bạn có chắc muốn xóa mục ${itemInfo.name} này?`)) {
            try {
                const endpoint = `http://localhost:8000/jobseeker-profiles/me/${itemInfo.endpoint}/${id}`;
                const res = await fetch(endpoint, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (res.status === 204) {
                    alert('Xóa thành công!');
                    fetchProfile();
                } else {
                    const errorData = await res.json().catch(() => ({ detail: 'Lỗi không xác định từ server.' }));
                    throw new Error(errorData.detail);
                }
            } catch (error) {
                alert(`Lỗi khi xóa: ${error.message}`);
            }
        }
    };

    if (loading || !profile) {
        return <div className="p-8 text-center"><FaSpinner className="animate-spin inline mr-2" /> Đang tải hồ sơ...</div>;
    }

    // --- PHẦN RETURN ĐÃ SỬA LẠI HOÀN CHỈNH ---
    return (
        <>
            {!isEditMode ? (
                // --- GIAO DIỆN CHẾ ĐỘ XEM (SUMMARY VIEW) ---
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* === CỘT BÊN TRÁI (NỘI DUNG CHÍNH) === */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* === ĐÂY LÀ KHỐI MỚI ĐÃ SỬA THEO MẪU === */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-xl font-bold text-gray-800">MyJob Profile</h2>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 text-sm bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-full hover:bg-green-200 transition">
                                        <FaStar /><span>Cho phép tìm kiếm</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-sm bg-orange-100 text-orange-600 font-semibold px-3 py-1.5 rounded-full hover:bg-orange-200 transition">
                                        <FaDownload /><span>Tải xuống</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <img src={profile.user?.avatar_url ? `http://localhost:8000${profile.user.avatar_url}` : '/default-avatar.png'} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900 uppercase">{profile.user?.name || 'Chưa cập nhật'}</h3>
                                    <p className="text-md text-gray-600 font-medium">{profile.desired_position || 'Chưa cập nhật vị trí'}</p>
                                    <div className="pt-2 space-y-1.5 text-sm">
                                        <p className="flex items-center"><FaBriefcase className="text-gray-400 w-4 h-4 mr-3" /><span className="text-gray-500">Kinh nghiệm:</span><span className="font-semibold text-gray-800 ml-2">{profile.experience_years || 'Chưa cập nhật'}</span></p>
                                        <p className="flex items-center"><FaUserTie className="text-gray-400 w-4 h-4 mr-3" /><span className="text-gray-500">Cấp bậc:</span><span className="font-semibold text-gray-800 ml-2">{profile.desired_level || 'Chưa cập nhật'}</span></p>
                                        <p className="flex items-center"><FaDollarSign className="text-gray-400 w-4 h-4 mr-3" /><span className="text-gray-500">Mức lương mong muốn:</span><span className="font-semibold text-gray-800 ml-2">{(profile.min_salary && profile.max_salary) ? `${profile.min_salary.toLocaleString('vi-VN')} - ${profile.max_salary.toLocaleString('vi-VN')} VND` : 'Thương lượng'}</span></p>
                                        <p className="flex items-center"><FaRegCalendarAlt className="text-gray-400 w-4 h-4 mr-3" /><span className="text-gray-500">Ngày cập nhật:</span><span className="font-semibold text-gray-800 ml-2">{new Date(profile.updated_at).toLocaleString('vi-VN')}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded-r-md flex items-center gap-2"><FaExclamationTriangle /><span>Vui lòng thêm tất cả các thông tin cần thiết để hoàn thành hồ sơ của bạn.</span></div>
                            <div className="mt-6 flex items-center gap-4">
                                <button onClick={() => setIsEditMode(true)} className="bg-myjob-purple text-white font-bold px-6 py-2.5 rounded-md hover:opacity-90 flex items-center gap-2 shadow-lg shadow-myjob-purple/30"><FaEdit /> Chỉnh sửa hồ sơ</button>
                                <button className="border-2 border-gray-300 text-gray-500 font-bold px-3 py-2.5 rounded-md hover:bg-gray-100">D</button>
                            </div>
                        </div>

                        {/* === PHẦN BỊ MẤT ĐÃ ĐƯỢC KHÔI PHỤC: HỒ SƠ ĐÍNH KÈM === */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Hồ sơ đính kèm ({profile.uploaded_cvs?.length || 0})</h2>
                            {profile.uploaded_cvs?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {profile.uploaded_cvs.map(cv => <CVCard key={cv.id} cv={cv} onDelete={(id) => handleDelete('uploadedCV', id)} />)}
                                </div>
                            ) : (
                                <p className="text-gray-500 mb-6">Bạn chưa tải lên CV nào.</p>
                            )}
                            <button onClick={() => handleOpenModal('uploadCV', 'Tải lên hồ sơ mới', profile)} className="w-full bg-myjob-purple-light text-myjob-purple font-bold py-2.5 rounded-md hover:bg-myjob-purple/20 transition flex items-center justify-center gap-2">
                                <FaUpload /> UPLOAD CV
                            </button>
                        </div>

                    </div>

                    {/* === CỘT BÊN PHẢI (SIDEBAR) ĐÃ ĐƯỢC KHÔI PHỤC === */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <h3 className="text-lg font-bold mb-4">Ai đã xem hồ sơ của bạn</h3>
                            <img src="/images/undraw.png" alt="illustration" className="mx-auto mb-4 h-32" />
                            <p className="text-sm text-gray-500 mb-4">Chưa có nhà tuyển dụng nào xem hồ sơ của bạn</p>
                            <button className="text-myjob-purple font-semibold text-sm">Xem chi tiết</button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- GIAO DIỆN CHẾ ĐỘ CHỈNH SỬA (EDIT VIEW) ---
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <SectionCard id="personal-info" title="Thông tin cá nhân" onEdit={() => handleOpenModal('personalInfo', 'Chỉnh sửa thông tin cá nhân', { ...profile.user, ...profile })}>
                            <div className="grid grid-cols-2 gap-4 text-sm"><InfoItem label="Họ và tên" value={profile.user?.name} /><InfoItem label="Tỉnh/Thành phố" value={profile.location?.name} /><InfoItem label="Số điện thoại" value={profile.user?.phone_number} /><InfoItem label="Giới tính" value={profile.gender} /><InfoItem label="Địa chỉ" value={profile.address} /><InfoItem label="Ngày sinh" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN') : null} /><InfoItem label="Tình trạng hôn nhân" value={profile.marital_status} /></div>
                        </SectionCard>
                        <SectionCard id="general-info" title="Thông tin chung" onEdit={() => handleOpenModal('generalInfo', 'Chỉnh sửa thông tin chung', profile)}>
                            <div className="grid grid-cols-2 gap-4 text-sm"><InfoItem label="Vị trí mong muốn" value={profile.desired_position} /><InfoItem label="Địa điểm làm việc" value={profile.location?.name} /><InfoItem label="Cấp bậc mong muốn" value={profile.desired_level} /><InfoItem label="Mức lương mong muốn" value={(profile.min_salary && profile.max_salary) ? `${profile.min_salary.toLocaleString('vi-VN')} - ${profile.max_salary.toLocaleString('vi-VN')} VND` : 'Thương lượng'} /><InfoItem label="Trình độ học vấn" value={profile.education_level} /><InfoItem label="Nơi làm việc" value={profile.workplace_type} /><InfoItem label="Kinh nghiệm" value={profile.experience_years} /><InfoItem label="Hình thức làm việc" value={profile.employment_type} /><InfoItem label="Ngành nghề" value={profile.career?.name} /></div>
                        </SectionCard>
                        {/* Các SectionCard còn lại giữ nguyên */}
                        <SectionCard id="work-experience" title="Kinh nghiệm làm việc" onAdd={() => handleOpenModal('workExperience', 'Thêm kinh nghiệm làm việc')}>
                            {profile.work_experiences?.length > 0 ? profile.work_experiences.map(exp => <TimelineItem key={exp.id} item={exp} type="experience" onEdit={(item) => handleOpenModal('workExperience', 'Chỉnh sửa kinh nghiệm', item)} onDelete={(id) => handleDelete('workExperience', id)} />) : <p className="text-gray-500">Chưa có kinh nghiệm làm việc.</p>}
                        </SectionCard>
                        <SectionCard id="education" title="Thông tin học vấn" onAdd={() => handleOpenModal('education', 'Thêm thông tin học vấn')}>
                            {profile.educations?.length > 0 ? profile.educations.map(edu => <TimelineItem key={edu.id} item={edu} type="education" onEdit={(item) => handleOpenModal('education', 'Chỉnh sửa học vấn', item)} onDelete={(id) => handleDelete('education', id)} />) : <p className="text-gray-500">Chưa có thông tin học vấn.</p>}
                        </SectionCard>
                        <SectionCard id="certificates" title="Chứng chỉ" onAdd={() => handleOpenModal('certificate', 'Thêm chứng chỉ')}>
                            {profile.certificates?.length > 0 ? profile.certificates.map(cert => <CertificateItem key={cert.id} item={cert} onEdit={(item) => handleOpenModal('certificate', 'Chỉnh sửa chứng chỉ', item)} onDelete={(id) => handleDelete('certificate', id)} />) : <p className="text-gray-500">Chưa có chứng chỉ.</p>}
                        </SectionCard>
                        <SectionCard id="language-skills" title="Kỹ năng ngôn ngữ" onAdd={() => handleOpenModal('languageSkill', 'Thêm kỹ năng ngôn ngữ')}>
                            {profile.language_skills?.length > 0 ? profile.language_skills.map(skill => <SkillItem key={skill.id} item={skill} onEdit={(item) => handleOpenModal('languageSkill', 'Sửa kỹ năng', item)} onDelete={(id) => handleDelete('languageSkill', id)} />) : <p className="text-gray-500">Chưa có kỹ năng ngôn ngữ.</p>}
                        </SectionCard>
                        <SectionCard id="technical-skills" title="Kỹ năng chuyên môn" onAdd={() => handleOpenModal('technicalSkill', 'Thêm kỹ năng chuyên môn')}>
                            {profile.technical_skills?.length > 0 ? profile.technical_skills.map(skill => <SkillItem key={skill.id} item={skill} onEdit={(item) => handleOpenModal('technicalSkill', 'Sửa kỹ năng', item)} onDelete={(id) => handleDelete('technicalSkill', id)} />) : <p className="text-gray-500">Chưa có kỹ năng chuyên môn.</p>}
                        </SectionCard>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-4 rounded-lg shadow-md">
                            <h3 className="font-bold mb-4">Hồ sơ trực tuyến</h3><ul className="space-y-2 text-sm font-semibold"><li><a href="#personal-info" className="text-myjob-purple">Thông tin cá nhân</a></li><li><a href="#general-info" className="text-gray-700 hover:text-myjob-purple">Thông tin chung</a></li><li><a href="#work-experience" className="text-gray-700 hover:text-myjob-purple">Kinh nghiệm làm việc</a></li><li><a href="#education" className="text-gray-700 hover:text-myjob-purple">Thông tin học vấn</a></li><li><a href="#certificates" className="text-gray-700 hover:text-myjob-purple">Chứng chỉ</a></li><li><a href="#language-skills" className="text-gray-700 hover:text-myjob-purple">Kỹ năng ngôn ngữ</a></li><li><a href="#technical-skills" className="text-gray-700 hover:text-myjob-purple">Kỹ năng chuyên môn</a></li></ul>
                        </div>
                    </div>
                </div>
            )}

            {/* PHẦN MODAL GIỮ NGUYÊN */}
            <Modal isOpen={modalState.isOpen} onClose={handleCloseModal} title={modalState.title}>
                {modalState.type === 'personalInfo' && <ProfileUpdateForm initialData={{...profile.user, ...profile}} onSave={handleSave} isSubmitting={isSubmitting} />}
                {modalState.type === 'generalInfo' && <GeneralInfoForm initialData={profile} onSave={handleSave} isSubmitting={isSubmitting} />}
                {modalState.type === 'workExperience' && <WorkExperienceForm initialData={modalState.data} onSave={handleSave} isSubmitting={isSubmitting} />}
                {modalState.type === 'education' && <EducationForm initialData={modalState.data} onSave={handleSave} isSubmitting={isSubmitting} />}
                {modalState.type === 'certificate' && <CertificateForm initialData={modalState.data} onSave={handleSave} isSubmitting={isSubmitting} />}
                {modalState.type === 'languageSkill' && <SkillForm initialData={modalState.data} onSave={handleSave} isSubmitting={isSubmitting} skillType="language" />}
                {modalState.type === 'technicalSkill' && <SkillForm initialData={modalState.data} onSave={handleSave} isSubmitting={isSubmitting} skillType="technical" />}
                {modalState.type === 'uploadCV' && <UploadCVForm initialData={profile} onSave={handleSave} isSubmitting={isSubmitting} />}
            </Modal>
        </>
    );
}