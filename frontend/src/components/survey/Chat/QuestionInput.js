import React from 'react';

const QuestionInput = ({ question, value, onChange, onEnterPress }) => {
  const handleKeyPress = e => {
    if (e.key === 'Enter' && onEnterPress && !e.shiftKey) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const handleCheckboxChange = (optionValue, checked) => {
    onChange(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      if (checked) {
        return [...arr, optionValue];
      } else {
        return arr.filter(item => item !== optionValue);
      }
    });
  };

  // Get question type from either 'type' or 'question_type' field
  const questionType = question.type || question.question_type;

  switch (questionType) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer...'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer...'}
          rows={question.rows || 3}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          onKeyPress={handleKeyPress}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Enter a number...'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
        />
      );

    case 'email':
      return (
        <input
          type="email"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Enter your email address...'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
        />
      );

    case 'phone':
      return (
        <input
          type="tel"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Enter your phone number...'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );

    case 'radio':
      return (
        <div className="flex-1 space-y-2">
          <p className="text-sm text-gray-600 mb-3">Select one option:</p>
          {question.options?.map((option, index) => (
            <label
              key={index}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
            >
              <input
                type="radio"
                name={`radio-${question.id || question.order}`}
                value={option.value || option.label}
                checked={value === (option.value || option.label)}
                onChange={e => onChange(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex-1 space-y-2">
          <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
          {question.options?.map((option, index) => (
            <label
              key={index}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
            >
              <input
                type="checkbox"
                value={option.value || option.label}
                checked={Array.isArray(value) && value.includes(option.value || option.label)}
                onChange={e => handleCheckboxChange(option.value || option.label, e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
          <p className="text-xs text-gray-500 mt-2">
            {Array.isArray(value) ? `${value.length} selected` : '0 selected'}
          </p>
        </div>
      );

    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select an option...</option>
          {question.options?.map((option, index) => (
            <option key={index} value={option.value || option.label}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'rating':
      const maxRating = question.options?.max_rating || 5;

      return (
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-3">Rate from 1 to {maxRating}:</p>
          <div className="flex space-x-2 justify-center">
            {[...Array(maxRating)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <button
                  key={index}
                  onClick={() => onChange(ratingValue.toString())}
                  className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                    value === ratingValue.toString()
                      ? 'bg-blue-500 text-white border-blue-500 scale-110'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:scale-105'
                  }`}
                >
                  {ratingValue}
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {value ? `You rated: ${value}` : 'Click a number to rate'}
          </p>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer...'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
        />
      );
  }
};

export default QuestionInput;
