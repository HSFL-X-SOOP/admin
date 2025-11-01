import { useState, useCallback, useMemo } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Tooltip } from "@heroui/tooltip";
import { Pagination } from "@heroui/pagination";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SearchIcon } from "@/components/icons";
import { AuthorityRole } from "@/api/models/auth";

interface UserData {
    id: number;
    name: string;
    email: string;
    role: AuthorityRole;
    status: "active" | "inactive" | "pending";
    avatar?: string;
    joinDate: string;
    lastLogin: string;
}

const mockUsers: UserData[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@marlin-live.com",
        role: AuthorityRole.ADMIN,
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=john",
        joinDate: "2024-01-15",
        lastLogin: "2024-12-20 14:30"
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@marlin-live.com",
        role: AuthorityRole.HARBOURMASTER,
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=jane",
        joinDate: "2024-02-20",
        lastLogin: "2024-12-19 09:15"
    },
    {
        id: 3,
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        role: AuthorityRole.USER,
        status: "inactive",
        avatar: "https://i.pravatar.cc/150?u=bob",
        joinDate: "2024-03-10",
        lastLogin: "2024-11-05 16:45"
    },
    {
        id: 4,
        name: "Alice Brown",
        email: "alice.brown@marlin-live.com",
        role: AuthorityRole.ADMIN,
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=alice",
        joinDate: "2024-01-05",
        lastLogin: "2024-12-20 10:20"
    },
    {
        id: 5,
        name: "Charlie Wilson",
        email: "charlie.wilson@example.com",
        role: AuthorityRole.USER,
        status: "pending",
        avatar: "https://i.pravatar.cc/150?u=charlie",
        joinDate: "2024-06-12",
        lastLogin: "2024-12-18 13:00"
    },
    {
        id: 6,
        name: "Emma Davis",
        email: "emma.davis@marlin-live.com",
        role: AuthorityRole.HARBOURMASTER,
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=emma",
        joinDate: "2024-04-08",
        lastLogin: "2024-12-20 11:45"
    },
    {
        id: 7,
        name: "Frank Miller",
        email: "frank.miller@example.com",
        role: AuthorityRole.USER,
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=frank",
        joinDate: "2024-05-22",
        lastLogin: "2024-12-19 15:30"
    },
    {
        id: 8,
        name: "Grace Lee",
        email: "grace.lee@marlin-live.com",
        role: AuthorityRole.ADMIN,
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=grace",
        joinDate: "2024-02-14",
        lastLogin: "2024-12-20 08:00"
    }
];

export default function UsersPage() {
    const [filterValue, setFilterValue] = useState("");
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredUsers = useMemo(() => {
        let filtered = [...mockUsers];

        if (filterValue) {
            filtered = filtered.filter((user) => {
                const searchLower = filterValue.toLowerCase();
                return (
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
                );
            });
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((user) => user.status === statusFilter);
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        return filtered;
    }, [filterValue, statusFilter, roleFilter]);

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredUsers.slice(start, end);
    }, [filteredUsers, page, rowsPerPage]);

    const pages = Math.ceil(filteredUsers.length / rowsPerPage);

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

    const renderCell = useCallback((user: UserData, columnKey: React.Key) => {
        switch (columnKey) {
            case "user":
                return (
                    <User
                        avatarProps={{ radius: "full", size: "sm", src: user.avatar }}
                        classNames={{
                            description: "text-default-400"
                        }}
                        description={user.email}
                        name={user.name}
                    />
                );
            case "role":
                const roleColor = {
                    [AuthorityRole.ADMIN]: "danger",
                    [AuthorityRole.HARBOURMASTER]: "warning",
                    [AuthorityRole.USER]: "primary"
                } as const;

                return (
                    <Chip
                        className="capitalize"
                        color={roleColor[user.role]}
                        size="sm"
                        variant="flat"
                    >
                        {user.role}
                    </Chip>
                );
            case "status":
                const statusColorMap = {
                    active: "success",
                    inactive: "danger",
                    pending: "warning"
                } as const;

                return (
                    <Chip
                        className="capitalize"
                        color={statusColorMap[user.status]}
                        size="sm"
                        variant="dot"
                    >
                        {user.status}
                    </Chip>
                );
            case "joinDate":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{user.joinDate}</p>
                    </div>
                );
            case "lastLogin":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{user.lastLogin}</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
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
                        <Tooltip color="danger" content="Delete User">
                            <Button size="sm" variant="light" color="danger" isIconOnly>
                                🗑️
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
                        placeholder="Search by name or email..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <select
                            className="px-3 py-2 rounded-lg border border-default-200 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            className="px-3 py-2 rounded-lg border border-default-200 text-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value={AuthorityRole.ADMIN}>Admin</option>
                            <option value={AuthorityRole.HARBOURMASTER}>Harbourmaster</option>
                            <option value={AuthorityRole.USER}>User</option>
                        </select>
                        <Button color="primary" size="md">
                            Add User
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">
                        Total {filteredUsers.length} users
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
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onClear, filteredUsers.length, rowsPerPage, statusFilter, roleFilter]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys.size === 0
                        ? ""
                        : `${selectedKeys.size} of ${filteredUsers.length} selected`}
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
    }, [page, pages, selectedKeys.size, filteredUsers.length]);

    const columns = [
        { key: "user", label: "USER" },
        { key: "role", label: "ROLE" },
        { key: "status", label: "STATUS" },
        { key: "joinDate", label: "JOIN DATE" },
        { key: "lastLogin", label: "LAST LOGIN" },
        { key: "actions", label: "ACTIONS" }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">User Management</h1>
                <p className="text-default-500">
                    Manage system users and their permissions
                </p>
            </div>

            <Table
                aria-label="Users table"
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[600px]",
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
                    emptyContent={"No users found"}
                    items={paginatedUsers}
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