import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Check, Copy, Mail } from 'lucide-react';

import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { SurveyHeader } from '../../components/survey';
import { useNotification } from '../../context/NotificationContext';
import { emailAPI } from '../../services/api/email';
import { surveysAPI } from '../../services/api/survey';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';

const DistributePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError, showInfo } = useNotification();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emails, setEmails] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSurvey();
    }, [id]);

    const fetchSurvey = async () => {
        try {
            const response = await surveysAPI.getById(id);
            const surveyData = extractApiData(response);
            setSurvey(surveyData);
        } catch (error) {
            console.error('Error fetching survey:', error);
            showError('Error loading survey: ' + extractApiError(error));
            navigate('/dashboard/surveys');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmails = async () => {
        if (!emails.trim()) {
            showError('Please enter at least one email address');
            return;
        }

        const emailList = emails
            .split(/[,\n]/)
            .map(email => email.trim())
            .filter(email => email);

        if (emailList.length === 0) {
            showError('Please enter valid email addresses');
            return;
        }

        setSending(true);
        try {
            const surveyUrl = `${window.location.origin}/survey/${survey.oid}/fill/`;

            const response = await emailAPI.sendSurveyInvites(survey.oid, {
                emails: emailList,
                survey_url: surveyUrl,
                custom_message: message,
                // Remove the platform field - it's not needed
            });

            const result = extractApiData(response);
            showSuccess(`Survey invitations sent to ${result.sent_count} recipients!`);
            setEmails('');
            setMessage('');
        } catch (error) {
            showError('Error sending emails: ' + extractApiError(error));
        } finally {
            setSending(false);
        }
    };

    const copyToClipboard = async () => {
        const surveyUrl = `${window.location.origin}/survey/${survey.oid}/fill/`;
        try {
            await navigator.clipboard.writeText(surveyUrl);
            setCopied(true);
            showSuccess('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            showError('Failed to copy link');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading survey...</div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600">Survey not found</div>
            </div>
        );
    }

    const surveyUrl = `${window.location.origin}/surveys/${survey.oid}/fill/`;

    return (
        <div className="min-h-screen bg-gray-50">
            <SurveyHeader onBack={() => navigate('/dashboard/surveys')} />
            <PageHeader
                title="Distribute Survey"
                subtitle={`Share "${survey.title}" with your audience`}
            />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow p-6">
                    {/* Survey Link Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Survey Link</h3>
                        <p className="text-gray-600 mb-4">
                            Copy and share this link with your respondents
                        </p>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                            <input
                                type="text"
                                value={surveyUrl}
                                readOnly
                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Email Invitation Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Send Email Invitations
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Addresses
                                </label>
                                <textarea
                                    value={emails}
                                    onChange={e => setEmails(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Separate multiple emails with commas or line breaks
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleSendEmails}
                                    disabled={sending || !emails.trim()}
                                    className="flex-1"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    {sending ? 'Sending...' : 'Send Invitations'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistributePage;
