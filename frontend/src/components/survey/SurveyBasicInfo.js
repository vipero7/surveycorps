import React from 'react';

import { SURVEY_CATEGORIES } from '../../utils/constants';

const SurveyBasicInfo = ({ survey, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...survey, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Survey Information</h2>

            <div className="space-y-6">
                {/* Survey Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Survey Title *
                    </label>
                    <input
                        type="text"
                        value={survey.title || ''}
                        onChange={e => handleChange('title', e.target.value)}
                        placeholder="Enter your survey title..."
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Survey Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Survey Type *
                    </label>
                    <select
                        value={survey.category || 'other'}
                        onChange={e => handleChange('category', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {SURVEY_CATEGORIES.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                        Choose the type that best describes your survey
                    </p>
                </div>

                {/* Survey Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={survey.description || ''}
                        onChange={e => handleChange('description', e.target.value)}
                        placeholder="Provide a brief description of your survey (optional)..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                </div>

                {/* Survey Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={survey.start_date || ''}
                            onChange={e => handleChange('start_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={survey.end_date || ''}
                            onChange={e => handleChange('end_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Multiple Responses */}
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="allow_multiple_responses"
                        checked={survey.allow_multiple_responses || false}
                        onChange={e => handleChange('allow_multiple_responses', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                        htmlFor="allow_multiple_responses"
                        className="text-sm font-medium text-gray-700"
                    >
                        Allow multiple responses from the same participant
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SurveyBasicInfo;
