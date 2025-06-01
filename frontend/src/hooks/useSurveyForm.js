import { useState } from 'react';

const useSurveyForm = (navigate) => {
    const [survey, setSurvey] = useState({
        title: '',
        description: '',
        status: 'draft',
        allow_multiple_responses: false,
        start_date: '',
        end_date: '',
        questions: [],
        configs: {}
    });

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

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
            rows: 4
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index, updatedQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (status = 'draft') => {
        setLoading(true);

        try {
            // Validate survey data
            if (!survey.title.trim()) {
                throw new Error('Survey title is required');
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

            // Prepare survey data for submission
            const surveyData = {
                ...survey,
                status,
                questions: questions.map((q, index) => ({
                    ...q,
                    order: index + 1
                }))
            };

            // Simulate API call
            console.log('Survey Data:', surveyData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert(`Survey ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
            navigate('/dashboard/surveys');
        } catch (error) {
            alert('Error saving survey: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        survey,
        setSurvey,
        questions,
        setQuestions,
        loading,
        addQuestion,
        updateQuestion,
        removeQuestion,
        handleSubmit
    };
};

export default useSurveyForm;