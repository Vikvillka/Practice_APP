import axios from 'axios';

export const API_URL = 'https://localhost:7066/api';

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

$api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

$api.interceptors.response.use(
    response => {
        if (response.config.url.includes('/auth/login') || 
            response.config.url.includes('/auth/registration')) {
            const { accessToken } = response.data;
            if (accessToken) {
                localStorage.setItem('token', accessToken);
            }
        }
        return response;
    },
    async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            !originalRequest._isRetry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/registration')) {
            
            originalRequest._isRetry = true;
            
            try {
                const response = await axios.get(`${API_URL}/auth/refresh`, {
                    withCredentials: true
                });
                
                localStorage.setItem('token', response.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return $api(originalRequest);
            } catch (refreshError) {
                console.log('Не удалось обновить токен');
                localStorage.removeItem('token');
                if (window.location.pathname !== '/signin') {
                    window.location.href = '/signin';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default $api;