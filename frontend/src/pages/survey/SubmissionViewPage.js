import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AlertCircle, CheckCircle } from 'lucide-react';

import { ChatHeader, ChatMessages } from '../../components/survey/Chat';
import { surveysAPI } from '../../services/api/survey';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';

const SubmissionViewPage = () => {
    const { responseOid } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        fetchSubmission();
    }, [responseOid]);

    const fetchSubmission = async () => {
        try {
            setLoading(true);
            const response = await surveysAPI.getSubmission(responseOid);
            const data = extractApiData(response);
            setSubmission(data);
            generateChatMessages(data);
        } catch (error) {
            console.error('Error fetching submission:', error);
            setError(extractApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const generateChatMessages = data => {
        const messages = [];
        const survey = data.survey;
        const answers = data.answers;
        const respondent = data.respondent;

        // Welcome messages (same as original)
        messages.push({
            type: 'bot',
            content: `Welcome to "${survey.title}"!`,
            timestamp: new Date(data.submitted_at),
        });

        messages.push({
            type: 'bot',
            content:
                survey.description ||
                'Before we start with the survey questions, I need to collect some basic information.',
            timestamp: new Date(data.submitted_at),
        });

        // User info flow (recreate original conversation)
        const userInfoQuestions = [
            { question: 'What is your full name?', answer: respondent.full_name },
            { question: 'What is your email address?', answer: respondent.email },
            { question: 'What is your phone number?', answer: respondent.phone },
        ];

        userInfoQuestions.forEach(item => {
            messages.push({
                type: 'bot',
                content: item.question,
                timestamp: new Date(data.submitted_at),
            });

            messages.push({
                type: 'user',
                content: item.answer,
                timestamp: new Date(data.submitted_at),
            });
        });

        // Transition message (same as original)
        messages.push({
            type: 'bot',
            content: "Great! Now let's continue with the survey questions.",
            timestamp: new Date(data.submitted_at),
        });

        // Survey questions and answers (same flow as original)
        if (survey.questions && survey.questions.length > 0) {
            survey.questions.forEach((question, index) => {
                const questionText = question.question || question.question_text;

                messages.push({
                    type: 'bot',
                    content: questionText,
                    question: question, // Include question object for formatting
                    timestamp: new Date(data.submitted_at),
                });

                // Find and format answer
                const questionKey = `question_${question.order || index + 1}`;
                let answer = answers[questionKey] || answers[index] || 'No answer provided';

                // Format answer same as original chat
                if (question.type === 'checkbox' && Array.isArray(answer)) {
                    answer = answer.length > 0 ? answer.join(', ') : 'No options selected';
                }

                messages.push({
                    type: 'user',
                    content: answer,
                    timestamp: new Date(data.submitted_at),
                });
            });
        }

        // Final completion message (same as original)
        messages.push({
            type: 'bot',
            content: 'Thank you for completing the survey! Your responses are being submitted...',
            timestamp: new Date(data.submitted_at),
        });

        messages.push({
            type: 'bot',
            content:
                '✅ Your responses have been submitted successfully! Thank you for participating.',
            timestamp: new Date(data.submitted_at),
            isSuccess: true,
        });

        setChatMessages(messages);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading your submission...</div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-600">{error || 'Submission not found'}</div>
                </div>
            </div>
        );
    }

    // Use exact same survey object structure for ChatHeader
    const surveyForHeader = {
        title: submission.survey.title,
        description: submission.survey.description,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto">
                {/* Exact same ChatHeader */}
                <ChatHeader survey={surveyForHeader} />

                {/* Read-only indicator */}
                <div className="mx-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center text-sm text-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Survey completed - Read-only view
                        </div>
                    </div>
                </div>

                {/* Exact same ChatMessages */}
                <ChatMessages messages={chatMessages} />

                {/* No ChatInput - that's what makes it read-only */}
                {/* No ChatCompletion - because we show it in messages */}
            </div>
        </div>
    );
};

export default SubmissionViewPage;
