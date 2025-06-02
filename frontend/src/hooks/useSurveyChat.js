import { useState } from 'react';

import { surveysAPI } from '../services/api/survey';

export const useSurveyChat = () => {
    const [messages, setMessages] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-3);
    const [responses, setResponses] = useState({});
    const [userInfo, setUserInfo] = useState({
        full_name: '',
        email: '',
        phone: '',
    });
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [surveyId, setSurveyId] = useState(null);
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [initialized, setInitialized] = useState(false);

    const userInfoQuestions = [
        {
            id: 'full_name',
            question_text: 'What is your full name?',
            question_type: 'text',
            required: true,
        },
        {
            id: 'email',
            question_text: 'What is your email address?',
            question_type: 'email',
            required: true,
        },
        {
            id: 'phone',
            question_text: 'What is your phone number?',
            question_type: 'phone',
            required: true,
        },
    ];

    const checkExistingSubmission = async email => {
        try {
            const response = await surveysAPI.checkSubmission(surveyId, email);
            const data = response.data.data;

            if (data.has_submitted) {
                setMessages(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        content: `It looks like you've already submitted a response to this survey on ${new Date(data.submitted_at).toLocaleDateString()}. Redirecting you to view your submission...`,
                        timestamp: new Date(),
                        isInfo: true,
                    },
                ]);

                setTimeout(() => {
                    window.location.href = data.view_submission_url;
                }, 3000);

                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking submission:', error);
            return true;
        }
    };

    const initializeSurvey = (surveyData, oid) => {
        if (initialized || surveyId === oid) return;

        setSurveyId(oid);
        setSurveyQuestions(surveyData.questions || []);
        setInitialized(true);

        const welcomeMessages = [
            {
                type: 'bot',
                content: `Welcome to "${surveyData.title}"!`,
                timestamp: new Date(),
            },
            {
                type: 'bot',
                content:
                    surveyData.description ||
                    'Before we start with the survey questions, I need to collect some basic information.',
                timestamp: new Date(),
            },
        ];

        setMessages(welcomeMessages);

        setTimeout(() => {
            if (currentQuestionIndex === -3) {
                askUserInfoQuestion(0);
            }
        }, 1500);
    };

    const askUserInfoQuestion = index => {
        if (index < userInfoQuestions.length) {
            const question = userInfoQuestions[index];

            const questionAlreadyAsked = messages.some(
                msg => msg.type === 'bot' && msg.content === question.question_text
            );

            if (questionAlreadyAsked) return;

            setMessages(prev => {
                const alreadyExists = prev.some(
                    msg => msg.type === 'bot' && msg.content === question.question_text
                );

                if (alreadyExists) return prev;

                return [
                    ...prev,
                    {
                        type: 'bot',
                        content: question.question_text,
                        question: question,
                        timestamp: new Date(),
                    },
                ];
            });
        }
    };

    const askSurveyQuestion = index => {
        if (index < surveyQuestions.length) {
            const question = surveyQuestions[index];
            const questionText = question.question || question.question_text;

            setMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    content: questionText,
                    question: question,
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const formatAnswerDisplay = (answer, question) => {
        const questionType = question.type || question.question_type;
        if (questionType === 'checkbox' && Array.isArray(answer)) {
            return answer.length > 0 ? answer.join(', ') : 'No options selected';
        }
        return answer;
    };

    const validateAnswer = (answer, question) => {
        if (question.required && (!answer || answer.trim() === '')) {
            return false;
        }

        if (question.question_type === 'email' && answer) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(answer);
        }

        if (question.question_type === 'phone' && answer) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(answer.replace(/[\s\-\(\)]/g, ''));
        }

        return true;
    };

    const handleAnswerSubmit = async () => {
        if (currentQuestionIndex < 0) {
            const userInfoIndex = currentQuestionIndex + 3;
            const currentQuestion = userInfoQuestions[userInfoIndex];

            if (!validateAnswer(currentAnswer, currentQuestion)) {
                setMessages(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        content: getValidationMessage(currentQuestion),
                        timestamp: new Date(),
                        isError: true,
                    },
                ]);
                return;
            }

            const field = currentQuestion.id;
            setUserInfo(prev => ({
                ...prev,
                [field]: currentAnswer,
            }));

            setMessages(prev => [
                ...prev,
                {
                    type: 'user',
                    content: currentAnswer,
                    timestamp: new Date(),
                },
            ]);

            setCurrentAnswer('');

            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < 0) {
                setCurrentQuestionIndex(nextIndex);
                setTimeout(() => {
                    askUserInfoQuestion(nextIndex + 3);
                }, 500);
            } else {
                setCurrentQuestionIndex(0);
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            type: 'bot',
                            content: "Great! Now let's continue with the survey questions.",
                            timestamp: new Date(),
                        },
                    ]);

                    if (surveyQuestions.length > 0) {
                        setTimeout(() => {
                            askSurveyQuestion(0);
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            setMessages(prev => [
                                ...prev,
                                {
                                    type: 'bot',
                                    content:
                                        'Thank you for providing your information! Your response is being submitted...',
                                    timestamp: new Date(),
                                },
                            ]);
                            submitSurvey();
                        }, 500);
                    }
                }, 500);
            }
            return;
        }

        if (currentQuestionIndex >= 0 && currentQuestionIndex < surveyQuestions.length) {
            const currentQuestion = surveyQuestions[currentQuestionIndex];
            const questionType = currentQuestion.type || currentQuestion.question_type;

            if (!currentAnswer && questionType !== 'checkbox') {
                return;
            }

            setMessages(prev => [
                ...prev,
                {
                    type: 'user',
                    content: formatAnswerDisplay(currentAnswer, currentQuestion),
                    timestamp: new Date(),
                },
            ]);

            const questionKey = `question_${currentQuestion.order || currentQuestionIndex + 1}`;

            setResponses(prev => ({
                ...prev,
                [questionKey]: currentAnswer,
            }));

            setCurrentAnswer('');

            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < surveyQuestions.length) {
                setCurrentQuestionIndex(nextIndex);
                setTimeout(() => {
                    askSurveyQuestion(nextIndex);
                }, 500);
            } else {
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            type: 'bot',
                            content:
                                'Thank you for completing the survey! Your responses are being submitted...',
                            timestamp: new Date(),
                        },
                    ]);
                    submitSurvey();
                }, 500);
            }
        }
    };

    const getValidationMessage = question => {
        switch (question.question_type) {
            case 'email':
                return 'Please enter a valid email address (e.g., example@email.com)';
            case 'phone':
                return 'Please enter a valid phone number';
            default:
                return `${question.question_text.replace('?', '')} is required. Please provide an answer.`;
        }
    };

    const submitSurvey = async () => {
        setSubmitting(true);

        try {
            const payload = {
                responses: responses,
                respondent_info: userInfo,
            };

            const response = await surveysAPI.submitResponse(surveyId, payload);
            const responseData = response.data.data;

            setMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    content:
                        '✅ Your responses have been submitted successfully! Redirecting you to view your submission...',
                    timestamp: new Date(),
                    isSuccess: true,
                },
            ]);

            setIsComplete(true);

            setTimeout(() => {
                if (responseData.view_submission_url) {
                    window.location.href = responseData.view_submission_url;
                } else if (responseData.response_id) {
                    window.location.href = `/submission/${responseData.response_id}/view`;
                }
            }, 2000);
        } catch (error) {
            console.error('Error submitting survey:', error);

            if (error.response?.status === 409) {
                const errorData = error.response.data.data;
                if (errorData?.already_submitted && errorData?.view_submission_url) {
                    setMessages(prev => [
                        ...prev,
                        {
                            type: 'bot',
                            content:
                                '⚠️ You have already submitted a response to this survey. Redirecting you to view your previous submission...',
                            timestamp: new Date(),
                            isInfo: true,
                        },
                    ]);

                    setTimeout(() => {
                        window.location.href = errorData.view_submission_url;
                    }, 3000);
                    return;
                }
            }

            setMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    content: '❌ There was an error submitting your responses. Please try again.',
                    timestamp: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setSubmitting(false);
        }
    };

    const getCurrentQuestion = () => {
        if (currentQuestionIndex < 0) {
            const userInfoIndex = currentQuestionIndex + 3;
            return userInfoQuestions[userInfoIndex];
        } else if (currentQuestionIndex >= 0 && currentQuestionIndex < surveyQuestions.length) {
            return surveyQuestions[currentQuestionIndex];
        }
        return null;
    };

    return {
        messages,
        currentQuestionIndex,
        responses,
        userInfo,
        currentAnswer,
        setCurrentAnswer,
        isComplete,
        submitting,
        initializeSurvey,
        handleAnswerSubmit,
        getCurrentQuestion,
        checkExistingSubmission,
    };
};
