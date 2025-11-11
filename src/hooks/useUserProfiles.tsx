import { useState, useEffect, useCallback } from "react";
import userProfilesService from "@/api/services/userProfiles";
import {
    UserProfile,
    UserProfileFilters,
    UpdateUserProfileRequest
} from "@/api/models/userProfiles";
import { useToast } from "@/hooks/useToast";

interface UseUserProfilesOptions {
    initialPage?: number;
    initialLimit?: number;
    initialFilters?: Omit<UserProfileFilters, 'page' | 'limit'>;
}

export const useUserProfiles = (options?: UseUserProfilesOptions) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(options?.initialPage || 1);
    const [limit, setLimit] = useState(options?.initialLimit || 10);

    // Filter state
    const [filters, setFilters] = useState<Omit<UserProfileFilters, 'page' | 'limit'>>(
        options?.initialFilters || {}
    );

    const toast = useToast();

    // Manual refresh function
    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await userProfilesService.getUserProfiles({
                ...filters,
                page: page - 1, // Backend uses 0-based pagination
                limit
            });

            setUsers(response.items);
            setTotalCount(response.totalCount);
            setFilteredCount(response.filteredCount);

            toast.showSuccess("Users refreshed");
            return { success: true, data: response };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to load users";
            console.error(errorMessage, error);
            setError(errorMessage);
            toast.showError(errorMessage);

            // Set empty data on error
            setUsers([]);
            setTotalCount(0);
            setFilteredCount(0);

            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [filters, page, limit, toast]);

    // Load users when filters, page, or limit changes
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await userProfilesService.getUserProfiles({
                    ...filters,
                    page: page - 1, // Backend uses 0-based pagination
                    limit
                });

                setUsers(response.items);
                setTotalCount(response.totalCount);
                setFilteredCount(response.filteredCount);
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || "Failed to load users";
                console.error(errorMessage, error);
                setError(errorMessage);

                // Set empty data on error
                setUsers([]);
                setTotalCount(0);
                setFilteredCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [filters, page, limit]); // Only depend on actual data dependencies

    // Update user profile
    const updateUserProfile = useCallback(async (userId: number, data: UpdateUserProfileRequest) => {
        try {
            setIsLoading(true);
            const updatedUser = await userProfilesService.updateUserProfile(userId, data);

            // Update local state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? updatedUser : user
                )
            );

            toast.showSuccess(`User profile updated successfully`);
            return { success: true, data: updatedUser };
        } catch (error) {
            const errorMessage = "Failed to update user profile";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Delete user profile
    const deleteUserProfile = useCallback(async (userId: number) => {
        try {
            setIsLoading(true);
            await userProfilesService.deleteUserProfile(userId);

            // Remove user from local state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            setFilteredCount(prev => prev - 1);
            setTotalCount(prev => prev - 1);

            toast.showSuccess(`User deleted successfully`);
            return { success: true };
        } catch (error) {
            const errorMessage = "Failed to delete user";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Block user
    const blockUser = useCallback(async (userId: number) => {
        try {
            setIsLoading(true);
            const result = await userProfilesService.blockUser(userId);

            // You could update the local state here if needed
            // For now, just show success message

            toast.showSuccess(`User blocked successfully`);
            return { success: true, data: result };
        } catch (error) {
            const errorMessage = "Failed to block user";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Get user by ID
    const getUserById = useCallback(async (userId: number) => {
        try {
            const user = await userProfilesService.getUserProfileById(userId);
            return { success: true, data: user };
        } catch (error) {
            const errorMessage = `Failed to load user with ID ${userId}`;
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [toast]);

    // Get user recent activity
    const getUserRecentActivity = useCallback(async (userId: number) => {
        try {
            const activity = await userProfilesService.getUserRecentActivity(userId);
            return { success: true, data: activity };
        } catch (error) {
            const errorMessage = `Failed to load recent activity for user ${userId}`;
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [toast]);

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<UserProfileFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page when filters change
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
    }, []);

    // Pagination helpers
    const totalPages = Math.ceil(filteredCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setPage(prev => prev + 1);
        }
    }, [hasNextPage]);

    const prevPage = useCallback(() => {
        if (hasPrevPage) {
            setPage(prev => prev - 1);
        }
    }, [hasPrevPage]);

    const changeLimit = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when limit changes
    }, []);

    // Search users
    const searchUsers = useCallback((query: string) => {
        if (query) {
            updateFilters({ email: query });
        } else {
            updateFilters({ email: undefined });
        }
    }, [updateFilters]);

    return {
        // State
        users,
        totalCount,
        filteredCount,
        isLoading,
        error,

        // Pagination
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,

        // Filters
        filters,

        // Methods
        loadUsers,
        updateUserProfile,
        deleteUserProfile,
        blockUser,
        getUserById,
        getUserRecentActivity,

        // Filter methods
        updateFilters,
        clearFilters,
        searchUsers,

        // Pagination methods
        goToPage,
        nextPage,
        prevPage,
        changeLimit,
    };
};