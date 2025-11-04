import {Route, Routes, Navigate} from "react-router-dom";
import LoginPage from "@/pages/login.tsx";
import DashboardPage from "@/pages/dashboard.tsx";
import SensorsPage from "@/pages/sensors.tsx";
import UsersPage from "@/pages/users.tsx";
import LogsPage from "@/pages/logs.tsx";
import LocationsPage from "@/pages/locations.tsx";
import SettingsPage from "@/pages/settings.tsx";
import {ProtectedRoute} from "@/components/ProtectedRoute";
import {AdminLayout} from "@/layouts/AdminLayout";

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage/>}/>

            <Route element={
                <ProtectedRoute>
                    <AdminLayout/>
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<DashboardPage/>}/>
                <Route path="/sensors" element={<SensorsPage/>}/>
                <Route path="/locations" element={<LocationsPage/>}/>
                <Route path="/users" element={<UsersPage/>}/>
                <Route path="/logs" element={<LogsPage/>}/>
                <Route path="/settings" element={<SettingsPage/>}/>
            </Route>

            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

export default App;
