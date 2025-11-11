import {useState, useMemo, useCallback} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@heroui/table";
import {Card, CardBody} from "@heroui/card";
import {Input} from "@heroui/input";
import {Chip} from "@heroui/chip";
import {Button} from "@heroui/button";
import {Spinner} from "@heroui/spinner";
import {SearchIcon} from "@/components/icons";
import {Pagination} from "@heroui/pagination";
import {Tooltip} from "@heroui/tooltip";
import {formatGermanDate} from "@/utils/dateFormatter";
import {useLogs} from "@/hooks/useLogs";
import {LogEntry, LogLevel} from "@/api/models/logs";

export default function LogsPage() {
    const [searchValue, setSearchValue] = useState("");
    const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
    const [serviceFilter, setServiceFilter] = useState<string>("all");

    // Use the custom hook with initial filters
    const {
        logs,
        totalCount,
        filteredCount,
        isLoading,
        error,
        services,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        logStats,
        searchLogs,
        filterByLevel,
        filterByService,
        goToPage,
        nextPage,
        prevPage,
        changeLimit,
        exportLogs,
        loadLogs
    } = useLogs({
        initialPage: 1,
        initialLimit: 10,
        autoRefresh: false, // Set to true if you want auto-refresh
        refreshInterval: 30 // Refresh every 30 seconds
    });

    // Handle search
    const onSearchChange = useCallback((value?: string) => {
        setSearchValue(value || "");
        searchLogs(value || "");
    }, [searchLogs]);

    const onClear = useCallback(() => {
        setSearchValue("");
        searchLogs("");
    }, [searchLogs]);

    // Handle level filter change
    const handleLevelFilterChange = useCallback((value: string) => {
        setLevelFilter(value as LogLevel | "all");
        filterByLevel(value === "all" ? undefined : value as LogLevel);
    }, [filterByLevel]);

    // Handle service filter change
    const handleServiceFilterChange = useCallback((value: string) => {
        setServiceFilter(value);
        filterByService(value);
    }, [filterByService]);

    // Handle export
    const handleExport = useCallback(async () => {
        await exportLogs('json');
    }, [exportLogs]);

    const renderCell = useCallback((log: LogEntry, columnKey: React.Key) => {
        switch (columnKey) {
            case "timestamp":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-default-800">
                            {formatGermanDate(log.timestamp)}
                        </p>
                    </div>
                );
            case "level":
                const levelColor = {
                    info: "primary",
                    warning: "warning",
                    error: "danger",
                    debug: "default",
                    trace: "secondary",
                    fatal: "danger"
                } as const;

                return (
                    <Chip
                        className="capitalize"
                        color={levelColor[log.level] || "default"}
                        size="sm"
                        variant="flat"
                    >
                        {log.level}
                    </Chip>
                );
            case "service":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-default-800">
                            {log.service}
                        </p>
                    </div>
                );
            case "message":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-default-800">{log.message}</p>
                        {log.user && (
                            <p className="text-bold text-sm text-default-700 mt-1">User: {log.user}</p>
                        )}
                        {log.details && (
                            <p className="text-sm text-default-700 mt-1">
                                {typeof log.details === 'string'
                                    ? log.details
                                    : JSON.stringify(log.details, null, 2).substring(0, 100) + '...'}
                            </p>
                        )}
                    </div>
                );
            case "actions":
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Tooltip content="View Details">
                            <Button size="sm" variant="light" isIconOnly>
                                👁️
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search logs..."
                        startContent={<SearchIcon/>}
                        value={searchValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <select
                            className="px-3 py-2 rounded-lg border border-default-200 text-sm"
                            value={levelFilter}
                            onChange={(e) => handleLevelFilterChange(e.target.value)}
                        >
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="debug">Debug</option>
                            <option value="trace">Trace</option>
                            <option value="fatal">Fatal</option>
                        </select>
                        <select
                            className="px-3 py-2 rounded-lg border border-default-200 text-sm"
                            value={serviceFilter}
                            onChange={(e) => handleServiceFilterChange(e.target.value)}
                        >
                            <option value="all">All Services</option>
                            {services.map(service => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                        <Button
                            color="secondary"
                            size="md"
                            onPress={() => loadLogs()}
                        >
                            🔄 Refresh
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            onPress={handleExport}
                        >
                            📥 Export
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-800 text-small">
                        Total {filteredCount} log entries (of {totalCount} total)
                    </span>
                    <label className="flex items-center text-default-800 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-800 text-small ml-2"
                            onChange={(e) => changeLimit(Number(e.target.value))}
                            value={limit}
                        >
                            <option className="text-black" value="5">5</option>
                            <option className="text-black" value="10">10</option>
                            <option className="text-black" value="15">15</option>
                            <option className="text-black" value="25">25</option>
                            <option className="text-black" value="50">50</option>
                            <option className="text-black" value="100">100</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [searchValue, onSearchChange, onClear, filteredCount, totalCount, limit, changeLimit, levelFilter, serviceFilter, services, handleExport, loadLogs, handleLevelFilterChange, handleServiceFilterChange]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-800">
                    {filteredCount > 0
                        ? `${(page - 1) * limit + 1}-${Math.min(page * limit, filteredCount)} of ${filteredCount}`
                        : "0 logs"
                    }
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPages || 1}
                    onChange={goToPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={!hasPrevPage}
                        size="sm"
                        color={"default"}
                        variant="flat"
                        className={"text-default-800 text-bold"}
                        onPress={prevPage}
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={!hasNextPage}
                        size="sm"
                        color={"primary"}
                        variant="flat"
                        className={"text-default-800 text-bold"}
                        onPress={nextPage}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [page, totalPages, filteredCount, limit, goToPage, hasPrevPage, hasNextPage, prevPage, nextPage]);

    const columns = [
        {key: "timestamp", label: "TIMESTAMP"},
        {key: "level", label: "LEVEL"},
        {key: "service", label: "SERVICE"},
        {key: "message", label: "MESSAGE"},
        {key: "actions", label: "ACTIONS"}
    ];

    return (
        <div className="mx-24 px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">System Logs</h1>
                <p className="text-default-800">
                    Monitor and analyze system logs from all services
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                <Card className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200">
                    <CardBody className="p-5">
                        <p className="text-sm text-default-800 font-medium mb-2">Total</p>
                        <p className="text-2xl font-bold text-default-800">{logStats.total}</p>
                    </CardBody>
                </Card>
                <Card className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200">
                    <CardBody className="p-5">
                        <p className="text-sm text-default-800 font-medium mb-2">Info</p>
                        <p className="text-2xl font-bold text-blue-600">{logStats.info}</p>
                    </CardBody>
                </Card>
                <Card className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200">
                    <CardBody className="p-5">
                        <p className="text-sm text-default-800 font-medium mb-2">Warning</p>
                        <p className="text-2xl font-bold text-amber-600">{logStats.warning}</p>
                    </CardBody>
                </Card>
                <Card className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200">
                    <CardBody className="p-5">
                        <p className="text-sm text-default-800 font-medium mb-2">Error</p>
                        <p className="text-2xl font-bold text-red-600">{logStats.error}</p>
                    </CardBody>
                </Card>
                <Card className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200">
                    <CardBody className="p-5">
                        <p className="text-sm text-default-800 font-medium mb-2">Debug</p>
                        <p className="text-2xl font-bold text-gray-600">{logStats.debug}</p>
                    </CardBody>
                </Card>
                <Card className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200">
                    <CardBody className="p-5">
                        <p className="text-sm text-default-800 font-medium mb-2">Fatal</p>
                        <p className="text-2xl font-bold text-purple-600">{logStats.fatal}</p>
                    </CardBody>
                </Card>
            </div>

            {/* Error Message */}
            {error && !isLoading && (
                <Card className="mb-6 border border-danger-200 bg-danger-50">
                    <CardBody>
                        <p className="text-danger-600">⚠️ {error}</p>
                        <p className="text-sm text-default-600 mt-2">
                            The logs API endpoint may not be available yet. Please check the backend implementation.
                        </p>
                    </CardBody>
                </Card>
            )}

            {/* Logs Table */}
            <Table
                aria-label="System logs table"
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[800px] border border-default-200 dark:border-default-100 shadow-sm bg-default-200",
                }}
                topContent={topContent}
                topContentPlacement="outside"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            align={column.key === "actions" ? "center" : "start"}
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={isLoading ? " " : error ? "Failed to load logs" : "No logs found"}
                    items={logs}
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading logs..."/>}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}