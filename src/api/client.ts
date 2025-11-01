import axios, {AxiosError, AxiosInstance} from 'axios';
import {LoginResponse, RefreshTokenRequest} from './models/auth';

const API_BASE_URL = 'https://test.marlin-live.com/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getSession = () => {
    const sessionStr = localStorage.getItem('session');
    return sessionStr ? JSON.parse(sessionStr) : null;
};

const setSession = (session: any) => {
    if (session) {
        localStorage.setItem('session', JSON.stringify(session));
    } else {
        localStorage.removeItem('session');
    }
};

const threeHoursMS = 3 * 60 * 60 * 1000;
const toleranceMS = 60 * 1000;

apiClient.interceptors.request.use(
    async (config) => {
        const session = getSession();

        if (session?.accessToken) {
            const lastRefresh = session.lastTokenRefresh ? new Date(session.lastTokenRefresh) : new Date(session.loggedInSince);
            const now = new Date();
            const age = now.getTime() - lastRefresh.getTime();

            if (session.refreshToken && age >= (threeHoursMS - toleranceMS)) {
                try {
                    const refreshRequest: RefreshTokenRequest = {
                        refreshToken: session.refreshToken,
                    };

                    const response = await axios.post<LoginResponse>(
                        `${API_BASE_URL}/auth/refresh`,
                        refreshRequest
                    );

                    const updatedSession = {
                        ...session,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken || session.refreshToken,
                        lastTokenRefresh: now.toISOString(),
                    };

                    setSession(updatedSession);
                    config.headers.Authorization = `Bearer ${response.data.accessToken}`;
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    config.headers.Authorization = `Bearer ${session.accessToken}`;
                }
            } else {
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            setSession(null);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;