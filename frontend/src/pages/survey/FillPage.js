import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AlertCircle, Calendar, Clock } from 'lucide-react';

import { ChatCompletion, ChatHeader, ChatInput, ChatMessages } from '../../components/survey/Chat';
import { useSurveyChat } from '../../hooks/useSurveyChat';
import { surveysAPI } from '../../services/api/survey';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';

const FillPage = () => {
    const { oid } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorType, setErrorType] = useState(null);
    const [checkingSubmission, setCheckingSubmission] = useState(false);
    const initRef = useRef(false);
    const inputRef = useRef(null);

    const {
        messages,
        currentQuestionIndex,
        responses,
        userInfo,
        isComplete,
        submitting,
        initializeSurvey,
        handleAnswerSubmit,
        currentAnswer,
        setCurrentAnswer,
        getCurrentQuestion,
        checkExistingSubmission,
    } = useSurveyChat();

    useEffect(() => {
        if (oid && !survey) {
            fetchSurvey();
        }
    }, [oid]);

    useEffect(() => {
        if (!submitting && !isComplete && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, currentQuestionIndex, submitting, isComplete]);

    const fetchSurvey = async () => {
        if (initRef.current) return;

        try {
            const response = await surveysAPI.getPublic(oid);
            const surveyData = extractApiData(response);
            setSurvey(surveyData);

            if (surveyData && !initRef.current) {
                initRef.current = true;
                initializeSurvey(surveyData, oid);
            }
        } catch (error) {
            console.error('Error fetching survey:', error);
            const errorMessage = extractApiError(error);

            if (errorMessage.includes('not currently active')) {
                setErrorType('inactive');
                setError('This survey is not currently active');
            } else if (errorMessage.includes('not found')) {
                setErrorType('not_found');
                setError('Survey not found');
            } else {
                setErrorType('general');
                setError('Survey not available');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmission = async email => {
        setCheckingSubmission(true);
        const result = await checkExistingSubmission(email);
        setCheckingSubmission(false);
        return result;
    };

    const handleAnswerSubmitWithFocus = async (...args) => {
        try {
            await handleAnswerSubmit(...args);
        } finally {
            setTimeout(() => {
                if (inputRef.current && !isComplete) {
                    inputRef.current.focus();
                }
            }, 150);
        }
    };

    const formatDate = dateString => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading survey...</div>
                </div>
            </div>
        );
    }

    if (checkingSubmission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Checking your previous submissions...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        {errorType === 'inactive' ? (
                            <>
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Survey Not Active
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    This survey is currently not accepting responses. It may be
                                    scheduled for a different time period or has been temporarily
                                    paused.
                                </p>
                                {survey?.start_date && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                            <span className="text-sm font-medium text-blue-800">
                                                Survey Schedule
                                            </span>
                                        </div>
                                        {survey.start_date && (
                                            <p className="text-sm text-blue-700">
                                                <strong>Starts:</strong>{' '}
                                                {formatDate(survey.start_date)}
                                            </p>
                                        )}
                                        {survey.end_date && (
                                            <p className="text-sm text-blue-700">
                                                <strong>Ends:</strong> {formatDate(survey.end_date)}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Check Again
                                    </button>
                                    <p className="text-sm text-gray-500">
                                        Contact the survey administrator if you believe this is an
                                        error
                                    </p>
                                </div>
                            </>
                        ) : errorType === 'not_found' ? (
                            <>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Survey Not Found
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    The survey you're looking for doesn't exist or may have been
                                    removed. Please check the link and try again.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <p className="text-sm text-gray-500">
                                        Make sure you have the correct survey link
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-8 h-8 text-gray-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Survey Unavailable
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    This survey is currently not available. Please try again later
                                    or contact support if the problem persists.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Retry
                                    </button>
                                    <button
                                        onClick={() => window.history.back()}
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = getCurrentQuestion();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <ChatHeader survey={survey} />
                <ChatMessages messages={messages} />
                {!isComplete && currentQuestion && (
                    <ChatInput
                        ref={inputRef}
                        question={currentQuestion}
                        currentAnswer={currentAnswer}
                        setCurrentAnswer={setCurrentAnswer}
                        onSubmit={
                            currentQuestion.question_type === 'email'
                                ? () =>
                                      handleEmailSubmission(currentAnswer).then(shouldContinue => {
                                          if (shouldContinue) handleAnswerSubmitWithFocus();
                                      })
                                : handleAnswerSubmitWithFocus
                        }
                        submitting={submitting}
                        autoFocus={true}
                    />
                )}
                {isComplete && <ChatCompletion />}
            </div>
        </div>
    );
};

export default FillPage;
