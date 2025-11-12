import apiClient from '../client';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
} from '../models/auth';

class AuthService {
    async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/login', request);
        return response.data;
    }

    async register(request: RegisterRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/register', request);
        return response.data;
    }

    async createUser(request: RegisterRequest): Promise<void> {
        // Create user as admin without updating current session
        await apiClient.post('/register', request);
        // Explicitly don't return or process the tokens
    }

    async getUserProfile() {
        const response = await apiClient.get('/user-profile');
        return response.data;
    }
}

export default new AuthService();