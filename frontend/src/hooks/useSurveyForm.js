import { useState } from 'react';

import { useNotification } from '../context/NotificationContext';
import { surveysAPI } from '../services/api/survey';
import { extractApiData, extractApiError } from '../utils/apiHelpers';

const useSurveyForm = navigate => {
  const { showSuccess, showError } = useNotification();

  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    category: 'other',
    status: 'published',
    allow_multiple_responses: false,
    start_date: '',
    end_date: '',
    questions: [],
    configs: {},
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'text',
      question: '',
      description: '',
      required: false,
      options: [],
      placeholder: '',
      validation: {},
      rows: 4,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const removeQuestion = index => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const validateSurveyData = () => {
    if (!survey.title.trim()) {
      throw new Error('Survey title is required');
    }

    if (!survey.category) {
      throw new Error('Survey type is required');
    }

    if (questions.length === 0) {
      throw new Error('At least one question is required');
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question.trim()) {
        throw new Error(`Question ${i + 1} title is required`);
      }

      // Validate choice questions have options
      if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
        if (!question.options || question.options.length === 0) {
          throw new Error(`Question ${i + 1} must have at least one option`);
        }

        // Check for empty options
        const hasEmptyOptions = question.options.some(option => !option.trim());
        if (hasEmptyOptions) {
          throw new Error(`Question ${i + 1} has empty options`);
        }
      }
    }
  };

  const handleSubmit = async (action = 'save') => {
    setLoading(true);
    setError(null);

    try {
      // Validate survey data
      validateSurveyData();

      // Prepare survey data for submission
      const surveyData = {
        title: survey.title.trim(),
        description: survey.description.trim(),
        category: survey.category,
        status: 'published',
        allow_multiple_responses: survey.allow_multiple_responses,
        start_date: survey.start_date || null,
        end_date: survey.end_date || null,
        configs: survey.configs || {},
        questions: questions.map((q, index) => ({
          type: q.type,
          question: q.question.trim(),
          description: q.description?.trim() || '',
          required: q.required || false,
          options: q.options || [],
          placeholder: q.placeholder || '',
          validation: q.validation || {},
          rows: q.rows || 4,
          order: index + 1,
        })),
      };

      console.log('Submitting survey data:', surveyData);

      // Create the survey
      const response = await surveysAPI.create(surveyData);
      const createdSurvey = extractApiData(response);

      console.log('Survey created:', createdSurvey);

      // Handle different actions
      if (action === 'save') {
        // Save and redirect to list
        showSuccess('Survey saved successfully!');
        navigate('/dashboard/surveys');
      } else if (action === 'distribute') {
        // Save and redirect to distribution page
        showSuccess('Survey saved successfully! You can now distribute it.');
        navigate(`/dashboard/surveys/${createdSurvey.oid}/distribute`);
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      const errorMessage = extractApiError(error);

      setError(errorMessage);
      showError('Error saving survey: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Convenience methods for the sidebar
  const saveDraft = () => handleSubmit('save');
  const saveAndDistribute = () => handleSubmit('distribute');

  return {
    survey,
    setSurvey,
    questions,
    setQuestions,
    loading,
    error,
    addQuestion,
    updateQuestion,
    removeQuestion,
    handleSubmit,
    saveDraft,
    saveAndDistribute,
  };
};

export default useSurveyForm;
