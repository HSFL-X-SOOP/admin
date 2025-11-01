import {Navigate, useLocation} from "react-router-dom";
import {useSession} from "@/context/SessionContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({children, requireAdmin = true}: ProtectedRouteProps) {
    const {session, isAdmin} = useSession();
    const location = useLocation();

    // Check if there's a session
    if (!session) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (requireAdmin && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-default-500 mb-6">You need administrator privileges to access this page.</p>
                <Navigate to="/login" replace/>
            </div>
        );
    }

    // All checks passed, render the protected content
    return <>{children}</>;
}