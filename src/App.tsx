import {Route, Routes, Navigate} from "react-router-dom";
import LoginPage from "@/pages/login.tsx";
import DashboardPage from "@/pages/dashboard.tsx";
import SensorsPage from "@/pages/sensors.tsx";
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
            </Route>

            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

export default App;
