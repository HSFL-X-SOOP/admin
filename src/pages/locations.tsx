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
import {LocationDTO} from "@/api/models/locations";
import {useLocations} from "@/hooks/useLocations";

export default function LocationsPage() {
    const {
        locations,
        isLoading,
        totalCount,
        locationsWithCoordinates,
        searchLocations,
        hasValidCoordinates,
    } = useLocations();

    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const handleViewDetails = useCallback((location: LocationDTO) => {
        setSelectedLocation(location);
        onOpen();
    }, [onOpen]);

    const filteredLocations = useMemo(() => {
        if (!filterValue) return locations;
        return searchLocations(filterValue);
    }, [locations, filterValue, searchLocations]);

    const paginatedLocations = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredLocations.slice(start, end);
    }, [filteredLocations, page, rowsPerPage]);

    const pages = Math.ceil(filteredLocations.length / rowsPerPage);

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

    const renderCell = useCallback((location: LocationDTO, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{location.name || "Unnamed Location"}</p>
                        <p className="text-bold text-sm capitalize text-default-700">
                            ID: {location.id}
                        </p>
                    </div>
                );
            case "coordinates":
                return (
                    <div className="flex flex-col">
                        {location.coordinates && hasValidCoordinates(location) ? (
                            <>
                                <p className="text-sm text-default-800">
                                    Lat: {location.coordinates.lat.toFixed(6)}
                                </p>
                                <p className="text-sm text-default-800">
                                    Lon: {location.coordinates.lon.toFixed(6)}
                                </p>
                            </>
                        ) : location.coordinates && location.coordinates.lat === 0 && location.coordinates.lon === 0 ? (
                            <p className="text-sm text-default-500">Invalid (0, 0)</p>
                        ) : (
                            <p className="text-sm text-default-500">No coordinates</p>
                        )}
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize"
                        color={hasValidCoordinates(location) ? "success" : "warning"}
                        size="sm"
                        variant="flat"
                    >
                        {hasValidCoordinates(location) ? "Mapped" : "Unmapped"}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => handleViewDetails(location)}
                            >
                                👁️
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Location">
                            <Button size="sm" variant="light" isIconOnly>
                                ✏️
                            </Button>
                        </Tooltip>
                        <Tooltip content="View on Map">
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                isDisabled={!hasValidCoordinates(location)}
                            >
                                📍
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    }, [handleViewDetails]);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by name or ID..."
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
                            Mapped: {locationsWithCoordinates}
                        </Chip>
                        <Chip color="warning" variant="flat">
                            Unmapped: {totalCount - locationsWithCoordinates}
                        </Chip>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-800 text-small">
                        Total {filteredLocations.length} locations
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
                            <option className="text-black" value="5">5</option>
                            <option className="text-black" value="10">10</option>
                            <option className="text-black" value="15">15</option>
                            <option className="text-black" value="20">20</option>
                            <option className="text-black" value="50">50</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onClear, totalCount, locationsWithCoordinates, filteredLocations.length, rowsPerPage]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-800">
                    {filteredLocations.length > 0
                        ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filteredLocations.length)} of ${filteredLocations.length}`
                        : "0 locations"
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
    }, [page, pages, filteredLocations.length, rowsPerPage]);

    const columns = [
        {key: "name", label: "LOCATION NAME"},
        {key: "coordinates", label: "COORDINATES"},
        {key: "status", label: "STATUS"},
        {key: "actions", label: "ACTIONS"},
    ];

    return (
        <div className="mx-24 px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Locations Management</h1>
                <p className="text-default-800">
                    Manage and monitor all measurement locations in the system
                </p>
            </div>

            <Table
                aria-label="Locations table"
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
                    emptyContent={isLoading ? " " : "No locations found"}
                    items={paginatedLocations}
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading locations..."/>}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Detail Modal */}
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
                                Location Details
                            </ModalHeader>
                            <ModalBody>
                                {selectedLocation && (
                                    <div className="space-y-2">
                                        <p><strong>Name:</strong> {selectedLocation.name || "Unnamed Location"}</p>
                                        <p><strong>ID:</strong> {selectedLocation.id}</p>
                                        {selectedLocation.coordinates && hasValidCoordinates(selectedLocation) ? (
                                            <>
                                                <p><strong>Latitude:</strong> {selectedLocation.coordinates.lat}</p>
                                                <p><strong>Longitude:</strong> {selectedLocation.coordinates.lon}</p>
                                            </>
                                        ) : selectedLocation.coordinates && selectedLocation.coordinates.lat === 0 && selectedLocation.coordinates.lon === 0 ? (
                                            <p className="text-warning">Invalid coordinates (0, 0)</p>
                                        ) : (
                                            <p className="text-warning">No coordinates available</p>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="default"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                >
                                    Edit
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}