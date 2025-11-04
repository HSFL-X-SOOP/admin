import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { useToast } from "@/hooks/useToast";
import { formatGermanDateOnly } from "@/utils/dateFormatter";

export default function SettingsPage() {
    const toast = useToast();

    // Settings State
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState("30");
    const [language, setLanguage] = useState("en");
    const [timezone, setTimezone] = useState("Europe/Berlin");
    const [apiUrl, setApiUrl] = useState("https://test.marlin-live.com/api");
    const [itemsPerPage, setItemsPerPage] = useState("10");

    const handleSaveGeneral = () => {
        toast.showSuccess("General settings saved successfully");
    };

    const handleSaveNotifications = () => {
        toast.showSuccess("Notification settings saved successfully");
    };

    const handleSaveAdvanced = () => {
        toast.showSuccess("Advanced settings saved successfully");
    };

    return (
        <div className="mx-24 px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-default-800">
                    Configure system preferences and application settings
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card className="bg-default-50 border border-default-200">
                    <CardHeader className="flex flex-col items-start px-6 pt-6">
                        <h2 className="text-xl font-semibold">General Settings</h2>
                        <p className="text-small text-default-500">
                            Configure basic application preferences
                        </p>
                    </CardHeader>
                    <CardBody className="px-6 py-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-default-900 font-medium">Dark Mode</p>
                                <p className="text-small text-default-500">
                                    Enable dark theme for the interface
                                </p>
                            </div>
                            <Switch
                                isSelected={darkMode}
                                onValueChange={setDarkMode}
                                size="sm"
                            />
                        </div>

                        <Divider />

                        <div>
                            <label className="text-default-900 font-medium mb-2 block">
                                Language
                            </label>
                            <Select
                                selectedKeys={[language]}
                                onSelectionChange={(keys) => setLanguage(Array.from(keys)[0] as string)}
                                className="max-w-full"
                                size="sm"
                            >
                                <SelectItem key="en">English</SelectItem>
                                <SelectItem key="de">Deutsch</SelectItem>
                            </Select>
                        </div>

                        <div>
                            <label className="text-default-900 font-medium mb-2 block">
                                Timezone
                            </label>
                            <Select
                                selectedKeys={[timezone]}
                                onSelectionChange={(keys) => setTimezone(Array.from(keys)[0] as string)}
                                className="max-w-full"
                                size="sm"
                            >
                                <SelectItem key="Europe/Berlin">
                                    Europe/Berlin
                                </SelectItem>
                                <SelectItem key="UTC">UTC</SelectItem>
                                <SelectItem key="America/New_York">
                                    America/New York
                                </SelectItem>
                            </Select>
                        </div>

                        <div>
                            <label className="text-default-900 font-medium mb-2 block">
                                Items per page
                            </label>
                            <Input
                                type="number"
                                value={itemsPerPage}
                                onValueChange={setItemsPerPage}
                                min="5"
                                max="100"
                                size="sm"
                                className="max-w-full"
                            />
                        </div>
                    </CardBody>
                    <CardFooter className="px-6 pb-6">
                        <Button
                            color="primary"
                            onPress={handleSaveGeneral}
                            className="ml-auto"
                        >
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Notifications */}
                <Card className="bg-default-50 border border-default-200">
                    <CardHeader className="flex flex-col items-start px-6 pt-6">
                        <h2 className="text-xl font-semibold">Notifications</h2>
                        <p className="text-small text-default-500">
                            Manage notification preferences
                        </p>
                    </CardHeader>
                    <CardBody className="px-6 py-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-default-900 font-medium">
                                    Push Notifications
                                </p>
                                <p className="text-small text-default-500">
                                    Receive in-app notifications
                                </p>
                            </div>
                            <Switch
                                isSelected={notifications}
                                onValueChange={setNotifications}
                                size="sm"
                            />
                        </div>

                        <Divider />

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-default-900 font-medium">
                                    Email Notifications
                                </p>
                                <p className="text-small text-default-500">
                                    Receive updates via email
                                </p>
                            </div>
                            <Switch
                                isSelected={emailNotifications}
                                onValueChange={setEmailNotifications}
                                size="sm"
                            />
                        </div>

                        <Divider />

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-default-900 font-medium">Auto-refresh</p>
                                <p className="text-small text-default-500">
                                    Automatically refresh data
                                </p>
                            </div>
                            <Switch
                                isSelected={autoRefresh}
                                onValueChange={setAutoRefresh}
                                size="sm"
                            />
                        </div>

                        {autoRefresh && (
                            <div>
                                <label className="text-default-900 font-medium mb-2 block">
                                    Refresh Interval (seconds)
                                </label>
                                <Input
                                    type="number"
                                    value={refreshInterval}
                                    onValueChange={setRefreshInterval}
                                    min="10"
                                    max="300"
                                    size="sm"
                                    className="max-w-full"
                                />
                            </div>
                        )}
                    </CardBody>
                    <CardFooter className="px-6 pb-6">
                        <Button
                            color="primary"
                            onPress={handleSaveNotifications}
                            className="ml-auto"
                        >
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Advanced Settings */}
                <Card className="bg-default-50 border border-default-200 lg:col-span-2">
                    <CardHeader className="flex flex-col items-start px-6 pt-6">
                        <h2 className="text-xl font-semibold">Advanced Settings</h2>
                        <p className="text-small text-default-500">
                            Configure advanced system settings
                        </p>
                    </CardHeader>
                    <CardBody className="px-6 py-4 space-y-4">
                        <div>
                            <label className="text-default-900 font-medium mb-2 block">
                                API Endpoint
                            </label>
                            <Input
                                type="url"
                                value={apiUrl}
                                onValueChange={setApiUrl}
                                size="sm"
                                className="max-w-full"
                                description="Base URL for API requests"
                            />
                        </div>

                        <Divider />

                        <div>
                            <h3 className="text-lg font-semibold mb-3">System Information</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-small text-default-500 mb-1">Version</p>
                                    <Chip color="primary" variant="flat" size="sm">
                                        v1.0.0
                                    </Chip>
                                </div>
                                <div>
                                    <p className="text-small text-default-500 mb-1">Environment</p>
                                    <Chip color="success" variant="flat" size="sm">
                                        Development
                                    </Chip>
                                </div>
                                <div>
                                    <p className="text-small text-default-500 mb-1">Build</p>
                                    <Chip color="default" variant="flat" size="sm">
                                        #1234
                                    </Chip>
                                </div>
                                <div>
                                    <p className="text-small text-default-500 mb-1">Last Update</p>
                                    <Chip color="warning" variant="flat" size="sm">
                                        {formatGermanDateOnly(new Date())}
                                    </Chip>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div className="flex gap-4">
                            <Button color="danger" variant="flat">
                                Clear Cache
                            </Button>
                            <Button color="warning" variant="flat">
                                Reset to Defaults
                            </Button>
                        </div>
                    </CardBody>
                    <CardFooter className="px-6 pb-6">
                        <Button
                            color="primary"
                            onPress={handleSaveAdvanced}
                            className="ml-auto"
                        >
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}