import React from 'react';

const Configuration = ({ survey, formatDate }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Multiple Responses</label>
          <p className="text-sm text-gray-900">
            {survey.allow_multiple_responses ? 'Allowed' : 'Not allowed'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <p className="text-sm text-gray-900">{formatDate(survey.start_date)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <p className="text-sm text-gray-900">{formatDate(survey.end_date)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <p className="text-sm text-gray-900">{survey.created_by_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <p className="text-sm text-gray-900">{survey.team_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <p className="text-sm text-gray-900">{survey.category_display || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
