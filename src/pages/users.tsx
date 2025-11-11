import {useState, useCallback, useMemo, useEffect} from "react";
import type {Selection, Key} from "@react-types/shared";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@heroui/table";
import {Chip} from "@heroui/chip";
import {User} from "@heroui/user";
import {Tooltip} from "@heroui/tooltip";
import {Pagination} from "@heroui/pagination";
import {Input} from "@heroui/input";
import {Button} from "@heroui/button";
import {Card, CardBody} from "@heroui/card";
import {Spinner} from "@heroui/spinner";
import {SearchIcon} from "@/components/icons";
import {formatGermanDate, formatGermanDateOnly} from "@/utils/dateFormatter";
import {useUserProfiles} from "@/hooks/useUserProfiles";
import {UserProfile, UserAuthorityRole} from "@/api/models/userProfiles";

export default function UsersPage() {
    const [filterValue, setFilterValue] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<Key>());
    const [roleFilter, setRoleFilter] = useState<UserAuthorityRole | "all">("all");
    const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");

    // Use the custom hook with initial filters
    const {
        users,
        totalCount,
        filteredCount,
        isLoading,
        error,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        searchUsers,
        updateFilters,
        goToPage,
        nextPage,
        prevPage,
        changeLimit,
        deleteUserProfile,
        blockUser
    } = useUserProfiles({
        initialPage: 1,
        initialLimit: 10,
        initialFilters: {}
    });

    // Handle filter changes
    useEffect(() => {
        const filters: any = {};

        if (roleFilter !== "all") {
            filters.authorityRole = roleFilter;
        }

        if (verifiedFilter !== "all") {
            filters.verified = verifiedFilter === "verified";
        }

        updateFilters(filters);
    }, [roleFilter, verifiedFilter, updateFilters]);

    const onSearchChange = useCallback((value?: string) => {
        setFilterValue(value || "");
        searchUsers(value || "");
    }, [searchUsers]);

    const onClear = useCallback(() => {
        setFilterValue("");
        searchUsers("");
    }, [searchUsers]);

    const renderCell = useCallback((user: UserProfile, columnKey: React.Key) => {
        switch (columnKey) {
            case "user":
                const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
                return (
                    <User
                        avatarProps={{radius: "full", size: "sm", src: `https://i.pravatar.cc/150?u=${user.email}`}}
                        classNames={{
                            description: "text-default-700"
                        }}
                        description={user.email}
                        name={fullName}
                    />
                );
            case "role":
                const roleColor = {
                    [UserAuthorityRole.ADMIN]: "danger",
                    [UserAuthorityRole.HARBOR_MASTER]: "warning",
                    [UserAuthorityRole.USER]: "primary"
                } as const;

                return (
                    <Chip
                        className="capitalize"
                        color={roleColor[user.authorityRole]}
                        size="sm"
                        variant="flat"
                    >
                        {user.authorityRole.replace("_", " ").toLowerCase()}
                    </Chip>
                );
            case "verified":
                return (
                    <Chip
                        className="capitalize"
                        color={user.verified ? "success" : "warning"}
                        size="sm"
                        variant="dot"
                    >
                        {user.verified ? "Verified" : "Unverified"}
                    </Chip>
                );
            case "activityRoles":
                return (
                    <div className="flex gap-1 flex-wrap">
                        {user.activityRoles.map(role => (
                            <Chip
                                key={role}
                                size="sm"
                                variant="flat"
                                color="default"
                            >
                                {role.toLowerCase()}
                            </Chip>
                        ))}
                    </div>
                );
            case "joinDate":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-default-800">{formatGermanDateOnly(user.userCreatedAt)}</p>
                    </div>
                );
            case "profileUpdated":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-default-800">
                            {user.profileUpdatedAt ? formatGermanDate(user.profileUpdatedAt) : "-"}
                        </p>
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
                        <Tooltip content="Edit User">
                            <Button size="sm" variant="light" isIconOnly>
                                ✏️
                            </Button>
                        </Tooltip>
                        <Tooltip content="Block User">
                            <Button
                                size="sm"
                                variant="light"
                                color="warning"
                                isIconOnly
                                onPress={() => blockUser(user.id)}
                            >
                                🚫
                            </Button>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete User">
                            <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                isIconOnly
                                onPress={() => deleteUserProfile(user.id)}
                            >
                                🗑️
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    }, [blockUser, deleteUserProfile]);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by email..."
                        startContent={<SearchIcon/>}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <select
                            className="px-3 py-2 rounded-lg border border-default-200 text-sm"
                            value={verifiedFilter}
                            onChange={(e) => setVerifiedFilter(e.target.value as any)}
                        >
                            <option value="all">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                        <select
                            className="px-3 py-2 rounded-lg border border-default-200 text-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                        >
                            <option value="all">All Roles</option>
                            <option value={UserAuthorityRole.ADMIN}>Admin</option>
                            <option value={UserAuthorityRole.HARBOR_MASTER}>Harbor Master</option>
                            <option value={UserAuthorityRole.USER}>User</option>
                        </select>
                        <Button color="primary" size="md">
                            Add User
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-800 text-small">
                        Total {totalCount} users (showing {filteredCount})
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
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onClear, totalCount, filteredCount, limit, changeLimit, verifiedFilter, roleFilter]);

    const bottomContent = useMemo(() => {
        const selectedCount = selectedKeys === "all" ? filteredCount : selectedKeys.size;
        const selectionMessage = selectedCount === 0 ? "" : `${selectedCount} of ${filteredCount} selected`;

        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-800">{selectionMessage}</span>
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
    }, [page, totalPages, selectedKeys, filteredCount, goToPage, hasPrevPage, hasNextPage, prevPage, nextPage]);

    const columns = [
        {key: "user", label: "USER"},
        {key: "role", label: "AUTHORITY ROLE"},
        {key: "verified", label: "STATUS"},
        {key: "activityRoles", label: "ACTIVITIES"},
        {key: "joinDate", label: "JOIN DATE"},
        {key: "profileUpdated", label: "LAST UPDATED"},
        {key: "actions", label: "ACTIONS"}
    ];

    return (
        <div className="mx-24 px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-default-800">
                    Manage system users and their permissions
                </p>
            </div>

            {/* Error Message */}
            {error && !isLoading && (
                <Card className="mb-6 border border-danger-200 bg-danger-50">
                    <CardBody>
                        <p className="text-danger-600">⚠️ {error}</p>
                        <p className="text-sm text-default-600 mt-2">
                            The user profiles API endpoint may not be available yet. Please check the backend implementation.
                        </p>
                    </CardBody>
                </Card>
            )}

            <Table
                aria-label="Users table"
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[800px] border border-default-200 dark:border-default-100 shadow-sm bg-default-200",
                }}
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
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
                    emptyContent={isLoading ? " " : error ? "Failed to load users" : "No users found"}
                    items={users}
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading users..."/>}
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
