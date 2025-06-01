import React from 'react';

const SurveyBasicInfo = ({ survey, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...survey, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Survey Details</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Survey Title *
                    </label>
                    <input
                        type="text"
                        value={survey.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter survey title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={survey.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe your survey..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={survey.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={survey.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={survey.allow_multiple_responses}
                            onChange={(e) => handleChange('allow_multiple_responses', e.target.checked)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Allow multiple responses from same person</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SurveyBasicInfo;