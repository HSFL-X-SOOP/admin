import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
    const { session } = useSession();
    const navigate = useNavigate();

    const quickActions = [
        {
            title: "Manage Sensors",
            description: "View and manage potential sensors",
            action: () => navigate("/sensors"),
            color: "primary" as const,
        },
        {
            title: "User Management",
            description: "Manage user accounts and permissions",
            action: () => navigate("/users"),
            color: "secondary" as const,
        },
        {
            title: "System Settings",
            description: "Configure system settings",
            action: () => navigate("/settings"),
            color: "success" as const,
        },
        {
            title: "View Logs",
            description: "Check system logs and activities",
            action: () => navigate("/logs"),
            color: "warning" as const,
        },
    ];

    const stats = [
        { label: "Total Users", value: "1,234" },
        { label: "Active Sensors", value: "56" },
        { label: "Measurements Today", value: "8,901" },
        { label: "System Status", value: "Operational" },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-default-500">
                    Welcome back! You are logged in as <span className="font-semibold">{session?.role}</span>
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none bg-gradient-to-br from-white to-default-50 dark:from-default-100 dark:to-default-50">
                        <CardBody>
                            <p className="text-sm text-default-500 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <Card key={index} isPressable onPress={action.action} className="hover:scale-105 transition-transform">
                            <CardHeader className="pb-2">
                                <h3 className="font-semibold">{action.title}</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <p className="text-sm text-default-500 mb-3">{action.description}</p>
                                <Button
                                    size="sm"
                                    color={action.color}
                                    variant="flat"
                                    onPress={action.action}
                                >
                                    Go to {action.title}
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                </CardHeader>
                <CardBody>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-divider">
                            <span className="text-sm">New sensor registered: Sensor_FL_001</span>
                            <span className="text-xs text-default-400">2 hours ago</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-divider">
                            <span className="text-sm">User john.doe@example.com logged in</span>
                            <span className="text-xs text-default-400">5 hours ago</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-divider">
                            <span className="text-sm">System backup completed successfully</span>
                            <span className="text-xs text-default-400">1 day ago</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm">Configuration updated for location Flensburg Harbor</span>
                            <span className="text-xs text-default-400">2 days ago</span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}