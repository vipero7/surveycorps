import apiClient from '../apiClient';

export const authAPI = {
    login: credentials => apiClient.post('/auth/login/', credentials),
    logout: () => apiClient.post('/auth/logout/'),
    refreshToken: refreshToken => apiClient.post('/auth/token/refresh/', { refresh: refreshToken }),
};
