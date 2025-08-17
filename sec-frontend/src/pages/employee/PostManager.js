import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component con không thay đổi
const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full border p-2 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
    </div>
);
const Textarea = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea {...props} className="w-full border p-2 rounded-md border-gray-300 focus:ring-teal-500 focus:border-teal-500"/>
    </div>
);

export default function PostManager() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const initialFormState = {
    title: '', position: '', description: '', company_intro: '',
    requirements: '', benefits: '', how_to_apply: '', deadline: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetchInitialData không thay đổi
  const fetchInitialData = useCallback(async () => {
    if (!user || !user.id) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
        const [companyRes, postsRes] = await Promise.all([
            fetch(`http://localhost:8000/company/${user.id}`),
            fetch(`http://localhost:8000/my-job-posts/${user.email}`)
        ]);

        if (companyRes.ok) {
            const data = await companyRes.json();
            setCompanyInfo(data);
            setForm(prev => ({
                ...prev,
                company_intro: data.description || '',
            }));
        } else {
            setCompanyInfo(null);
        }
        
        if (postsRes.ok) {
            const data = await postsRes.json();
            setPosts(Array.isArray(data) ? data : []);
        } else {
            setPosts([]);
        }

    } catch (err) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", err);
    } finally {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
        alert("Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
        navigate('/login');
        return;
    }

    // === BẮT ĐẦU SỬA LỖI 1: Thêm kiểm tra cho location_id ===
    if (!companyInfo || !companyInfo.career_id || !companyInfo.location_id) {
        alert("Thông tin công ty (ngành nghề, khu vực) chưa được thiết lập đầy đủ. Vui lòng cập nhật trước.");
        navigate('/employer?page=company-info');
        return;
    }
    if (!companyInfo.logo_filename) {
        alert("Logo công ty chưa được thiết lập. Vui lòng cập nhật thông tin công ty trước.");
        navigate('/employer?page=company-info');
        return;
    }

    // === BẮT ĐẦU SỬA LỖI 2: Thêm location_id vào body gửi đi ===
    const body = { 
      ...form, 
      employer_email: user.email, 
      employer_id: user.id, 
      career_id: companyInfo.career_id,
      location_id: companyInfo.location_id, // THÊM DÒNG NÀY
      deadline: form.deadline || null
    };

    try {
        const res = await fetch(`http://localhost:8000/job-posts${editingId ? '/' + editingId : ''}`, {
            method: editingId ? 'PUT' : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ detail: 'Không thể đọc chi tiết lỗi từ server.' }));
            if (Array.isArray(errorData.detail)) {
                const errorMessages = errorData.detail.map(err => `- Trường '${err.loc[1]}' ${err.msg}`).join('\n');
                throw new Error(`Dữ liệu không hợp lệ:\n${errorMessages}`);
            }
            throw new Error(errorData.detail || 'Lỗi không xác định từ server.');
        }

        alert(editingId ? 'Cập nhật thành công, đang chờ duyệt.' : 'Đăng bài thành công, bài đăng đang chờ duyệt.');
        setForm({ ...initialFormState, company_intro: companyInfo?.description || '' });
        setEditingId(null);
        fetchInitialData();

    } catch (err) {
        console.error('Submit error:', err);
        alert("Đã xảy ra lỗi khi gửi:\n\n" + err.message);
    }
  };

  // Các hàm còn lại không thay đổi
  const handleEdit = (post) => {
    setForm({
      title: post.title, position: post.position, description: post.description || '',
      company_intro: post.company_intro || '', requirements: post.requirements || '',
      benefits: post.benefits || '', how_to_apply: post.how_to_apply || '',
      deadline: post.deadline ? post.deadline.split('T')[0] : '',
    });
    setEditingId(post.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá?")) {
        try {
            const res = await fetch(`http://localhost:8000/job-posts/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchInitialData(); else alert("Xoá thất bại.");
        } catch (err) { console.error('Xoá error:', err); }
    }
  };

  const cancelEdit = () => {
    setForm({ ...initialFormState, company_intro: companyInfo?.description || ''});
    setEditingId(null);
  };

  if (loading) {
      return <div className="p-6 text-center">Đang tải dữ liệu...</div>
  }

  // JSX không thay đổi
  return (
    <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý bài đăng</h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">{editingId ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Tiêu đề tin tuyển dụng *" name="title" value={form.title} onChange={handleChange} required />
                    <Input label="Vị trí/Chức vụ *" name="position" value={form.position} onChange={handleChange} required />
                </div>
                <Input 
                    label="Ngành nghề"
                    name="career_name"
                    value={companyInfo?.career?.name || (companyInfo ? 'Chưa thiết lập' : 'Vui lòng cập nhật thông tin công ty')}
                    disabled={true}
                    title="Ngành nghề được lấy tự động từ thông tin công ty của bạn."
                />
                <Textarea label="Giới thiệu công ty" name="company_intro" value={form.company_intro} onChange={handleChange} rows={4} placeholder="Mặc định lấy từ thông tin công ty, bạn có thể chỉnh sửa cho phù hợp với tin đăng này." />
                <Textarea label="Mô tả công việc" name="description" value={form.description} onChange={handleChange} />
                <Textarea label="Yêu cầu ứng viên" name="requirements" value={form.requirements} onChange={handleChange} />
                <Textarea label="Quyền lợi & Đãi ngộ" name="benefits" value={form.benefits} onChange={handleChange} />
                <Textarea label="Cách thức ứng tuyển" name="how_to_apply" value={form.how_to_apply} onChange={handleChange} />
                <Input label="Hạn nộp hồ sơ" type="date" name="deadline" value={form.deadline || ""} onChange={handleChange} />
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-myjob-purple text-white font-bold px-6 py-2 rounded-md hover:opacity-90 transition">
                        {editingId ? 'Lưu cập nhật' : 'Đăng tin'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white font-bold px-6 py-2 rounded-md hover:bg-gray-600 transition">
                            Hủy
                        </button>
                    )}
                </div>
            </form>
        </div>
        <div>
            <h3 className="text-xl font-semibold mb-3">Danh sách bài đăng</h3>
            {posts.length === 0 && <p>Chưa có bài nào.</p>}
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all">
                        <img src={post.logo_url || "/default-logo.png"} alt="logo" className="w-14 h-14 object-cover rounded-xl border border-gray-200 mr-4"/>
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-800">{post.title}</h4>
                            <p className="text-sm text-gray-500">{post.position}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${post.status === "approved" ? "bg-green-100 text-green-800" : post.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                                {post.status}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                            <button onClick={() => handleEdit(post)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm">Sửa</button>
                            <button onClick={() => handleDelete(post.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm">Xoá</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}