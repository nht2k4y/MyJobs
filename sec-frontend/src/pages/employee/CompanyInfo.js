import React, { useState, useEffect, useCallback } from 'react';
import CareerDropdown from '../../components/CareerDropdown';
import { useAuth } from '../../context/AuthContext';
import LocationDropdown from '../../components/LocationDropdown'; 

const initialFormState = {
    company_name: '',
    tax_code: '',
    size: '',
    founded_date: '',
    website: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    email: '',
    city: '',
    district: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
    career_id: '',
    location_id: '',
};

export default function CompanyInfo() {
  const { user } = useAuth(); // <-- NGUỒN SỰ THẬT DUY NHẤT VỀ USER

  // Các state cho form và file
  const [form, setForm] = useState(initialFormState);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyInfo = useCallback(async () => {
    if (!user || !user.id) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/company/${user.id}`);
      if (res.status === 404) {
        // Nếu không tìm thấy, chỉ cần set email và giữ form trống
        console.warn('Thông tin công ty chưa tồn tại. Hiển thị form trống.');
        setForm(prev => ({ ...initialFormState, email: user.email }));
        return;
      }
      if (!res.ok) throw new Error('Không thể tải thông tin công ty');
      
      const data = await res.json();
      
      setForm({
        ...initialFormState, // Bắt đầu với form sạch
        ...data,           // Ghi đè bằng dữ liệu từ API
        email: user.email, // Luôn đảm bảo email đúng từ user context
      });

      setLogoPreview(data.logo_filename ? `http://localhost:8000/static/company/${data.logo_filename}?t=${Date.now()}` : null);
      setCoverPreview(data.cover_filename ? `http://localhost:8000/static/company/${data.cover_filename}?t=${Date.now()}` : null);

    } catch (err) {
      console.error('Lỗi khi fetchCompanyInfo:', err);
    } finally {
        setLoading(false);
    }
  }, [user]); // Phụ thuộc vào `user`

  useEffect(() => {
    fetchCompanyInfo();
  }, [fetchCompanyInfo]); // Chạy khi component mount và khi fetchCompanyInfo thay đổi

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'logo') {
        setLogoPreview(previewUrl);
        setLogoFile(file);
      } else if (type === 'cover') {
        setCoverPreview(previewUrl);
        setCoverFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của form
    
    if (!user || !user.id) {
      alert("Lỗi: Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const formData = new FormData();
    
    // Thêm employer_id từ context
    formData.append('employer_id', user.id);

    // Thêm tất cả các trường khác từ state `form`
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (logoFile) formData.append('logo_file', logoFile);
    if (coverFile) formData.append('cover_file', coverFile);

    try {
      const res = await fetch('http://localhost:8000/company/full-submit/', { // Endpoint này có vẻ là để tạo/cập nhật
        method: 'POST',
        body: formData,
        headers: { // Gửi kèm token để xác thực ở backend
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Lưu thông tin thất bại');
      }

      alert('🎉 Đã cập nhật thông tin thành công!');
      // Tải lại thông tin mới nhất
      fetchCompanyInfo();
      // Reset file input để tránh gửi lại file cũ
      setLogoFile(null);
      setCoverFile(null);

    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải thông tin công ty...</div>
  }

  // Giao diện JSX của bạn giữ nguyên, chỉ thay đổi onClick thành onSubmit
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Thông tin công ty</h2>
        {/* ... toàn bộ JSX của form của bạn không thay đổi ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Logo công ty</label>
              {logoPreview && <img src={logoPreview} alt="logo" className="h-20 w-20 object-contain border p-1 rounded-md mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="text-sm" />
            </div>
            <div>
              <label className="block font-medium mb-1">Ảnh bìa</label>
              {coverPreview && <img src={coverPreview} alt="cover" className="h-32 w-full object-cover rounded-md mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="text-sm" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <Input label="Tên công ty" name="company_name" value={form.company_name} onChange={handleChange} required />
            <Input label="Quy mô công ty" name="size" value={form.size} onChange={handleChange} />
            <div>
                <label className="block font-medium mb-1">Ngành nghề hoạt động chính</label>
                <CareerDropdown value={form.career_id} onChange={handleChange} name="career_id" required={false}/>
            </div>
            <Input label="Mã số thuế" name="tax_code" value={form.tax_code} onChange={handleChange} />
            <Input label="Ngày thành lập" name="founded_date" type="date" value={form.founded_date || ''} onChange={handleChange} />
            <Input label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
            <Input label="Facebook" name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
            <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
            <Input label="Youtube" name="youtube" value={form.youtube} onChange={handleChange} placeholder="https://youtube.com/..." />
            <Input label="Email liên hệ" name="email" value={form.email} onChange={handleChange} disabled />
            <div>
                <label className="block font-medium mb-1">Tỉnh/Thành phố</label>
                <LocationDropdown 
                    value={form.location_id} 
                    onChange={handleChange} 
                    name="location_id" 
                    required={false}
                />
            </div>
            <Input label="Quận/Huyện" name="district" value={form.district} onChange={handleChange} />
            <div className="md:col-span-2"><Input label="Địa chỉ" name="address" value={form.address} onChange={handleChange} /></div>
            <Input label="Vĩ độ (Latitude)" name="latitude" value={form.latitude} onChange={handleChange} />
            <Input label="Kinh độ (Longitude)" name="longitude" value={form.longitude} onChange={handleChange} />
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Giới thiệu công ty</label>
              <textarea name="description" rows={5} className="border p-2 w-full rounded-md" value={form.description || ''} onChange={handleChange} />
            </div>
        </div>
        <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-2.5 bg-myjob-purple text-white font-bold rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-myjob-purple focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
            >
              Lưu thay đổi
            </button>
        </div>
    </form>
  );
}

function Input({ label, name, type = 'text', value, onChange, disabled = false, required = false, placeholder='' }) {
    // ... code component Input giữ nguyên
    return (
        <div>
          <label className="block font-medium mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
          <input name={name} type={type} disabled={disabled} className="border p-2 w-full rounded-md disabled:bg-gray-100" value={value || ''} onChange={onChange} required={required} placeholder={placeholder} />
        </div>
    );
}