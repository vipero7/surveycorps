import React from 'react';
import { Save, Send } from 'lucide-react';

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
                        {loading ? 'Saving...' : 'Save'}
                    </button>

                    <button
                        onClick={onPublish}
                        disabled={loading || !canPublish}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? 'Publishing...' : 'Save and Distribute'}
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
                    {survey.category && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Category</span>
                            <span className="font-medium text-sm capitalize">{survey.category}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Validation Status */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation</h3>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Title</span>
                        <span className={`text-xs ${canSave ? 'text-green-600' : 'text-red-600'}`}>
                            {canSave ? '✓' : '✗'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Questions</span>
                        <span className={`text-xs ${questions.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {questions.length > 0 ? '✓' : '✗'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ready to distribute</span>
                        <span className={`text-xs ${canPublish ? 'text-green-600' : 'text-red-600'}`}>
                            {canPublish ? '✓' : '✗'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveySidebar;