import React from 'react';

import { Plus } from 'lucide-react';

import CSVUploadSection from './CSVUploadSection';
import QuestionEditor from './QuestionEditor';

const QuestionSection = ({
  activeTab,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onCSVParsed,
}) => {
  // If CSV tab is active, show the upload interface
  if (activeTab === 'csv') {
    return <CSVUploadSection onCSVParsed={onCSVParsed} />;
  }

  // Manual tab - show the question editor interface
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
        <button
          onClick={onAddQuestion}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </button>
      </div>

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">No questions added yet</p>
              <p className="text-gray-500">
                Click "Add Question" to get started building your survey.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id || index}
                question={question}
                index={index}
                onUpdate={onUpdateQuestion}
                onRemove={onRemoveQuestion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSection;
