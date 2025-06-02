import React from 'react';

import { BarChart3 } from 'lucide-react';

const Analytics = ({ survey }) => {
  const generateAnalyticsData = () => {
    if (!survey) return { questionTypeData: [], responseData: [] };

    const questionTypes = {};
    survey.questions?.forEach(q => {
      questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
    });

    const questionTypeData = Object.entries(questionTypes).map(([type, count]) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));

    const responseData = [
      { label: 'Week 1', value: Math.floor(survey.total_responses * 0.2) },
      { label: 'Week 2', value: Math.floor(survey.total_responses * 0.3) },
      { label: 'Week 3', value: Math.floor(survey.total_responses * 0.3) },
      { label: 'Week 4', value: Math.floor(survey.total_responses * 0.2) },
    ];

    return { questionTypeData, responseData };
  };

  const { questionTypeData, responseData } = generateAnalyticsData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Response Overview</h2>
        </div>

        {survey.total_responses > 0 ? (
          <div className="space-y-4">
            {responseData.map((item, index) => {
              const maxValue = Math.max(...responseData.map(d => d.value));
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-600 text-right">{item.label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-center transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs font-medium text-white">{item.value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No responses yet</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Types</h2>

        {questionTypeData.length > 0 ? (
          <div className="space-y-4">
            {questionTypeData.map((item, index) => {
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
              const color = colors[index % colors.length];

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500">
            No questions configured
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
