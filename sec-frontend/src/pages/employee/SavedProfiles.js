import React, { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // <-- BƯỚC 1: IMPORT useAuth

export default function SavedProfiles() {
    const [savedProfiles, setSavedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const { user, token } = useAuth(); // <-- BƯỚC 2: Lấy user và token từ context

    // BƯỚC 3: Cập nhật useEffect để phụ thuộc vào 'user' và gửi token
    useEffect(() => {
        // Chỉ fetch dữ liệu nếu có user và token
        if (user && user.id && token) {
            setLoading(true);
            fetch(`http://localhost:8000/saved-profiles/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Gửi token để backend xác thực
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Không thể tải hồ sơ đã lưu');
                    return res.json();
                })
                .then(data => {
                    setSavedProfiles(Array.isArray(data) ? data : []);
                })
                .catch(err => {
                    console.error("Lỗi khi lấy hồ sơ đã lưu:", err);
                    setSavedProfiles([]); // Reset về mảng rỗng nếu có lỗi
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // Nếu không có user, không tải gì cả
            setLoading(false);
            setSavedProfiles([]);
        }
    }, [user, token]); // Chạy lại khi user hoặc token thay đổi

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('vi-VN', options);
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu hồ sơ đã lưu...</div>;
    }

    // Toàn bộ JSX giữ nguyên, không cần thay đổi
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Danh sách hồ sơ đã lưu</h2>
            
            {savedProfiles.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Bạn chưa lưu hồ sơ nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                            <tr>
                                <th className="py-3 px-4">#</th>
                                <th className="py-3 px-4">Họ tên</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Ứng tuyển cho vị trí</th>
                                <th className="py-3 px-4">Ngày ứng tuyển</th>
                                <th className="py-3 px-4 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {savedProfiles.map((app, index) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{index + 1}</td>
                                    <td className="py-3 px-4 font-medium text-gray-800">{app.full_name}</td>
                                    <td className="py-3 px-4 text-gray-600">{app.email}</td>
                                    <td className="py-3 px-4 text-gray-600">{app.job_title}</td>
                                    <td className="py-3 px-4 text-gray-600">{formatDate(app.applied_at)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button 
                                            onClick={() => setSelectedProfile(app)}
                                            className="text-[#441da0] font-semibold hover:underline"
                                        >
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center pb-4 border-b mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-800">Chi tiết ứng viên</h2>
                            <button className="text-gray-400 hover:text-red-500" onClick={() => setSelectedProfile(null)}>
                                <FaTimes size={24} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 space-y-4">
                            <DetailRow label="Họ tên" value={selectedProfile.full_name} />
                            <DetailRow label="Giới tính" value={selectedProfile.gender} />
                            <DetailRow label="Email" value={selectedProfile.email} />
                            <DetailRow label="Số điện thoại" value={selectedProfile.phone} />
                            <DetailRow label="Năm sinh" value={selectedProfile.birth_year} />
                            <DetailRow label="Địa điểm mong muốn" value={selectedProfile.preferred_location} />
                            <DetailRow label="Kinh nghiệm lĩnh vực" value={selectedProfile.experience_fields} />
                            <DetailRow label="Nơi làm việc" value={selectedProfile.experience_places} />
                            <DetailRow label="Chứng chỉ" value={selectedProfile.certificates} />
                            
                            <div className="pt-2">
                                <p className="font-semibold text-gray-700">Thư ứng tuyển:</p>
                                <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded mt-1 font-sans text-gray-800">{selectedProfile.cover_letter}</pre>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t flex-shrink-0 flex items-center justify-start">
                          <a
                              href={`http://localhost:8000/static/cvs/${selectedProfile.cv_filename}`}
                              className="inline-flex items-center gap-2 bg-[#441da0] text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition font-bold"
                              target="_blank"
                              rel="noopener noreferrer"
                          >
                              <FaDownload />
                              Tải CV
                          </a>
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
        <p className="text-gray-800">{value || 'Chưa cập nhật'}</p>
    </div>
);