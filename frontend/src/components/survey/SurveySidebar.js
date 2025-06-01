import React from 'react';
import { Save, Eye } from 'lucide-react';

const SurveySidebar = ({
    survey,
    questions,
    loading,
    onSaveDraft,
    onPublish
}) => {
    const canSave = survey.title && survey.title.trim();
    const canPublish = canSave && questions.length > 0;

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

                <div className="space-y-3">
                    <button
                        onClick={onSaveDraft}
                        disabled={loading || !canSave}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>

                    <button
                        onClick={onPublish}
                        disabled={loading || !canPublish}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {loading ? 'Publishing...' : 'Publish Survey'}
                    </button>
                </div>
            </div>

            {/* Survey Stats */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Summary</h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Questions</span>
                        <span className="font-medium">{questions.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Required</span>
                        <span className="font-medium">
                            {questions.filter(q => q.required).length}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Multiple Choice</span>
                        <span className="font-medium">
                            {questions.filter(q => ['radio', 'checkbox', 'dropdown'].includes(q.type)).length}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${survey.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {survey.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveySidebar;