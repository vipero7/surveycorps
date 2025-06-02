import React from 'react';

const Questions = ({ survey }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Questions ({survey.questions?.length || 0})
      </h2>

      {survey.questions && survey.questions.length > 0 ? (
        <div className="space-y-4">
          {survey.questions.map((question, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {index + 1}. {question.question}
                </h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {question.type}
                </span>
              </div>

              {question.description && (
                <p className="text-sm text-gray-600 mb-2">{question.description}</p>
              )}

              {question.options && question.options.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Options:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {question.options.map((option, optIndex) => (
                      <li key={optIndex} className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.required && (
                <span className="inline-flex items-center text-xs text-red-600 mt-2">
                  * Required
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No questions configured</div>
      )}
    </div>
  );
};

export default Questions;
