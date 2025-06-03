import React from 'react';

const RatingQuestion = ({ question, onUpdate, questionId }) => {
    const scale = question.scale || 5;

    const handleScaleChange = newScale => {
        onUpdate(questionId, { ...question, scale: newScale });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Scale</label>
                <select
                    value={scale}
                    onChange={e => handleScaleChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                    <option value={3}>1 to 3</option>
                    <option value={5}>1 to 5</option>
                    <option value={7}>1 to 7</option>
                    <option value={10}>1 to 10</option>
                </select>
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-gray-600">
                        ⭐ Respondents will see {scale} star rating (1 to {scale})
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RatingQuestion;
