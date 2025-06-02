// QuestionTypes/RadioQuestion.js
import React from 'react';

import { Plus, Trash2 } from 'lucide-react';

const RadioQuestion = ({ question, onUpdate, questionId }) => {
  const handleAddOption = () => {
    const newOptions = [...(question.options || []), ''];
    onUpdate(questionId, { ...question, options: newOptions });
  };

  const handleUpdateOption = (optionIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate(questionId, { ...question, options: newOptions });
  };

  const handleRemoveOption = optionIndex => {
    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    onUpdate(questionId, { ...question, options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Answer Choices</label>
        <button
          onClick={handleAddOption}
          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Choice
        </button>
      </div>

      <div className="space-y-2">
        {(question.options || []).map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 flex justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
            </div>
            <input
              type="text"
              value={option}
              onChange={e => handleUpdateOption(optionIndex, e.target.value)}
              placeholder={`Choice ${optionIndex + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleRemoveOption(optionIndex)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove choice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {(question.options || []).length === 0 && (
        <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
          Click "Add Choice" to create answer options
        </div>
      )}
    </div>
  );
};

export default RadioQuestion;
