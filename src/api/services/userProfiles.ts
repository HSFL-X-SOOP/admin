import apiClient from '../client';
import {
    UserProfile,
    UserProfilesResponse,
    CreateUserProfileRequest,
    UpdateUserProfileRequest,
    UserProfileFilters
} from '../models/userProfiles';

class UserProfilesService {
    /**
     * Get all user profiles with pagination and filters (Admin only)
     */
    async getUserProfiles(filters?: UserProfileFilters): Promise<UserProfilesResponse> {
        const params = new URLSearchParams();

        if (filters) {
            // Pagination parameters
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

            // Filter parameters
            if (filters.id !== undefined) params.append('id', filters.id.toString());
            if (filters.email) params.append('email', filters.email);
            if (filters.authorityRole) params.append('authorityRole', filters.authorityRole);
            if (filters.activityRole) params.append('activityRole', filters.activityRole);
            if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
            if (filters.language) params.append('language', filters.language);
            if (filters.measurementSystem) params.append('measurementSystem', filters.measurementSystem);
            if (filters.userCreatedAt) params.append('userCreatedAt', filters.userCreatedAt);
            if (filters.profileCreatedAt) params.append('profileCreatedAt', filters.profileCreatedAt);
            if (filters.profileUpdatedAt) params.append('profileUpdatedAt', filters.profileUpdatedAt);

            // Sorting parameters
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
        }

        const response = await apiClient.get<UserProfilesResponse>(
            `/admin/user-profiles?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get a specific user profile by user ID (Admin only)
     */
    async getUserProfileById(userId: number): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>(`/admin/user-profiles/${userId}`);
        return response.data;
    }

    /**
     * Update a user's profile by user ID (Admin only)
     */
    async updateUserProfile(userId: number, data: UpdateUserProfileRequest): Promise<UserProfile> {
        const response = await apiClient.put<UserProfile>(`/admin/user-profiles`, {
            ...data,
            userId
        });
        return response.data;
    }

    /**
     * Delete a user's profile by user ID (Admin only)
     */
    async deleteUserProfile(userId: number): Promise<void> {
        await apiClient.delete(`/admin/user-profiles/${userId}`);
    }

    /**
     * Get user's recent activity by user ID (Admin only)
     */
    async getUserRecentActivity(userId: number): Promise<any> {
        const response = await apiClient.get(`/admin/user-profiles/${userId}/recent-activity`);
        return response.data;
    }

    /**
     * Block a user (add to blacklist) (Admin only)
     */
    async blockUser(userId: number): Promise<string> {
        const response = await apiClient.post<string>('/admin/user-profiles/block', { userId });
        return response.data;
    }

    /**
     * Get current user's own profile
     */
    async getCurrentUserProfile(): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>('/user-profile');
        return response.data;
    }

    /**
     * Create current user's profile
     */
    async createCurrentUserProfile(data: CreateUserProfileRequest): Promise<UserProfile> {
        const response = await apiClient.post<UserProfile>('/user-profile', data);
        return response.data;
    }

    /**
     * Update current user's profile
     */
    async updateCurrentUserProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
        const response = await apiClient.put<UserProfile>('/user-profile', data);
        return response.data;
    }

    /**
     * Delete current user's account
     */
    async deleteCurrentUserAccount(): Promise<void> {
        await apiClient.delete('/user-profile');
    }
}

export default new UserProfilesService();