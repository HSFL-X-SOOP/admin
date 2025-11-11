import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSession} from "@/context/SessionContext";
import authService from "@/api/services/auth";
import {LoginRequest} from "@/api/models/auth";
import {AuthorityRole} from "@/api/models/auth";
import {useToast} from "@/hooks/useToast";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {login: sessionLogin, logout: sessionLogout, session, isAdmin} = useSession();
    const navigate = useNavigate();
    const toast = useToast();

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);

        try {
            const response = await authService.login(credentials);

            let role = response.profile?.authorityRole ?? AuthorityRole.USER;
            
            if (role !== AuthorityRole.ADMIN) {
                toast.showError("Access denied. You are not an administrator. Only users with ADMIN role can access this portal.");
                setIsLoading(false);
                return {success: false, error: "Not an admin"};
            }

            const sessionInfo = {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken || null,
                loggedInSince: new Date(),
                role: role,
                lastTokenRefresh: null,
            };

            sessionLogin(sessionInfo);
            toast.showSuccess("Login successful! Redirecting...");

            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

            return {success: true};
        } catch (error: any) {
            console.error("Login failed:", error);

            if (error.response?.status === 401) {
                toast.showError("Invalid email or password");
            } else if (error.response?.status === 429) {
                toast.showWarning("Too many login attempts. Please try again later.");
            } else {
                toast.showError("Login failed. Please try again.");
            }

            return {
                success: false,
                error: error.response?.data?.message || "Login failed"
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        sessionLogout();
        toast.showInfo("You have been logged out");
        navigate("/login");
    };

    const checkAuth = (): boolean => {
        if (!session) {
            navigate("/login");
            return false;
        }

        if (!isAdmin) {
            toast.showError("Unauthorized access. Admin role required.");
            logout();
            return false;
        }

        return true;
    };

    return {
        login,
        logout,
        checkAuth,
        isLoading,
        isAuthenticated: !!session,
        isAdmin,
        session
    };
};