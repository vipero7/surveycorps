import { useState } from 'react';
import { surveysAPI } from '../services/api/survey';

export const useSurveyChat = () => {
    const [messages, setMessages] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-3); // Start with user info
    const [responses, setResponses] = useState({});
    const [userInfo, setUserInfo] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [surveyId, setSurveyId] = useState(null);
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [initialized, setInitialized] = useState(false);

    // Required user info questions
    const userInfoQuestions = [
        {
            id: 'full_name',
            question_text: 'What is your full name?',
            question_type: 'text',
            required: true
        },
        {
            id: 'email',
            question_text: 'What is your email address?',
            question_type: 'email',
            required: true
        },
        {
            id: 'phone',
            question_text: 'What is your phone number?',
            question_type: 'phone',
            required: true
        }
    ];

    const initializeSurvey = (surveyData, oid) => {
        // Prevent double initialization completely
        if (initialized || surveyId === oid) return;

        setSurveyId(oid);
        setSurveyQuestions(surveyData.questions || []);
        setInitialized(true);

        console.log('Survey questions:', surveyData.questions); // Debug log

        // Add welcome messages
        const welcomeMessages = [
            {
                type: 'bot',
                content: `Welcome to "${surveyData.title}"!`,
                timestamp: new Date()
            },
            {
                type: 'bot',
                content: surveyData.description || 'Before we start with the survey questions, I need to collect some basic information.',
                timestamp: new Date()
            }
        ];

        setMessages(welcomeMessages);

        // Start with first user info question after a delay
        setTimeout(() => {
            // Double check we haven't already started
            if (currentQuestionIndex === -3) {
                askUserInfoQuestion(0);
            }
        }, 1500);
    };

    const askUserInfoQuestion = (index) => {
        if (index < userInfoQuestions.length) {
            const question = userInfoQuestions[index];

            // Additional safety check - don't add if messages already contain this question
            const questionAlreadyAsked = messages.some(msg =>
                msg.type === 'bot' && msg.content === question.question_text
            );

            if (questionAlreadyAsked) {
                return;
            }

            setMessages(prev => {
                // Final check at the moment of adding
                const alreadyExists = prev.some(msg =>
                    msg.type === 'bot' && msg.content === question.question_text
                );

                if (alreadyExists) {
                    return prev;
                }

                return [...prev, {
                    type: 'bot',
                    content: question.question_text,
                    question: question,
                    timestamp: new Date()
                }];
            });
        }
    };

    const askSurveyQuestion = (index) => {
        if (index < surveyQuestions.length) {
            const question = surveyQuestions[index];
            const questionText = question.question || question.question_text;

            console.log('Asking survey question:', questionText, 'Question object:', question); // Debug log

            setMessages(prev => [...prev, {
                type: 'bot',
                content: questionText,
                question: question,
                timestamp: new Date()
            }]);
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
        console.log('handleAnswerSubmit called, currentQuestionIndex:', currentQuestionIndex); // Debug log
        console.log('currentAnswer:', currentAnswer); // Debug log

        // Handle user info questions (indices -3, -2, -1)
        if (currentQuestionIndex < 0) {
            const userInfoIndex = currentQuestionIndex + 3; // Convert to 0, 1, 2
            const currentQuestion = userInfoQuestions[userInfoIndex];

            console.log('Processing user info question:', currentQuestion.id); // Debug log

            // Validate required user info
            if (!validateAnswer(currentAnswer, currentQuestion)) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: getValidationMessage(currentQuestion),
                    timestamp: new Date(),
                    isError: true
                }]);
                return;
            }

            // Store user info
            const field = currentQuestion.id;
            setUserInfo(prev => {
                const newUserInfo = {
                    ...prev,
                    [field]: currentAnswer
                };
                console.log('Updated user info:', newUserInfo); // Debug log
                return newUserInfo;
            });

            // Add user's answer to messages
            setMessages(prev => [...prev, {
                type: 'user',
                content: currentAnswer,
                timestamp: new Date()
            }]);

            setCurrentAnswer('');

            // Move to next user info question or start survey
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < 0) {
                setCurrentQuestionIndex(nextIndex);
                setTimeout(() => {
                    askUserInfoQuestion(nextIndex + 3);
                }, 500);
            } else {
                // User info complete, start survey questions
                setCurrentQuestionIndex(0);
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        content: 'Great! Now let\'s continue with the survey questions.',
                        timestamp: new Date()
                    }]);

                    if (surveyQuestions.length > 0) {
                        setTimeout(() => {
                            askSurveyQuestion(0);
                        }, 1000);
                    } else {
                        // No survey questions, complete immediately
                        setTimeout(() => {
                            setMessages(prev => [...prev, {
                                type: 'bot',
                                content: 'Thank you for providing your information! Your response is being submitted...',
                                timestamp: new Date()
                            }]);
                            submitSurvey();
                        }, 500);
                    }
                }, 500);
            }
            return;
        }

        // Handle survey questions
        if (currentQuestionIndex >= 0 && currentQuestionIndex < surveyQuestions.length) {
            const currentQuestion = surveyQuestions[currentQuestionIndex];
            const questionType = currentQuestion.type || currentQuestion.question_type;

            console.log('Processing survey question:', currentQuestion); // Debug log
            console.log('Question type:', questionType); // Debug log
            console.log('Current answer:', currentAnswer); // Debug log

            if (!currentAnswer && questionType !== 'checkbox') {
                console.log('No answer provided for required question'); // Debug log
                return;
            }

            // Add user's answer to messages
            setMessages(prev => [...prev, {
                type: 'user',
                content: formatAnswerDisplay(currentAnswer, currentQuestion),
                timestamp: new Date()
            }]);

            // Store the response using order as key
            const questionKey = `question_${currentQuestion.order || (currentQuestionIndex + 1)}`;

            console.log('Storing response with key:', questionKey, 'value:', currentAnswer); // Debug log

            setResponses(prev => {
                const newResponses = {
                    ...prev,
                    [questionKey]: currentAnswer
                };
                console.log('Updated responses:', newResponses); // Debug log
                return newResponses;
            });

            setCurrentAnswer('');

            // Move to next question or complete
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < surveyQuestions.length) {
                setCurrentQuestionIndex(nextIndex);
                setTimeout(() => {
                    askSurveyQuestion(nextIndex);
                }, 500);
            } else {
                // Survey complete
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        content: 'Thank you for completing the survey! Your responses are being submitted...',
                        timestamp: new Date()
                    }]);
                    submitSurvey();
                }, 500);
            }
        }
    };

    const getValidationMessage = (question) => {
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

        console.log('Submitting survey with data:'); // Debug log
        console.log('responses:', responses); // Debug log
        console.log('userInfo:', userInfo); // Debug log

        try {
            const payload = {
                responses: responses,
                respondent_info: userInfo
            };

            console.log('Final payload:', payload); // Debug log

            await surveysAPI.submitResponse(surveyId, payload);

            setMessages(prev => [...prev, {
                type: 'bot',
                content: '✅ Your responses have been submitted successfully! Thank you for participating.',
                timestamp: new Date(),
                isSuccess: true
            }]);
            setIsComplete(true);
        } catch (error) {
            console.error('Error submitting survey:', error); // Debug log
            setMessages(prev => [...prev, {
                type: 'bot',
                content: '❌ There was an error submitting your responses. Please try again.',
                timestamp: new Date(),
                isError: true
            }]);
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
        getCurrentQuestion
    };
};