// src/components/JobSuggestionCard.jsx

import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

const JobSuggestionCard = ({ job }) => {
  // Giả sử bạn có một route để xem chi tiết công việc là /jobs/:jobId
  const jobDetailUrl = `/jobs/${job.jobId}`;

  return (
    <a 
      href={jobDetailUrl}
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
    >
      <div className="font-bold text-blue-600 text-base mb-1 flex items-center">
        <FaBriefcase className="mr-2" />
        {job.jobTitle}
      </div>
      <div className="text-sm text-gray-700 flex items-center mb-1">
        <FaBuilding className="mr-2 text-gray-500" />
        {job.companyName}
      </div>
      <div className="text-xs text-gray-500 flex items-center">
        <FaMapMarkerAlt className="mr-2" />
        {job.location}
      </div>
    </a>
  );
};

export default JobSuggestionCard;