import apiClient from '../client';
import { LogEntry, LogsResponse, LogFilters } from '../models/logs';
import { mockLogsService } from './logs.mock';

// Use mock data for logs
const USE_MOCK = true;

class LogsService {
    /**
     * Get all logs with pagination and filters
     */
    async getLogs(filters?: LogFilters): Promise<LogsResponse> {
        if (USE_MOCK) {
            return mockLogsService.getLogs(filters);
        }

        const params = new URLSearchParams();

        if (filters) {
            // Pagination parameters
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

            // Filter parameters
            if (filters.level) params.append('level', filters.level);
            if (filters.service) params.append('service', filters.service);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.search) params.append('search', filters.search);
            if (filters.user) params.append('user', filters.user);
            if (filters.correlationId) params.append('correlationId', filters.correlationId);

            // Sorting parameters
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
        }

        const response = await apiClient.get<LogsResponse>(`/admin/logs?${params.toString()}`);
        return response.data;
    }

    /**
     * Get a specific log entry by ID
     */
    async getLogById(logId: string): Promise<LogEntry> {
        if (USE_MOCK) {
            return mockLogsService.getLogById(logId);
        }

        const response = await apiClient.get<LogEntry>(`/admin/logs/${logId}`);
        return response.data;
    }

    /**
     * Export logs to a file
     */
    async exportLogs(filters?: LogFilters, format: 'json' | 'csv' = 'json'): Promise<Blob> {
        if (USE_MOCK) {
            return mockLogsService.exportLogs(filters, format);
        }

        const params = new URLSearchParams();

        if (filters) {
            if (filters.level) params.append('level', filters.level);
            if (filters.service) params.append('service', filters.service);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.search) params.append('search', filters.search);
        }

        params.append('format', format);

        const response = await apiClient.get(`/admin/logs/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get available log services
     */
    async getServices(): Promise<string[]> {
        if (USE_MOCK) {
            return mockLogsService.getServices();
        }

        const response = await apiClient.get<string[]>('/admin/logs/services');
        return response.data;
    }

    /**
     * Clear logs (admin only)
     */
    async clearLogs(filters?: LogFilters): Promise<void> {
        if (USE_MOCK) {
            return mockLogsService.clearLogs(filters);
        }

        const params = new URLSearchParams();

        if (filters) {
            if (filters.level) params.append('level', filters.level);
            if (filters.service) params.append('service', filters.service);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
        }

        await apiClient.delete(`/admin/logs?${params.toString()}`);
    }
}

export default new LogsService();