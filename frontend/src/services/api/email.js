import apiClient from '../apiClient';

export const emailAPI = {
  sendSurveyInvites: (surveyId, data) => apiClient.post(`/survey/${surveyId}/send-invites/`, data),
};
