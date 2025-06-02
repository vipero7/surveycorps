import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Globe, Share } from 'lucide-react';

import Button from '../../components/common/Button';
import Analytics from '../../components/survey/Detail/Analytics';
import Configuration from '../../components/survey/Detail/Configuration';
import Header from '../../components/survey/Detail/Header';
import Links from '../../components/survey/Detail/Links';
import Questions from '../../components/survey/Detail/Questions';
import StatsCards from '../../components/survey/Detail/StatsCards';
import { useNotification } from '../../context/NotificationContext';
import { surveysAPI } from '../../services/api/survey';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';

const DetailPage = () => {
  const { oid } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurveyDetails();
  }, [oid]);

  const fetchSurveyDetails = async () => {
    try {
      setLoading(true);
      const response = await surveysAPI.getById(oid);
      const data = extractApiData(response);
      setSurvey(data);
    } catch (error) {
      console.error('Error fetching survey details:', error);
      setError(extractApiError(error));
      showError('Error loading survey details: ' + extractApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/surveys')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Surveys
          </Button>
        </div>
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Loading survey details...
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/surveys')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Surveys
          </Button>
        </div>
        <div className="bg-red-50 p-8 rounded-lg shadow text-center text-red-600">
          {error || 'Survey not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/surveys')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Surveys
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/surveys/${oid}/distribute`)}
          >
            <Share className="w-4 h-4 mr-2" />
            Distribute
          </Button>
        </div>
      </div>

      <Header survey={survey} formatDate={formatDate} />
      <StatsCards survey={survey} />
      <Analytics survey={survey} />
      <Configuration survey={survey} formatDate={formatDate} />
      <Questions survey={survey} />
      <Links survey={survey} />
    </div>
  );
};

export default DetailPage;
