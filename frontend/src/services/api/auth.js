import apiClient from '../apiClient';

export const authAPI = {
  login: credentials => apiClient.post('/auth/login/', credentials),
  logout: () => apiClient.post('/auth/logout/'),
  me: () => apiClient.get('/auth/me/'),
};
