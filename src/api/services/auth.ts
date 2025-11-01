import apiClient from '../client';
import {
    LoginRequest,
    LoginResponse,
} from '../models/auth';

class AuthService {
    async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/login', request);
        return response.data;
    }

    async getUserProfile() {
        const response = await apiClient.get('/user-profile');
        return response.data;
    }
}

export default new AuthService();