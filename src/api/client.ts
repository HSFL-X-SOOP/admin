import axios, {AxiosError, AxiosInstance} from 'axios';
import {LoginResponse, RefreshTokenRequest} from './models/auth';

const API_BASE_URL = 'https://test.marlin-live.com/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Storage functions (browser-specific)
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

// Token refresh logic
const threeHoursMS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const toleranceMS = 60 * 1000; // 1 minute tolerance

// Request interceptor to add token
apiClient.interceptors.request.use(
    async (config) => {
        const session = getSession();

        if (session?.accessToken) {
            // Check if token needs refresh
            const lastRefresh = session.lastTokenRefresh ? new Date(session.lastTokenRefresh) : new Date(session.loggedInSince);
            const now = new Date();
            const age = now.getTime() - lastRefresh.getTime();

            if (session.refreshToken && age >= (threeHoursMS - toleranceMS)) {
                try {
                    // Refresh token
                    const refreshRequest: RefreshTokenRequest = {
                        refreshToken: session.refreshToken,
                    };

                    const response = await axios.post<LoginResponse>(
                        `${API_BASE_URL}/auth/refresh`,
                        refreshRequest
                    );

                    // Update session with new tokens
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
                    // Continue with existing token
                    config.headers.Authorization = `Bearer ${session.accessToken}`;
                }
            } else {
                // Use existing token
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear session and redirect to login
            setSession(null);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;