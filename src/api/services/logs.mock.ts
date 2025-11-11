// Mock implementation for Logs when API is not available
import {LogEntry, LogsResponse, LogFilters, LogLevel} from '../models/logs';

// Generate mock logs
const generateMockLogs = (): LogEntry[] => {
    const services = [
        'Authentication', 'Database', 'API Gateway', 'Email Service',
        'Sensor Network', 'Cache Service', 'Scheduler', 'WebSocket',
        'Payment Gateway', 'Analytics', 'Deployment', 'Monitoring',
        'File Storage', 'Queue Service', 'Search Engine'
    ];

    const messages = {
        info: [
            'User login successful',
            'Service started successfully',
            'Configuration loaded',
            'Database connection established',
            'Cache warmed up',
            'Scheduled task executed',
            'Backup completed successfully',
            'Report generated',
            'New user registered',
            'Settings updated',
            'Session created',
            'Data synchronized'
        ],
        warning: [
            'High memory usage detected',
            'Slow query detected',
            'Rate limit approaching',
            'SSL certificate expires soon',
            'Disk space running low',
            'Deprecated API endpoint used',
            'Connection timeout warning',
            'Unusual activity detected',
            'Cache miss ratio high',
            'Retry attempt failed'
        ],
        error: [
            'Failed to connect to database',
            'Authentication failed',
            'Service unavailable',
            'Transaction failed',
            'File not found',
            'Permission denied',
            'Invalid request format',
            'Timeout exceeded',
            'Memory allocation failed',
            'Network error occurred'
        ],
        debug: [
            'Request processed',
            'Cache hit',
            'Query executed',
            'Event triggered',
            'Function called',
            'Variable updated',
            'Loop iteration completed',
            'Condition evaluated',
            'Object created',
            'Resource allocated'
        ],
        trace: [
            'Entering function',
            'Exiting function',
            'Parameter values',
            'State change detected',
            'Event listener triggered',
            'Middleware executed',
            'Hook called',
            'Component rendered',
            'Route matched',
            'Validation passed'
        ],
        fatal: [
            'System crash detected',
            'Critical error - service shutting down',
            'Database corruption detected',
            'Security breach attempt',
            'Out of memory',
            'Stack overflow',
            'Kernel panic',
            'Disk failure',
            'Network interface down',
            'Critical dependency missing'
        ]
    };

    const logs: LogEntry[] = [];
    const now = new Date();
    const levels: LogLevel[] = ['info', 'warning', 'error', 'debug', 'trace', 'fatal'];

    // Generate 200 mock logs with varied timestamps
    for (let i = 0; i < 200; i++) {
        const level = levels[Math.floor(Math.random() * levels.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const messageList = messages[level];
        const message = messageList[Math.floor(Math.random() * messageList.length)];

        // Create timestamp going back in time
        const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000); // 5 minutes apart

        const log: LogEntry = {
            id: `log-${1000 + i}`,
            timestamp: timestamp.toISOString(),
            level,
            service,
            message,
            correlationId: Math.random() > 0.7 ? `corr-${Math.floor(Math.random() * 1000)}` : undefined,
            user: Math.random() > 0.6 ? `user${Math.floor(Math.random() * 100)}@example.com` : undefined,
            details: Math.random() > 0.5 ? {
                duration: `${Math.floor(Math.random() * 1000)}ms`,
                statusCode: Math.floor(Math.random() * 500) + 200,
                endpoint: `/api/${service.toLowerCase()}`,
                method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)]
            } : undefined,
            metadata: Math.random() > 0.8 ? {
                ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                userAgent: 'Mozilla/5.0',
                requestId: `req-${Math.floor(Math.random() * 10000)}`
            } : undefined
        };

        logs.push(log);
    }

    return logs;
};

// Store mock data in memory
let mockLogs = generateMockLogs();
const mockServices = Array.from(new Set(mockLogs.map(l => l.service))).sort();

// Simulate async delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockLogsService = {
    async getLogs(filters?: LogFilters): Promise<LogsResponse> {
        await delay();

        let filtered = [...mockLogs];

        // Apply filters
        if (filters?.level) {
            filtered = filtered.filter(log => log.level === filters.level);
        }

        if (filters?.service && filters.service !== 'all') {
            filtered = filtered.filter(log => log.service === filters.service);
        }

        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchLower) ||
                log.service.toLowerCase().includes(searchLower) ||
                log.user?.toLowerCase().includes(searchLower) ||
                JSON.stringify(log.details).toLowerCase().includes(searchLower)
            );
        }

        if (filters?.startDate) {
            const startDate = new Date(filters.startDate);
            filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
        }

        if (filters?.endDate) {
            const endDate = new Date(filters.endDate);
            filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
        }

        if (filters?.user) {
            filtered = filtered.filter(log => log.user === filters.user);
        }

        if (filters?.correlationId) {
            filtered = filtered.filter(log => log.correlationId === filters.correlationId);
        }

        // Sort
        if (filters?.sortBy) {
            filtered.sort((a, b) => {
                const aValue = (a as any)[filters.sortBy!];
                const bValue = (b as any)[filters.sortBy!];

                if (filters.sortDirection === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });
        } else {
            // Default sort by timestamp desc
            filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        // Pagination
        const page = filters?.page || 0;
        const limit = filters?.limit || 10;
        const start = page * limit;
        const end = start + limit;

        const paginatedItems = filtered.slice(start, end);

        return {
            items: paginatedItems,
            totalCount: mockLogs.length,
            filteredCount: filtered.length
        };
    },

    async getLogById(logId: string): Promise<LogEntry> {
        await delay();
        const log = mockLogs.find(l => l.id === logId);
        if (!log) {
            throw new Error('Log not found');
        }
        return log;
    },

    async exportLogs(filters?: LogFilters, format: 'json' | 'csv' = 'json'): Promise<Blob> {
        await delay();
        const response = await this.getLogs(filters);

        if (format === 'json') {
            const json = JSON.stringify(response.items, null, 2);
            return new Blob([json], {type: 'application/json'});
        } else {
            // CSV format
            const headers = ['Timestamp', 'Level', 'Service', 'Message', 'User', 'Details'];
            const rows = response.items.map(log => [
                log.timestamp,
                log.level,
                log.service,
                log.message,
                log.user || '',
                JSON.stringify(log.details || {})
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            return new Blob([csv], {type: 'text/csv'});
        }
    },

    async getServices(): Promise<string[]> {
        await delay(100);
        return mockServices;
    },

    async clearLogs(filters?: LogFilters): Promise<void> {
        await delay();
        if (filters?.level || filters?.service) {
            // Clear only filtered logs
            mockLogs = mockLogs.filter(log => {
                if (filters.level && log.level === filters.level) return false;
                return !(filters.service && log.service === filters.service);

            });
        } else {
            // Clear all logs
            mockLogs = [];
        }
    },

    // Add new log (for testing)
    async addLog(log: Omit<LogEntry, 'id'>): Promise<LogEntry> {
        await delay();
        const newLog: LogEntry = {
            ...log,
            id: `log-${Date.now()}`
        };
        mockLogs.unshift(newLog);
        return newLog;
    },

    // Regenerate logs
    regenerateLogs() {
        mockLogs = generateMockLogs();
    }
};
