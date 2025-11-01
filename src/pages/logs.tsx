import { useState, useMemo, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { SearchIcon } from "@/components/icons";
import { Pagination } from "@heroui/pagination";

interface LogEntry {
    id: string;
    timestamp: string;
    level: "info" | "warning" | "error" | "debug";
    service: string;
    message: string;
    details?: string;
}

const mockLogs: Record<string, LogEntry[]> = {
    backend: [
        {
            id: "be-001",
            timestamp: "2024-12-20 14:30:45",
            level: "info",
            service: "API Gateway",
            message: "Successfully processed 150 requests in the last minute",
            details: "Average response time: 45ms"
        },
        {
            id: "be-002",
            timestamp: "2024-12-20 14:28:12",
            level: "warning",
            service: "Authentication Service",
            message: "Multiple failed login attempts detected",
            details: "IP: 192.168.1.105 - 5 failed attempts"
        },
        {
            id: "be-003",
            timestamp: "2024-12-20 14:25:30",
            level: "error",
            service: "Database Connection",
            message: "Connection timeout to replica database",
            details: "Replica DB-02 failed to respond within 30s timeout"
        },
        {
            id: "be-004",
            timestamp: "2024-12-20 14:20:15",
            level: "info",
            service: "Scheduler",
            message: "Daily backup job completed successfully",
            details: "Backed up 2.3GB of data to S3"
        },
        {
            id: "be-005",
            timestamp: "2024-12-20 14:15:00",
            level: "debug",
            service: "Cache Service",
            message: "Cache hit ratio: 87%",
            details: "Redis memory usage: 1.2GB/4GB"
        }
    ],
    frontend: [
        {
            id: "fe-001",
            timestamp: "2024-12-20 14:32:10",
            level: "error",
            service: "React Application",
            message: "Uncaught TypeError in SensorComponent",
            details: "Cannot read property 'id' of undefined at line 45"
        },
        {
            id: "fe-002",
            timestamp: "2024-12-20 14:30:00",
            level: "warning",
            service: "Performance Monitor",
            message: "Slow render detected",
            details: "Dashboard component took 850ms to render"
        },
        {
            id: "fe-003",
            timestamp: "2024-12-20 14:28:45",
            level: "info",
            service: "Service Worker",
            message: "New version available, updating cache",
            details: "Version 2.3.1 cached successfully"
        },
        {
            id: "fe-004",
            timestamp: "2024-12-20 14:25:00",
            level: "info",
            service: "Analytics",
            message: "Page view tracked",
            details: "User navigated to /sensors page"
        },
        {
            id: "fe-005",
            timestamp: "2024-12-20 14:20:30",
            level: "debug",
            service: "WebSocket",
            message: "Connection established to real-time service",
            details: "Connected to ws://api.marlin-live.com/realtime"
        }
    ],
    forstserver: [
        {
            id: "fs-001",
            timestamp: "2024-12-20 14:31:00",
            level: "info",
            service: "Forest Data Processor",
            message: "Processed 500 sensor readings",
            details: "Temperature and humidity data from 50 forest sensors"
        },
        {
            id: "fs-002",
            timestamp: "2024-12-20 14:29:30",
            level: "warning",
            service: "Sensor Network",
            message: "Sensor FL_024 not responding",
            details: "Last communication: 2024-12-20 13:45:00"
        },
        {
            id: "fs-003",
            timestamp: "2024-12-20 14:27:15",
            level: "info",
            service: "Data Aggregation",
            message: "Daily forest report generated",
            details: "Report includes data from 48/50 active sensors"
        },
        {
            id: "fs-004",
            timestamp: "2024-12-20 14:25:00",
            level: "error",
            service: "Weather API",
            message: "Failed to fetch weather forecast",
            details: "External API returned 503 Service Unavailable"
        },
        {
            id: "fs-005",
            timestamp: "2024-12-20 14:20:00",
            level: "info",
            service: "Alert System",
            message: "Fire risk assessment completed",
            details: "Current fire risk level: LOW"
        }
    ],
    datenbanken: [
        {
            id: "db-001",
            timestamp: "2024-12-20 14:33:00",
            level: "info",
            service: "PostgreSQL Primary",
            message: "Vacuum completed on sensors table",
            details: "Freed 120MB of disk space"
        },
        {
            id: "db-002",
            timestamp: "2024-12-20 14:30:45",
            level: "warning",
            service: "PostgreSQL Replica",
            message: "Replication lag detected",
            details: "Current lag: 5.2 seconds"
        },
        {
            id: "db-003",
            timestamp: "2024-12-20 14:28:00",
            level: "info",
            service: "MongoDB",
            message: "Index created on logs collection",
            details: "Compound index on timestamp and service fields"
        },
        {
            id: "db-004",
            timestamp: "2024-12-20 14:25:30",
            level: "error",
            service: "Redis",
            message: "Memory threshold exceeded",
            details: "Using 3.8GB of 4GB available memory"
        },
        {
            id: "db-005",
            timestamp: "2024-12-20 14:22:00",
            level: "info",
            service: "Backup Service",
            message: "Incremental backup completed",
            details: "Backed up 450MB of changed data"
        }
    ]
};

export default function LogsPage() {
    const [selectedTab, setSelectedTab] = useState<string>("backend");
    const [filterValue, setFilterValue] = useState("");
    const [levelFilter, setLevelFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredLogs = useMemo(() => {
        let logs = mockLogs[selectedTab] || [];

        if (filterValue) {
            const searchLower = filterValue.toLowerCase();
            logs = logs.filter((log) =>
                log.message.toLowerCase().includes(searchLower) ||
                log.service.toLowerCase().includes(searchLower) ||
                (log.details && log.details.toLowerCase().includes(searchLower))
            );
        }

        if (levelFilter !== "all") {
            logs = logs.filter((log) => log.level === levelFilter);
        }

        return logs;
    }, [selectedTab, filterValue, levelFilter]);

    const paginatedLogs = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredLogs.slice(start, end);
    }, [filteredLogs, page, rowsPerPage]);

    const pages = Math.ceil(filteredLogs.length / rowsPerPage);

    const onSearchChange = useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    const getLevelColor = (level: string) => {
        switch (level) {
            case "error":
                return "danger";
            case "warning":
                return "warning";
            case "info":
                return "primary";
            case "debug":
                return "default";
            default:
                return "default";
        }
    };

    const getSystemStats = (system: string) => {
        const logs = mockLogs[system] || [];
        return {
            total: logs.length,
            errors: logs.filter(l => l.level === "error").length,
            warnings: logs.filter(l => l.level === "warning").length
        };
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search logs..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Select
                            size="sm"
                            label="Log Level"
                            className="w-36"
                            selectedKeys={[levelFilter]}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <SelectItem key="all" value="all">All Levels</SelectItem>
                            <SelectItem key="error" value="error">Error</SelectItem>
                            <SelectItem key="warning" value="warning">Warning</SelectItem>
                            <SelectItem key="info" value="info">Info</SelectItem>
                            <SelectItem key="debug" value="debug">Debug</SelectItem>
                        </Select>
                        <Button color="primary" size="md">
                            Export Logs
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">
                        Total {filteredLogs.length} log entries
                    </span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small ml-2"
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                            value={rowsPerPage}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onClear, filteredLogs.length, rowsPerPage, levelFilter]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {filteredLogs.length > 0
                        ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filteredLogs.length)} of ${filteredLogs.length}`
                        : "0 logs"
                    }
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages || 1}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={page === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={page === pages || pages === 0}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [page, pages, filteredLogs.length, rowsPerPage]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">System Logs</h1>
                <p className="text-default-800">
                    Monitor and analyze logs from all system components
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.keys(mockLogs).map((system) => {
                    const stats = getSystemStats(system);
                    return (
                        <Card
                            key={system}
                            isPressable
                            onPress={() => setSelectedTab(system)}
                            className={`border ${selectedTab === system ? 'border-primary shadow-md' : 'border-default-200 dark:border-default-100'} hover:shadow-md transition-shadow bg-white dark:bg-default-900`}
                        >
                            <CardBody className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold capitalize text-default-800">{system}</h3>
                                    <Chip size="sm" variant="flat">
                                        {stats.total}
                                    </Chip>
                                </div>
                                <div className="flex gap-2">
                                    {stats.errors > 0 && (
                                        <Chip size="sm" color="danger" variant="dot">
                                            {stats.errors} errors
                                        </Chip>
                                    )}
                                    {stats.warnings > 0 && (
                                        <Chip size="sm" color="warning" variant="dot">
                                            {stats.warnings} warnings
                                        </Chip>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            <Card className="border border-default-200 dark:border-default-100 shadow-sm bg-white dark:bg-slate-900">
                <CardBody className="p-0">
                    <Tabs
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        aria-label="System logs"
                        className="px-6 pt-4"
                    >
                        <Tab key="backend" title="Backend" />
                        <Tab key="frontend" title="Frontend" />
                        <Tab key="forstserver" title="Forstserver" />
                        <Tab key="datenbanken" title="Datenbanken" />
                    </Tabs>

                    <div className="px-6 py-4">
                        {topContent}
                    </div>

                    <div className="px-6 pb-4">
                        <div className="space-y-2">
                            {paginatedLogs.map((log) => (
                                <Card key={log.id} className="border border-default-200 dark:border-default-100 hover:shadow-sm transition-shadow bg-white dark:bg-default-900">
                                    <CardBody className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <Chip
                                                    size="sm"
                                                    color={getLevelColor(log.level)}
                                                    variant="flat"
                                                    className="uppercase"
                                                >
                                                    {log.level}
                                                </Chip>
                                                <span className="text-sm font-medium">{log.service}</span>
                                            </div>
                                            <span className="text-xs text-default-400">{log.timestamp}</span>
                                        </div>
                                        <p className="text-sm mb-1">{log.message}</p>
                                        {log.details && (
                                            <p className="text-xs text-default-400">{log.details}</p>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        {paginatedLogs.length === 0 && (
                            <div className="text-center py-8 text-default-400">
                                No logs found
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-4 border-t border-default-200">
                        {bottomContent}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}