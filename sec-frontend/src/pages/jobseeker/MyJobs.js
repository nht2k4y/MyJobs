// src/pages/jobseeker/MyJobs.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner, FaMapMarkerAlt, FaDollarSign, FaCalendarCheck, FaBookmark, FaRegFileAlt } from 'react-icons/fa';

// Component con cho từng thẻ công việc
const JobItemCard = ({ job, type }) => {
    const isApplied = type === 'applied';
    const date = isApplied ? job.application_date : job.saved_date;
    
    // Hàm để định dạng trạng thái cho đẹp hơn
    const formatStatus = (status) => {
        switch (status) {
            case 'Đã xem':
                return <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{status}</span>;
            case 'Bị từ chối':
                return <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">{status}</span>;
            default: // "Đã gửi"
                return <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{status}</span>;
        }
    };

    return (
        <Link 
            to={`/jobs/${job.job_id}`} 
            className="block bg-white p-4 rounded-lg shadow-sm border border-transparent hover:border-myjob-purple hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                <img 
                    src={job.logo_url ? `http://localhost:8000${job.logo_url}` : '/default-logo.png'} 
                    alt={`${job.company_name} logo`}
                    className="w-16 h-16 rounded-md border object-contain flex-shrink-0"
                />
                <div className="flex-grow">
                    <h4 className="font-bold text-lg text-gray-800 hover:text-myjob-purple">{job.title}</h4>
                    <p className="text-md font-medium text-gray-600">{job.company_name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                        {job.location && <div className="flex items-center gap-1.5"><FaMapMarkerAlt /><span>{job.location.name}</span></div>}
                        {job.salary && <div className="flex items-center gap-1.5"><FaDollarSign /><span>{job.salary}</span></div>}
                    </div>
                </div>
                <div className="flex-shrink-0 text-right">
                    {isApplied ? (
                        formatStatus(job.status)
                    ) : (
                        <button className="text-myjob-purple p-2 rounded-full hover:bg-gray-100">
                            <FaBookmark />
                        </button>
                    )}
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                        <FaCalendarCheck />
                        <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
                    </p>
                </div>
            </div>
        </Link>
    );
};

// Component cho trạng thái rỗng
const EmptyState = ({ message, imageSrc }) => (
    <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
        <img src={imageSrc} alt="Empty state" className="h-32 mx-auto mb-4" />
        <p className="text-gray-500">{message}</p>
    </div>
);

export default function MyJobsPage() {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchJobs = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // Gọi cả 2 API cùng lúc để tăng tốc độ
                const [appliedRes, savedRes] = await Promise.all([
                    fetch('http://localhost:8000/api/jobseeker/applied-jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:8000/api/jobseeker/saved-jobs', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                if (!appliedRes.ok || !savedRes.ok) throw new Error('Failed to fetch jobs data');

                const appliedData = await appliedRes.json();
                const savedData = await savedRes.json();

                setAppliedJobs(appliedData);
                setSavedJobs(savedData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu công việc:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [token]);

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Việc làm của tôi</h2>
                <p className="mt-1 text-gray-500">Theo dõi các công việc bạn đã quan tâm và ứng tuyển.</p>
            </div>

            <div className="space-y-10">
                {/* Phần 1: Việc làm đã ứng tuyển */}
                <section>
                    <h3 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center gap-3">
                        <FaRegFileAlt className="text-myjob-purple" />
                        Việc làm đã ứng tuyển
                    </h3>
                    {loading ? (
                        <div className="text-center p-4"><FaSpinner className="animate-spin inline-block text-2xl" /></div>
                    ) : appliedJobs.length > 0 ? (
                        <div className="space-y-4">
                            {appliedJobs.map(job => <JobItemCard key={`applied-${job.job_id}`} job={job} type="applied" />)}
                        </div>
                    ) : (
                        <EmptyState 
                            message="Bạn chưa ứng tuyển công việc nào."
                            imageSrc="/images/empty.svg" // Đảm bảo bạn có ảnh này trong public/images
                        />
                    )}
                </section>

                {/* Phần 2: Việc làm đã lưu */}
                <section>
                    <h3 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center gap-3">
                        <FaBookmark className="text-myjob-purple" />
                        Việc làm đã lưu
                    </h3>
                     {loading ? (
                        <div className="text-center p-4"><FaSpinner className="animate-spin inline-block text-2xl" /></div>
                    ) : savedJobs.length > 0 ? (
                        <div className="space-y-4">
                            {savedJobs.map(job => <JobItemCard key={`saved-${job.job_id}`} job={job} type="saved" />)}
                        </div>
                    ) : (
                        <EmptyState 
                            message="Bạn chưa lưu công việc nào. Hãy bắt đầu tìm kiếm ngay!"
                            imageSrc="/images/undraw.png" // Đảm bảo bạn có ảnh này trong public/images
                        />
                    )}
                </section>
            </div>
        </div>
    );
}