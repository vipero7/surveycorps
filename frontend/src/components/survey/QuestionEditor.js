// QuestionEditor.js
import React from 'react';

import { GripVertical, X } from 'lucide-react';

import { QUESTION_TYPES } from '../../utils/constants';
import CheckboxQuestion from './QuestionTypes/CheckboxQuestion';
import DateQuestion from './QuestionTypes/DateQuestion';
import DropdownQuestion from './QuestionTypes/DropdownQuestion';
import EmailQuestion from './QuestionTypes/EmailQuestion';
import NumberQuestion from './QuestionTypes/NumberQuestion';
import PhoneQuestion from './QuestionTypes/PhoneQuestion';
import RadioQuestion from './QuestionTypes/RadioQuestion';
import RatingQuestion from './QuestionTypes/RatingQuestion';
import TextAreaQuestion from './QuestionTypes/TextAreaQuestion';
// Import question type components
import TextQuestion from './QuestionTypes/TextQuestion';

const QuestionEditor = ({ question, index, onUpdate, onRemove }) => {
  const handleQuestionChange = (field, value) => {
    onUpdate(index, { ...question, [field]: value });
  };

  const renderQuestionType = () => {
    const questionId = index; // Use index as questionId for consistency
    const props = {
      question,
      onUpdate: (id, updatedQuestion) => onUpdate(index, updatedQuestion),
      questionId,
    };

    switch (question.type) {
      case 'text':
        return <TextQuestion {...props} />;
      case 'textarea':
        return <TextAreaQuestion {...props} />;
      case 'number':
        return <NumberQuestion {...props} />;
      case 'email':
        return <EmailQuestion {...props} />;
      case 'phone':
        return <PhoneQuestion {...props} />;
      case 'date':
        return <DateQuestion {...props} />;
      case 'radio':
        return <RadioQuestion {...props} />;
      case 'checkbox':
        return <CheckboxQuestion {...props} />;
      case 'dropdown':
        return <DropdownQuestion {...props} />;
      case 'rating':
        return <RatingQuestion {...props} />;
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500 text-center">Select a question type to configure</p>
          </div>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Question Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">Question {index + 1}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete question"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Question Title and Type */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Title</label>
            <input
              type="text"
              value={question.question || ''}
              onChange={e => handleQuestionChange('question', e.target.value)}
              placeholder="Type your question here..."
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Answer Type</label>
            <select
              value={question.type}
              onChange={e => handleQuestionChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Type Component */}
        {renderQuestionType()}

        {/* Required Option */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${question.id || index}`}
              checked={question.required || false}
              onChange={e => handleQuestionChange('required', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor={`required-${question.id || index}`}
              className="text-sm font-medium text-gray-700"
            >
              Required question
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
