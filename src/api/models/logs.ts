// Log related types

export type LogLevel = "info" | "warning" | "error" | "debug" | "trace" | "fatal";

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    service: string;
    message: string;
    details?: string | Record<string, any>;
    user?: string;
    correlationId?: string;
    stackTrace?: string;
    metadata?: Record<string, any>;
}

export interface LogsResponse {
    items: LogEntry[];
    totalCount: number;
    filteredCount: number;
}

export interface LogFilters {
    page?: number;
    limit?: number;
    level?: LogLevel;
    service?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    user?: string;
    correlationId?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}