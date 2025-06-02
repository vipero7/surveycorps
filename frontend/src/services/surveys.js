import apiClient from '../apiClient';

export const surveysAPI = {
  getAll: () => apiClient.get('/surveys/'),
  getById: oid => apiClient.get(`/surveys/${oid}/`),
  create: data => apiClient.post('/surveys/', data),
  update: (oid, data) => apiClient.put(`/surveys/${oid}/`, data),
  delete: oid => apiClient.delete(`/surveys/${oid}/`),
  getResponses: oid => apiClient.get(`/surveys/${oid}/responses/`),
  submitResponse: (oid, data) => apiClient.post(`/surveys/${oid}/submit/`, data),
};
