import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Share, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import { surveysAPI } from '../../services/api/survey';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';
import { useNotification } from '../../context/NotificationContext';

const ListPage = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const response = await surveysAPI.getAll();
            const data = extractApiData(response);

            // Handle the nested structure from your Django API
            const surveyList = data.surveys || data || [];
            setSurveys(surveyList);
        } catch (error) {
            console.error('Error fetching surveys:', error);
            setError(extractApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (surveyOid, surveyTitle) => {
        if (window.confirm(`Are you sure you want to delete "${surveyTitle}"?`)) {
            try {
                await surveysAPI.delete(surveyOid);
                showSuccess('Survey deleted successfully!');
                fetchSurveys(); // Refresh the list
            } catch (error) {
                showError('Error deleting survey: ' + extractApiError(error));
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            draft: 'bg-gray-100 text-gray-800',
            published: 'bg-green-100 text-green-800',
            closed: 'bg-red-100 text-red-800',
            archived: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status] || statusStyles.draft}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
                    <Button onClick={() => navigate('/dashboard/surveys/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Survey
                    </Button>
                </div>
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    Loading surveys...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
                    <Button onClick={() => navigate('/dashboard/surveys/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Survey
                    </Button>
                </div>
                <div className="bg-red-50 p-8 rounded-lg shadow text-center text-red-600">
                    Error loading surveys: {error}
                    <br />
                    <button
                        onClick={fetchSurveys}
                        className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
                <Button onClick={() => navigate('/dashboard/surveys/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Survey
                </Button>
            </div>

            {surveys.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No surveys yet. Create your first survey to get started!
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Your Surveys ({surveys.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {surveys.map((survey) => (
                            <div key={survey.oid} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {survey.title}
                                            </h3>
                                            {getStatusBadge(survey.status)}
                                        </div>

                                        {survey.description && (
                                            <p className="mt-1 text-gray-600 text-sm">
                                                {survey.description}
                                            </p>
                                        )}

                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Created {formatDate(survey.created_at)}
                                            </span>

                                            {survey.total_responses !== undefined && (
                                                <span>
                                                    {survey.total_responses} responses
                                                </span>
                                            )}

                                            {survey.category_display && (
                                                <span>
                                                    {survey.category_display}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Distribute button - available for ALL surveys */}
                                        <button
                                            onClick={() => navigate(`/dashboard/surveys/${survey.oid}/distribute`)}
                                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                                            title="Distribute survey"
                                        >
                                            <Share className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => navigate(`/dashboard/surveys/${survey.oid}`)}
                                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                                            title="View survey"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(survey.oid, survey.title)}
                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                                            title="Delete survey"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListPage;