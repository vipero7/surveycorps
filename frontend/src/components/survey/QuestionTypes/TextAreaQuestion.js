import React from 'react';

const TextAreaQuestion = ({ question, onUpdate, questionId }) => {
    return (
        <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                    📄 Respondents will see a large text area for detailed responses
                </p>
            </div>
        </div>
    );
};

export default TextAreaQuestion;
