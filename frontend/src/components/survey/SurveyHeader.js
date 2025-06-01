import React from 'react';
import { ArrowLeft } from 'lucide-react';

const SurveyHeader = ({ onBack }) => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Surveys
                </button>
            </div>
        </div>
    );
};

export default SurveyHeader;