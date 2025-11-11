import {Card, CardBody, CardHeader, CardFooter} from "@heroui/card";
import {useSession} from "@/context/SessionContext";
import {useNavigate} from "react-router-dom";
import {useDashboard} from "@/hooks/useDashboard";

export default function DashboardPage() {
    const {session} = useSession();
    const navigate = useNavigate();
    const {dashboardInfo, isLoading} = useDashboard();

    const quickActions = [
        {
            title: "User Management",
            description: "Manage user accounts and permissions",
            action: () => navigate("/users"),
            color: undefined,
            icon: "👥",
            className: "bg-secondary-200 text-secondary-800",
            iconColor: "text-purple-500"
        },
        {
            title: "Manage Sensors",
            description: "View and manage potential sensors",
            action: () => navigate("/sensors"),
            color: "primary" as const,
            icon: "🔧",
            className: "",
            iconColor: "text-blue-500"
        },
        {
            title: "Locations",
            description: "View and manage measurement locations",
            action: () => navigate("/locations"),
            color: undefined,
            icon: "📍",
            className: "bg-purple-300 dark:bg-purple-400 text-purple-900",
            iconColor: "text-green-500"
        },
        {
            title: "System Settings",
            description: "Configure system settings",
            action: () => navigate("/settings"),
            color: "danger" as const,
            icon: "⚙️",
            className: "",
            iconColor: "text-gray-500"
        },
        {
            title: "View Logs",
            description: "Check system logs and activities",
            action: () => navigate("/logs"),
            color: "warning" as const,
            icon: "📊",
            className: "",
            iconColor: "text-amber-500"
        },
    ];

    const stats = [
        {
            label: "Total Users",
            value: isLoading ? "..." : dashboardInfo?.totalUsers.toString() ?? "0",
            color: "text-blue-600",
            bgGradient: "from-white to-slate-50 dark:from-slate-900/30 dark:to-slate-800/30"
        },
        {
            label: "Total Sensors",
            value: isLoading ? "..." : dashboardInfo?.totalSensors.toString() ?? "0",
            color: "text-green-600",
            bgGradient: "from-white to-slate-50 dark:from-slate-900/30 dark:to-slate-800/30"
        },
        {
            label: "Total Measurements",
            value: isLoading ? "..." : dashboardInfo?.totalMeasurements.toString() ?? "0",
            color: "text-purple-600",
            bgGradient: "from-white to-slate-50 dark:from-slate-900/30 dark:to-slate-800/30"
        },
        {
            label: "Total Locations",
            value: isLoading ? "..." : dashboardInfo?.totalLocations.toString() ?? "0",
            color: "text-red-600",
            bgGradient: "from-white to-slate-50 dark:from-slate-900/30 dark:to-slate-800/30"
        },
        {
            label: "System Status",
            value: "Operational",
            color: "text-emerald-600",
            bgGradient: "from-white to-slate-50 dark:from-slate-900/30 dark:to-slate-800/30"
        },
    ];

    return (
        <div className="mx-24 px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-default-800">
                    Welcome back! You are logged in as <span className="font-semibold">{session?.role}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="border border-default-200 dark:border-default-100 shadow-sm hover:shadow-md transition-shadow bg-default-200"
                    >
                        <CardBody className="p-5">
                            <p className="text-sm text-default-800 font-medium mb-2">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {quickActions.map((action, index) => (
                        <Card
                            key={index}
                            isPressable
                            onPress={action.action}
                            className="border border-default-200 dark:border-default-100 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md bg-default-200"
                        >
                            <CardHeader className="pb-3 pt-5">
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl ${action.iconColor}`}>{action.icon}</span>
                                    <h3 className="font-semibold text-default-800 dark:text-default-700">{action.title}</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0 pb-5">
                                <p className="text-sm text-default-700 dark:text-default-700">{action.description}</p>
                            </CardBody>
                            <CardFooter className="pt-0 pb-3 w-full">
                                <div className={"w-full text-center text-sm font-medium py-1 px-3 rounded-lg " +
                                    (action.className ? action.className :
                                     action.color === "primary" ? "bg-primary-100 text-primary-600" :
                                     action.color === "danger" ? "bg-danger-100 text-danger-600" :
                                     action.color === "warning" ? "bg-warning-100 text-warning-600" :
                                     "bg-default-100 text-default-600")}>
                                    Open →
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <Card className="border border-default-200 dark:border-default-100 shadow-sm bg-default-200">
                <CardHeader className="border-b border-default-200 dark:border-default-100">
                    <h2 className="text-xl font-semibold text-default-800">Recent Activity</h2>
                </CardHeader>
                <CardBody>
                    <div className="space-y-1">
                        <div
                            className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-default-100/50 transition-colors border-b border-divider/30">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">New sensor registered: Sensor_FL_001</span>
                            </div>
                            <span className="text-xs text-default-700  font-medium">2 hours ago</span>
                        </div>
                        <div
                            className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-default-100/50 transition-colors border-b border-divider/30">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium">User john.doe@example.com logged in</span>
                            </div>
                            <span className="text-xs text-default-700 font-medium">5 hours ago</span>
                        </div>
                        <div
                            className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-default-100/50 transition-colors border-b border-divider/30">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm font-medium">System backup completed successfully</span>
                            </div>
                            <span className="text-xs text-default-700  font-medium">1 day ago</span>
                        </div>
                        <div
                            className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-default-100/50 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm font-medium">Configuration updated for location Flensburg Harbor</span>
                            </div>
                            <span className="text-xs text-default-700  font-medium">2 days ago</span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}