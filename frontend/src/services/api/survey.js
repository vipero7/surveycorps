import apiClient from '../apiClient';

export const surveysAPI = {
    getAll: () => apiClient.get('/survey/'),
    getById: (oid) => apiClient.get(`/survey/${oid}/`),
    create: (data) => apiClient.post('/survey/', data),
    update: (oid, data) => apiClient.put(`/survey/${oid}/`, data),
    delete: (oid) => apiClient.delete(`/survey/${oid}/`),
    publish: (oid, data = { action: 'publish' }) => apiClient.post(`/survey/${oid}/publish/`, data),
    getPublic: (oid) => apiClient.get(`/survey/${oid}/fill/`),
    submitResponse: (oid, data) => apiClient.post(`/survey/${oid}/fill/`, data),
    getResponses: (oid) => apiClient.get(`/survey/${oid}/responses/`),
};