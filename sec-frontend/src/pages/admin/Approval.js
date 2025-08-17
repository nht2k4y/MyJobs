import React, { useEffect, useState, useCallback } from 'react';
import { 
    FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaBuilding, 
    FaEnvelope, FaInfoCircle, FaBullseye, FaGifts, FaPaperPlane, 
    FaClock, FaInbox, FaBriefcase 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // <-- BƯỚC 1: IMPORT useAuth

// Component con DetailRow giữ nguyên, không thay đổi
const DetailRow = ({ icon, label, children }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-6 pt-1 text-center text-gray-500">{icon}</div>
        <div className="ml-3">
            <p className="font-semibold text-gray-800">{label}</p>
            <pre className="mt-1 text-gray-600 whitespace-pre-wrap font-sans">{children || 'N/A'}</pre>
        </div>
    </div>
);

export default function Approval() {
    const [pendingPosts, setPendingPosts] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth(); // <-- BƯỚC 2: Lấy token từ context

    // BƯỚC 3: Cập nhật hàm fetch để gửi token và bọc trong useCallback
    const fetchPendingPosts = useCallback(() => {
        if (!token) {
            setLoading(false);
            return; // Không fetch nếu không có token
        }
        setLoading(true);
        fetch("http://localhost:8000/admin/pending-jobs", {
            headers: {
                'Authorization': `Bearer ${token}` // Gửi token để xác thực
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setPendingPosts(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                console.error("Lỗi khi tải bài đăng chờ duyệt:", error);
                setPendingPosts([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]); // Phụ thuộc vào token

    // Cập nhật useEffect để gọi hàm đã được bọc trong useCallback
    useEffect(() => {
        fetchPendingPosts();
    }, [fetchPendingPosts]);

    // BƯỚC 4: Cập nhật hàm xử lý status để gửi token
    const handleStatusUpdate = (id, status) => {
        if (!token) {
            alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            return;
        }
        fetch(`http://localhost:8000/admin/job-status/${id}?status=${status}`, { 
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}` // Gửi token để xác thực
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Cập nhật thất bại');
                return res.json();
            })
            .then((data) => {
                setPendingPosts(prev => prev.filter(p => p.id !== id));
                alert(data.message || `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} bài đăng!`);
            })
            .catch(err => {
                console.error(`Lỗi khi ${status} bài đăng:`, err);
                alert("Đã có lỗi xảy ra, vui lòng thử lại.");
            });
    };

    // Các hàm approvePost, rejectPost, toggleExpand giữ nguyên, không cần thay đổi
    const approvePost = (id) => {
        handleStatusUpdate(id, 'approved');
    };

    const rejectPost = (id) => {
        if (window.confirm("Bạn có chắc muốn từ chối bài đăng này?")) {
            handleStatusUpdate(id, 'rejected');
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Toàn bộ JSX giữ nguyên, không cần thay đổi
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Duyệt bài đăng tuyển dụng</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {pendingPosts.length} bài đang chờ
                </span>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-10">Đang tải danh sách...</p>
            ) : pendingPosts.length === 0 ? (
                <div className="text-center py-16">
                    <FaInbox className="mx-auto text-5xl text-gray-300" />
                    <p className="mt-4 text-lg font-semibold text-gray-600">Tuyệt vời!</p>
                    <p className="text-gray-500">Không có bài đăng nào đang chờ duyệt.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingPosts.map(post => (
                        <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div className="flex justify-between items-center p-4">
                                <div>
                                    <h3 className="text-lg font-bold text-teal-600">{post.title}</h3>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                        <p className="flex items-center gap-2"><FaBuilding /> <span>{post.position}</span></p>
                                        <p className="flex items-center gap-2"><FaBriefcase /> <span>{post.career_name}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <button onClick={() => toggleExpand(post.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                                        {expandedId === post.id ? <FaChevronUp /> : <FaChevronDown />}
                                        <span>{expandedId === post.id ? "Thu gọn" : "Chi tiết"}</span>
                                    </button>
                                    <button onClick={() => approvePost(post.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition">
                                        <FaCheck /> <span>Duyệt</span>
                                    </button>
                                    <button onClick={() => rejectPost(post.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition">
                                        <FaTimes /> <span>Từ chối</span>
                                    </button>
                                </div>
                            </div>
                            
                            {expandedId === post.id && (
                                <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-4">
                                    <DetailRow icon={<FaBriefcase />} label="Ngành nghề:">{post.career_name}</DetailRow>
                                    <DetailRow icon={<FaEnvelope />} label="Email nhà tuyển dụng:">{post.employer_email}</DetailRow>
                                    <DetailRow icon={<FaInfoCircle />} label="Giới thiệu công ty:">{post.company_intro}</DetailRow>
                                    <DetailRow icon={<FaBullseye />} label="Mô tả công việc:">{post.description}</DetailRow>
                                    <DetailRow icon={<FaCheck />} label="Yêu cầu:">{post.requirements}</DetailRow>
                                    <DetailRow icon={<FaGifts />} label="Đãi ngộ:">{post.benefits}</DetailRow>
                                    <DetailRow icon={<FaPaperPlane />} label="Cách ứng tuyển:">{post.how_to_apply}</DetailRow>
                                    <DetailRow icon={<FaClock />} label="Hạn nộp hồ sơ:">{post.deadline ? new Date(post.deadline).toLocaleDateString('vi-VN') : 'Không có'}</DetailRow>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}