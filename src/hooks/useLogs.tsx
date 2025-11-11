import { useState, useEffect, useCallback } from "react";
import logsService from "@/api/services/logs";
import { LogEntry, LogFilters, LogLevel } from "@/api/models/logs";
import { useToast } from "@/hooks/useToast";

interface UseLogsOptions {
    initialPage?: number;
    initialLimit?: number;
    initialFilters?: Omit<LogFilters, 'page' | 'limit'>;
    autoRefresh?: boolean;
    refreshInterval?: number; // in seconds
}

export const useLogs = (options?: UseLogsOptions) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);

    // Pagination state
    const [page, setPage] = useState(options?.initialPage || 1);
    const [limit, setLimit] = useState(options?.initialLimit || 10);

    // Filter state
    const [filters, setFilters] = useState<Omit<LogFilters, 'page' | 'limit'>>(
        options?.initialFilters || {}
    );

    const toast = useToast();

    // Load available services
    const loadServices = useCallback(async () => {
        try {
            const servicesList = await logsService.getServices();
            setServices(servicesList);
        } catch (error) {
            console.error("Failed to load services", error);
            // Don't show error toast as this is not critical
            setServices([]);
        }
    }, []);

    // Manual refresh function
    const loadLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await logsService.getLogs({
                ...filters,
                page: page - 1, // Backend uses 0-based pagination
                limit
            });

            setLogs(response.items);
            setTotalCount(response.totalCount);
            setFilteredCount(response.filteredCount);

            toast.showSuccess("Logs refreshed");
            return { success: true, data: response };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to load logs";
            console.error(errorMessage, error);
            setError(errorMessage);
            toast.showError(errorMessage);

            // Return empty data on error
            setLogs([]);
            setTotalCount(0);
            setFilteredCount(0);

            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [filters, page, limit, toast]);

    // Load logs when filters, page, or limit changes
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await logsService.getLogs({
                    ...filters,
                    page: page - 1, // Backend uses 0-based pagination
                    limit
                });

                setLogs(response.items);
                setTotalCount(response.totalCount);
                setFilteredCount(response.filteredCount);
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || "Failed to load logs";
                console.error(errorMessage, error);
                setError(errorMessage);

                // Only show error toast on initial load or explicit refresh
                if (logs.length === 0) {
                    toast.showError(errorMessage);
                }

                // Return empty data on error
                setLogs([]);
                setTotalCount(0);
                setFilteredCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [filters, page, limit]); // Remove toast and logs.length from dependencies

    // Load services on mount
    useEffect(() => {
        loadServices();
    }, [loadServices]);

    // Auto-refresh functionality (only if explicitly enabled)
    useEffect(() => {
        if (options?.autoRefresh && options?.refreshInterval) {
            const interval = setInterval(() => {
                loadLogs();
            }, options.refreshInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [options?.autoRefresh, options?.refreshInterval]); // Remove loadLogs from dependencies to prevent loops

    // Get log by ID
    const getLogById = useCallback(async (logId: string) => {
        try {
            const log = await logsService.getLogById(logId);
            return { success: true, data: log };
        } catch (error) {
            const errorMessage = `Failed to load log with ID ${logId}`;
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [toast]);

    // Export logs
    const exportLogs = useCallback(async (format: 'json' | 'csv' = 'json') => {
        try {
            setIsLoading(true);
            const blob = await logsService.exportLogs(filters, format);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logs_${new Date().toISOString()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.showSuccess(`Logs exported successfully as ${format.toUpperCase()}`);
            return { success: true };
        } catch (error) {
            const errorMessage = "Failed to export logs";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [filters, toast]);

    // Clear logs
    const clearLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            await logsService.clearLogs(filters);

            // Clear local state after successful deletion
            setLogs([]);
            setTotalCount(0);
            setFilteredCount(0);

            toast.showSuccess("Logs cleared successfully");
            return { success: true };
        } catch (error) {
            const errorMessage = "Failed to clear logs";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [filters, toast]);

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page when filters change
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
    }, []);

    // Search logs
    const searchLogs = useCallback((query: string) => {
        updateFilters({ search: query || undefined });
    }, [updateFilters]);

    // Filter by level
    const filterByLevel = useCallback((level?: LogLevel) => {
        updateFilters({ level });
    }, [updateFilters]);

    // Filter by service
    const filterByService = useCallback((service?: string) => {
        updateFilters({ service: service === 'all' ? undefined : service });
    }, [updateFilters]);

    // Filter by date range
    const filterByDateRange = useCallback((startDate?: string, endDate?: string) => {
        updateFilters({ startDate, endDate });
    }, [updateFilters]);

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

    // Count logs by level
    const logStats = useCallback(() => {
        return {
            total: totalCount,
            info: logs.filter(l => l.level === "info").length,
            warning: logs.filter(l => l.level === "warning").length,
            error: logs.filter(l => l.level === "error").length,
            debug: logs.filter(l => l.level === "debug").length,
            trace: logs.filter(l => l.level === "trace").length,
            fatal: logs.filter(l => l.level === "fatal").length,
        };
    }, [logs, totalCount]);

    return {
        // State
        logs,
        totalCount,
        filteredCount,
        isLoading,
        error,
        services,

        // Pagination
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,

        // Filters
        filters,

        // Methods
        loadLogs,
        getLogById,
        exportLogs,
        clearLogs,

        // Filter methods
        updateFilters,
        clearFilters,
        searchLogs,
        filterByLevel,
        filterByService,
        filterByDateRange,

        // Pagination methods
        goToPage,
        nextPage,
        prevPage,
        changeLimit,

        // Stats
        logStats: logStats()
    };
};