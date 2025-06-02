import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AlertCircle } from 'lucide-react';

import { ChatCompletion, ChatHeader, ChatInput, ChatMessages } from '../../components/survey/Chat';
import { useSurveyChat } from '../../hooks/useSurveyChat';
import { surveysAPI } from '../../services/api/survey';
import { extractApiData } from '../../utils/apiHelpers';

const FillPage = () => {
    const { oid } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkingSubmission, setCheckingSubmission] = useState(false);
    const initRef = useRef(false);

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
            setError('Survey not found or not available.');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading survey...</div>
            </div>
        );
    }

    if (checkingSubmission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Checking your previous submissions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-600">{error}</div>
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
                        question={currentQuestion}
                        currentAnswer={currentAnswer}
                        setCurrentAnswer={setCurrentAnswer}
                        onSubmit={
                            currentQuestion.question_type === 'email'
                                ? () =>
                                      handleEmailSubmission(currentAnswer).then(shouldContinue => {
                                          if (shouldContinue) handleAnswerSubmit();
                                      })
                                : handleAnswerSubmit
                        }
                        submitting={submitting}
                    />
                )}
                {isComplete && <ChatCompletion />}
            </div>
        </div>
    );
};

export default FillPage;
