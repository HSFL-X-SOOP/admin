import {useState, useEffect, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";
import {Chip} from "@heroui/chip";
import {Spinner} from "@heroui/spinner";
import {Select, SelectItem} from "@heroui/select";
import {Switch} from "@heroui/switch";
import {Input} from "@heroui/input";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/modal";
import {UserProfile, UserAuthorityRole} from "@/api/models/userProfiles";
import {LocationDTO} from "@/api/models/locations";
import userProfilesService from "@/api/services/userProfiles";
import locationsService from "@/api/services/locations";
import {formatGermanDate, formatGermanDateOnly} from "@/utils/dateFormatter";
import {useToast} from "@/hooks/useToast";

export default function UserDetailPage() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Locations
    const [locations, setLocations] = useState<LocationDTO[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

    // Modal for promoting to harbor master
    const {isOpen: isPromoteOpen, onOpen: onPromoteOpen, onClose: onPromoteClose} = useDisclosure();
    const [selectedRole, setSelectedRole] = useState<UserAuthorityRole>(UserAuthorityRole.USER);

    // Modal for assigning location
    const {isOpen: isLocationOpen, onOpen: onLocationOpen, onClose: onLocationClose} = useDisclosure();

    // Modal for editing user profile
    const {isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose} = useDisclosure();
    const [editedFirstName, setEditedFirstName] = useState("");
    const [editedLastName, setEditedLastName] = useState("");

    // Load user data
    useEffect(() => {
        let isCancelled = false;

        const loadUser = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);
                setError(null);
                const userData = await userProfilesService.getUserProfileById(Number(userId));
                console.log(userData.assignedLocation)

                if (!isCancelled) {
                    setUser(userData);
                    setSelectedRole(userData.authorityRole);
                    setEditedFirstName(userData.firstName || "");
                    setEditedLastName(userData.lastName || "");
                }
            } catch (err: any) {
                if (!isCancelled) {
                    const errorMessage = err.response?.data?.message || "Failed to load user";
                    setError(errorMessage);
                    toast.showError(errorMessage);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            isCancelled = true;
        };
    }, [userId]); // Removed toast from dependencies

    // Load locations
    useEffect(() => {
        const loadLocations = async () => {
            try {
                const locationsList = await locationsService.getLocations();
                setLocations(locationsList);
            } catch (err) {
                console.error("Failed to load locations", err);
            }
        };

        loadLocations();
    }, []);


    // Toggle verification status
    const handleVerificationToggle = useCallback(async () => {
        if (!user) return;

        try {
            setIsUpdating(true);
            await userProfilesService.updateUser({
                userId: user.id,
                authorityRole: user.authorityRole,
                verified: !user.verified
            });

            setUser(prev => prev ? {...prev, verified: !prev.verified} : null);
            toast.showSuccess(`User ${!user.verified ? 'verified' : 'unverified'} successfully`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to update verification status";
            toast.showError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [user, toast]);

    // Promote/Change user role
    const handleRoleChange = useCallback(async () => {
        if (!user) return;

        try {
            setIsUpdating(true);
            await userProfilesService.updateUser({
                userId: user.id,
                authorityRole: selectedRole,
                verified: user.verified
            });

            setUser(prev => prev ? {...prev, authorityRole: selectedRole} : null);
            toast.showSuccess(`User role updated to ${selectedRole}`);
            onPromoteClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to update user role";
            toast.showError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [user, selectedRole, toast, onPromoteClose]);

    // Delete user
    const handleDelete = useCallback(async () => {
        if (!user) return;

        if (!confirm(`Are you sure you want to delete user ${user.email}?`)) return;

        try {
            setIsUpdating(true);
            await userProfilesService.deleteUserProfile(user.id);
            toast.showSuccess("User deleted successfully");
            navigate("/users");
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to delete user";
            toast.showError(errorMessage);
            setIsUpdating(false);
        }
    }, [user, toast, navigate]);

    // Assign location to harbor master
    const handleAssignLocation = useCallback(async () => {
        if (!user || !selectedLocationId) return;

        try {
            setIsUpdating(true);
            await locationsService.assignHarborMaster({
                userId: user.id,
                locationId: selectedLocationId
            });

            toast.showSuccess(`Location assigned to harbor master successfully`);
            onLocationClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to assign location";
            toast.showError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [user, selectedLocationId, toast, onLocationClose]);

    // Edit user profile
    const handleEditProfile = useCallback(async () => {
        if (!user) return;

        try {
            setIsUpdating(true);
            await userProfilesService.updateUser({
                userId: user.id,
                firstName: editedFirstName || null,
                lastName: editedLastName || null,
                authorityRole: user.authorityRole,
                verified: user.verified
            });

            // Update local state
            setUser(prev => prev ? {
                ...prev,
                firstName: editedFirstName || null,
                lastName: editedLastName || null
            } : null);
            toast.showSuccess("User profile updated successfully");
            onEditClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to update user profile";
            toast.showError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [user, editedFirstName, editedLastName, toast, onEditClose]);

    if (isLoading) {
        return (
            <div className="mx-24 px-4 py-8 flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading user details..."/>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="mx-24 px-4 py-8">
                <Card className="border border-danger-200 bg-danger-50">
                    <CardBody>
                        <p className="text-danger-600">⚠️ {error || "User not found"}</p>
                        <Button className="mt-4" color="primary" onPress={() => navigate("/users")}>
                            Back to Users
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A";

    const roleColor = {
        [UserAuthorityRole.ADMIN]: "danger",
        [UserAuthorityRole.HARBOR_MASTER]: "warning",
        [UserAuthorityRole.USER]: "primary"
    } as const;

    return (
        <div className="mx-24 px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Details</h1>
                    <p className="text-default-800">
                        View and manage user information
                    </p>
                </div>
                <Button color="default" variant="flat" onPress={() => navigate("/users")}>
                    ← Back to Users
                </Button>
            </div>

            {/* User Profile Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main Info */}
                <Card className="lg:col-span-2 border border-default-200 dark:border-default-100 shadow-sm bg-default-200">
                    <CardHeader className="border-b border-default-200 dark:border-default-100">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary-600">
                                        {user.email.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-default-800">{fullName}</h2>
                                    <p className="text-sm text-default-700">{user.email}</p>
                                </div>
                            </div>
                            <Chip
                                className="capitalize"
                                color={roleColor[user.authorityRole]}
                                size="lg"
                                variant="flat"
                            >
                                {user.authorityRole.replace("_", " ").toLowerCase()}
                            </Chip>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-default-700 mb-1">Email</p>
                                <p className="text-bold text-sm text-default-800">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">Full Name</p>
                                <p className="text-bold text-sm text-default-800">{fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">Authority Role</p>
                                <p className="text-bold text-sm text-default-800 capitalize">
                                    {user.authorityRole.replace("_", " ").toLowerCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">Verification Status</p>
                                <Chip
                                    color={user.verified ? "success" : "warning"}
                                    size="sm"
                                    variant="dot"
                                >
                                    {user.verified ? "Verified" : "Unverified"}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">Activity Roles</p>
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
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">Language</p>
                                <p className="text-bold text-sm text-default-800">{user.language || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">Measurement System</p>
                                <p className="text-bold text-sm text-default-800 capitalize">
                                    {user.measurementSystem?.toLowerCase() || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-default-700 mb-1">User Created</p>
                                <p className="text-bold text-sm text-default-800">
                                    {formatGermanDateOnly(user.userCreatedAt)}
                                </p>
                            </div>
                            {user.profileUpdatedAt && (
                                <div>
                                    <p className="text-sm text-default-700 mb-1">Profile Last Updated</p>
                                    <p className="text-bold text-sm text-default-800">
                                        {formatGermanDate(user.profileUpdatedAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Actions Card */}
                <Card className="border border-default-200 dark:border-default-100 shadow-sm bg-default-200">
                    <CardHeader className="border-b border-default-200 dark:border-default-100">
                        <h3 className="text-lg font-semibold text-default-800">Actions</h3>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <div className="flex flex-col gap-4">
                            {/* Verification Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-default-100">
                                <div>
                                    <p className="text-bold text-sm text-default-800">Verification</p>
                                    <p className="text-xs text-default-700">Toggle user verification status</p>
                                </div>
                                <Switch
                                    isSelected={user.verified}
                                    onValueChange={handleVerificationToggle}
                                    isDisabled={isUpdating}
                                    color="success"
                                />
                            </div>

                            {/* Edit Profile */}
                            <Button
                                color="primary"
                                variant="flat"
                                onPress={onEditOpen}
                                isDisabled={isUpdating}
                                className="w-full"
                            >
                                Edit Profile
                            </Button>

                            {/* Change Role */}
                            <Button
                                color="warning"
                                variant="flat"
                                onPress={onPromoteOpen}
                                isDisabled={isUpdating}
                                className="w-full"
                            >
                                Change Authority Role
                            </Button>

                            {/* Assign Location (only for Harbor Masters) */}
                            {user.authorityRole === UserAuthorityRole.HARBOR_MASTER && (
                                <Button
                                    variant="flat"
                                    onPress={onLocationOpen}
                                    isDisabled={isUpdating}
                                    className="w-full bg-secondary-200 text-secondary-800 "
                                >
                                    Assign to Location
                                </Button>
                            )}

                            {/* Delete User */}
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={handleDelete}
                                isDisabled={isUpdating}
                                className="w-full"
                            >
                                Delete User
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Harbor Master Location Section */}
            {user.authorityRole === UserAuthorityRole.HARBOR_MASTER && (
                <Card className="mb-6 border border-default-200 dark:border-default-100 shadow-sm bg-default-200">
                    <CardHeader className="border-b border-default-200 dark:border-default-100">
                        <h3 className="text-lg font-semibold text-default-800">Harbor Master Information</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-sm text-default-700 mb-2">
                                    This user is designated as a Harbor Master. Harbor Masters can be assigned to specific locations to manage harbor operations.
                                </p>
                                <Chip color="warning" variant="flat" size="sm">
                                    Harbor Master Role Active
                                </Chip>
                            </div>
                            {user.assignedLocation && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-default-800 mb-1">Assigned Location:</p>
                                    <div className="flex items-center gap-2">
                                        <Chip color="primary" variant="flat">
                                            {user.assignedLocation?.name || `Location ID: ${user.assignedLocation}`}
                                        </Chip>
                                    </div>
                                </div>
                            )}
                            {!user.assignedLocation && (
                                <div className="mt-4">
                                    <p className="text-sm text-default-600">
                                        No location assigned yet. Use the "Assign Location" button to assign a location.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Change Role Modal */}
            <Modal isOpen={isPromoteOpen} onClose={onPromoteClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Change User Authority Role
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-default-700 mb-4">
                                    Select the new authority role for {user.email}
                                </p>
                                <Select
                                    label="Authority Role"
                                    placeholder="Select a role"
                                    variant="bordered"
                                    selectedKeys={[selectedRole]}
                                    onChange={(e) => setSelectedRole(e.target.value as UserAuthorityRole)}
                                >
                                    <SelectItem key={UserAuthorityRole.USER}>
                                        User
                                    </SelectItem>
                                    <SelectItem key={UserAuthorityRole.HARBOR_MASTER}>
                                        Harbor Master
                                    </SelectItem>
                                    <SelectItem key={UserAuthorityRole.ADMIN}>
                                        Admin
                                    </SelectItem>
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="warning"
                                    onPress={handleRoleChange}
                                    isLoading={isUpdating}
                                >
                                    Update Role
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Assign Location Modal */}
            <Modal isOpen={isLocationOpen} onClose={onLocationClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Assign Harbor Master to Location
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-default-700 mb-4">
                                    Select a location to assign {user.email} as Harbor Master
                                </p>
                                <Select
                                    label="Location"
                                    placeholder="Select a location"
                                    variant="bordered"
                                    selectedKeys={selectedLocationId ? [selectedLocationId.toString()] : []}
                                    onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                                >
                                    {locations.map((location) => (
                                        <SelectItem key={location.id.toString()}>
                                            {location.name || `Location ${location.id}`}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleAssignLocation}
                                    isLoading={isUpdating}
                                    isDisabled={!selectedLocationId}
                                >
                                    Assign Location
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Edit User Profile
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-default-700 mb-4">
                                    Update profile information for {user.email}
                                </p>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="First Name"
                                        variant={"bordered"}
                                        placeholder="Enter first name"
                                        value={editedFirstName}
                                        onChange={(e) => setEditedFirstName(e.target.value)}
                                    />
                                    <Input
                                        label="Last Name"
                                        variant="bordered"
                                        placeholder="Enter last name"
                                        value={editedLastName}
                                        onChange={(e) => setEditedLastName(e.target.value)}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleEditProfile}
                                    isLoading={isUpdating}
                                >
                                    Save Changes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
