import {Route, Routes, Navigate} from "react-router-dom";
import LoginPage from "@/pages/login.tsx";
import DashboardPage from "@/pages/dashboard.tsx";
import {ProtectedRoute} from "@/components/ProtectedRoute";
import {AdminLayout} from "@/layouts/AdminLayout";

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LoginPage/>}/>

            {/* Protected routes */}
            <Route element={
                <ProtectedRoute>
                    <AdminLayout/>
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<DashboardPage/>}/>
            </Route>

            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

export default App;
