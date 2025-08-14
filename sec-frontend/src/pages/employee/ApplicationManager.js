import React, { useEffect, useState } from 'react';
import { FaDownload, FaTimes, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // <-- BƯỚC 1: IMPORT useAuth

export default function ApplicationManager() {
    const [applications, setApplications] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth(); // <-- BƯỚC 2: Lấy user và token từ context

    // BƯỚC 3: Cập nhật useEffect để phụ thuộc vào 'user'
    useEffect(() => {
        // Chỉ fetch dữ liệu nếu user đã đăng nhập và có email
        if (user && user.email) {
            setLoading(true);
            fetch(`http://localhost:8000/applications/${user.email}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Gửi token để backend xác thực
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Không thể tải danh sách ứng viên');
                    return res.json();
                })
                .then(data => setApplications(data))
                .catch(err => {
                    console.error("Lỗi khi lấy danh sách ứng viên:", err);
                    setApplications([]); // Reset về mảng rỗng nếu có lỗi
                })
                .finally(() => setLoading(false));
        } else {
            // Nếu không có user, không làm gì cả và kết thúc loading
            setLoading(false);
            setApplications([]);
        }
    }, [user, token]); // Chạy lại mỗi khi user hoặc token thay đổi

    // BƯỚC 4: Cập nhật handleSaveProfile để dùng 'user' và 'token'
    const handleSaveProfile = async (applicationId) => {
        if (!user || !user.id || !token) {
            alert("Không tìm thấy thông tin xác thực. Vui lòng đăng nhập lại.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/save-profile?employer_id=${user.id}&application_id=${applicationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Gửi token để backend xác thực
                }
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Lưu hồ sơ thất bại');
            }
            alert("Đã lưu hồ sơ thành công!");

        } catch (error) {
            console.error("Lỗi khi lưu hồ sơ:", error);
            alert(`Lỗi: ${error.message}`);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('vi-VN', options);
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Đang tải danh sách ứng viên...</div>;
    }

    // Toàn bộ JSX giữ nguyên, không cần thay đổi
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Danh sách ứng viên đã ứng tuyển</h2>
            
            {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Chưa có ứng viên nào ứng tuyển vào các vị trí của bạn.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                            <tr>
                                <th className="py-3 px-4">#</th>
                                <th className="py-3 px-4">Họ tên</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Bài đăng</th>
                                <th className="py-3 px-4">Ngày ứng tuyển</th>
                                <th className="py-3 px-4 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {applications.map((app, index) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{index + 1}</td>
                                    <td className="py-3 px-4 font-medium text-gray-800">{app.full_name}</td>
                                    <td className="py-3 px-4 text-gray-600">{app.email}</td>
                                    <td className="py-3 px-4 text-gray-600">{app.job_title}</td>
                                    <td className="py-3 px-4 text-gray-600">{formatDate(app.applied_at)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => setSelected(app)} className="text-[#441da0] font-semibold hover:underline">Xem</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center pb-4 border-b mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-800">Chi tiết ứng viên</h2>
                            <button className="text-gray-400 hover:text-red-500" onClick={() => setSelected(null)}><FaTimes size={24} /></button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 space-y-4">
                            <DetailRow label="Họ tên" value={selected.full_name} />
                            <DetailRow label="Giới tính" value={selected.gender} />
                            <DetailRow label="Email" value={selected.email} />
                            <DetailRow label="Số điện thoại" value={selected.phone} />
                            <DetailRow label="Năm sinh" value={selected.birth_year} />
                            <DetailRow label="Địa điểm mong muốn" value={selected.preferred_location} />
                            <DetailRow label="Kinh nghiệm lĩnh vực" value={selected.experience_fields} />
                            <DetailRow label="Nơi làm việc" value={selected.experience_places} />
                            <DetailRow label="Chứng chỉ" value={selected.certificates} />
                            <div className="pt-2">
                                <p className="font-semibold text-gray-700">Thư ứng tuyển:</p>
                                <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded mt-1 font-sans text-gray-800">{selected.cover_letter}</pre>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t flex-shrink-0 flex items-center justify-between">
                          <a href={`http://localhost:8000/static/cvs/${selected.cv_filename}`} className="inline-flex items-center gap-2 bg-[#441da0] text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition font-bold" target="_blank" rel="noopener noreferrer">
                              <FaDownload /> Tải CV
                          </a>
                          <button onClick={() => handleSaveProfile(selected.id)} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-bold">
                              <FaFileAlt /> Lưu hồ sơ
                          </button>
                      </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const DetailRow = ({ label, value }) => (
    <div>
        <p className="font-semibold text-gray-700">{label}:</p>
        <p className="text-gray-800">{value}</p>
    </div>
);