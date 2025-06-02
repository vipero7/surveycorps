import React from 'react';

const EmailQuestion = ({ question, onUpdate, questionId }) => {
    return (
        <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                    📧 Respondents will see an email input field
                </p>
            </div>
        </div>
    );
};

export default EmailQuestion;
