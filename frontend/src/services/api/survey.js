import apiClient from '../apiClient';

export const surveysAPI = {
    getAll: () => apiClient.get('/survey/'),
    getById: oid => apiClient.get(`/survey/${oid}/`),
    create: data => apiClient.post('/survey/', data),
    update: (oid, data) => apiClient.put(`/survey/${oid}/`, data),
    delete: oid => apiClient.delete(`/survey/${oid}/`),
    publish: (oid, data = { action: 'publish' }) => apiClient.post(`/survey/${oid}/publish/`, data),
    getPublic: oid => apiClient.get(`/survey/${oid}/get-public/`),
    submitResponse: (oid, data) => apiClient.post(`/survey/${oid}/fill/`, data),
    getResponses: oid => apiClient.get(`/survey/${oid}/responses/`),
    checkSubmission: (oid, email) => apiClient.post(`/survey/${oid}/check-submission/`, { email }),
    getSubmission: responseOid => apiClient.get(`/survey/submission/${responseOid}/view/`),
};
