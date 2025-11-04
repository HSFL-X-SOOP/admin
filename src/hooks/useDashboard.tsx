import { useState, useEffect, useCallback } from "react";
import dashboardService from "@/api/services/dashboard";
import { DashboardInfo } from "@/api/models/dashboard";
import { useToast } from "@/hooks/useToast";

export const useDashboard = () => {
    const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    // Load dashboard info on mount
    useEffect(() => {
        loadDashboardInfo();
    }, []);

    const loadDashboardInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await dashboardService.getDashboardInfo();
            setDashboardInfo(data);
            return { success: true, data };
        } catch (error) {
            const errorMessage = "Failed to load dashboard information";
            console.error(errorMessage, error);
            setError(errorMessage);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const refreshDashboard = useCallback(async () => {
        return loadDashboardInfo();
    }, [loadDashboardInfo]);

    return {
        // State
        dashboardInfo,
        isLoading,
        error,

        // Methods
        loadDashboardInfo,
        refreshDashboard,
    };
};
