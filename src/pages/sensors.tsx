import {useState, useCallback, useMemo} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@heroui/table";
import {Chip} from "@heroui/chip";
import {Tooltip} from "@heroui/tooltip";
import {Switch} from "@heroui/switch";
import {Spinner} from "@heroui/spinner";
import {Pagination} from "@heroui/pagination";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/modal";
import {SearchIcon} from "@/components/icons";
import {PotentialSensorDTO} from "@/api/models/sensors";
import {useSensors} from "@/hooks/useSensors";

export default function SensorsPage() {
    const {
        sensors,
        isLoading,
        activeCount,
        inactiveCount,
        totalCount,
        toggleSensorStatus,
        searchSensors
    } = useSensors();

    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedSensor, setSelectedSensor] = useState<PotentialSensorDTO | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();

    const handleToggleRequest = useCallback((sensor: PotentialSensorDTO) => {
        setSelectedSensor(sensor);
        onOpen();
    }, [onOpen]);

    const handleConfirmToggle = useCallback(async () => {
        if (!selectedSensor?.id) return;

        setIsConfirming(true);
        const result = await toggleSensorStatus(selectedSensor.id);

        if (result.success) {
            onClose();
        }

        setIsConfirming(false);
        setSelectedSensor(null);
    }, [selectedSensor, toggleSensorStatus, onClose]);

    const filteredSensors = useMemo(() => {
        if (!filterValue) return sensors;
        return searchSensors(filterValue);
    }, [sensors, filterValue, searchSensors]);

    const paginatedSensors = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredSensors.slice(start, end);
    }, [filteredSensors, page, rowsPerPage]);

    const pages = Math.ceil(filteredSensors.length / rowsPerPage);

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

    const renderCell = useCallback((sensor: PotentialSensorDTO, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{sensor.name || "Unknown"}</p>
                        <p className="text-bold text-sm capitalize text-default-700">
                            ID: {sensor.id || "N/A"}
                        </p>
                    </div>
                );
            case "description":
                return (
                    <div className="flex flex-col">
                        <p className="text-sm text-default-800">
                            {sensor.description || "No description available"}
                        </p>
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize"
                        color={sensor.isActive ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {sensor.isActive ? "Active" : "Inactive"}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content={sensor.isActive ? "Deactivate sensor" : "Activate sensor"}>
                            <Switch
                                size="sm"
                                isSelected={sensor.isActive || false}
                                onValueChange={() => handleToggleRequest(sensor)}
                            />
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    }, [handleToggleRequest]);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by name or description..."
                        startContent={<SearchIcon/>}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Chip color="primary" variant="flat">
                            Total: {totalCount}
                        </Chip>
                        <Chip color="success" variant="flat">
                            Active: {activeCount}
                        </Chip>
                        <Chip color="danger" variant="flat">
                            Inactive: {inactiveCount}
                        </Chip>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-800 text-small">
                        Total {filteredSensors.length} sensors
                    </span>
                    <label className="flex items-center text-default-800 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-800 text-small ml-2"
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                            value={rowsPerPage}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onClear, totalCount, activeCount, inactiveCount, filteredSensors.length, rowsPerPage]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-800">
                    {filteredSensors.length > 0
                        ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filteredSensors.length)} of ${filteredSensors.length}`
                        : "0 sensors"
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
                        color={"default"}
                        variant="flat"
                        className={"text-default-800 text-bold"}
                        onPress={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        isDisabled={page === pages || pages === 0}
                        size="sm"
                        color={"primary"}
                        variant="flat"
                        className={"text-default-800 text-bold"}
                        onPress={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [page, pages, filteredSensors.length, rowsPerPage]);

    const columns = [
        {key: "name", label: "SENSOR NAME"},
        {key: "description", label: "DESCRIPTION"},
        {key: "status", label: "STATUS"},
        {key: "actions", label: "ACTIONS"},
    ];

    return (
        <div className="mx-24 px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Potential Sensors Management</h1>
                <p className="text-default-800">
                    Manage and monitor all potential sensors in the system
                </p>
            </div>

            <Table
                aria-label="Potential sensors table"
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
                    emptyContent={isLoading ? " " : "No sensors found"}
                    items={paginatedSensors}
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading sensors..."/>}
                >
                    {(item) => (
                        <TableRow key={item.id || Math.random()}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="center"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-black/50",
                    base: "border border-default-200 dark:border-default-100 bg-white dark:bg-slate-900"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Confirm Sensor Status Change
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to {selectedSensor?.isActive ? 'deactivate' : 'activate'} the
                                    sensor{' '}
                                    <strong>{selectedSensor?.name || 'Unknown'}</strong>?
                                </p>
                                {selectedSensor?.isActive ? (
                                    <p className="text-warning text-sm mt-2">
                                        Deactivating this sensor will stop all measurements and data collection.
                                    </p>
                                ) : (
                                    <p className="text-success text-sm mt-2">
                                        Activating this sensor will resume measurements and data collection.
                                    </p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="default"
                                    variant="light"
                                    onPress={onClose}
                                    isDisabled={isConfirming}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color={selectedSensor?.isActive ? "danger" : "success"}
                                    onPress={handleConfirmToggle}
                                    isLoading={isConfirming}
                                >
                                    {selectedSensor?.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}