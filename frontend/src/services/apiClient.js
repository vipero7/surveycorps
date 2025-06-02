import axios from 'axios';
import Cookies from 'universal-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

const clearAuthData = () => {
    const cookies = new Cookies();
    cookies.remove('access_token', { path: '/' });
    cookies.remove('refresh_token', { path: '/' });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

const callLogoutEndpoint = async () => {
    try {
        await axios.post(
            `${API_BASE_URL}auth/logout/`,
            {},
            {
                withCredentials: true,
            }
        );
    } catch (error) {
        console.error('Logout endpoint call failed:', error);
    }
};

apiClient.interceptors.request.use(
    config => {
        const cookies = new Cookies();
        let token = cookies.get('access_token');

        if (!token) {
            token = localStorage.getItem('access_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/login/' &&
            originalRequest.url !== '/auth/token/refresh/' &&
            originalRequest.url !== '/auth/logout/'
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const cookies = new Cookies();
            const refreshToken =
                cookies.get('refresh_token') || localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${API_BASE_URL}auth/token/refresh/`,
                        {
                            refresh: refreshToken,
                        },
                        {
                            withCredentials: true,
                        }
                    );

                    const newAccessToken = response.data.access;
                    const newRefreshToken = response.data.refresh;

                    if (newAccessToken) {
                        cookies.set('access_token', newAccessToken, { path: '/' });
                        localStorage.setItem('access_token', newAccessToken);

                        if (newRefreshToken) {
                            cookies.set('refresh_token', newRefreshToken, { path: '/' });
                            localStorage.setItem('refresh_token', newRefreshToken);
                        }

                        processQueue(null, newAccessToken);

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    processQueue(refreshError, null);

                    await callLogoutEndpoint();
                    clearAuthData();
                    window.location.href = '/login';
                } finally {
                    isRefreshing = false;
                }
            } else {
                isRefreshing = false;
                processQueue(error, null);

                await callLogoutEndpoint();
                clearAuthData();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
