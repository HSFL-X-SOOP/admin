import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {AuthorityRole} from '@/api/models/auth';

export interface SessionInfo {
    accessToken: string;
    refreshToken: string | null;
    loggedInSince: Date;
    role: AuthorityRole;
    lastTokenRefresh: Date | null;
}

interface SessionContextType {
    session?: SessionInfo;
    login: (session: SessionInfo) => void;
    logout: () => void;
    isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({children}: SessionProviderProps) {
    const [session, setSession] = useState<SessionInfo | undefined>();

    useEffect(() => {
        const storedSession = localStorage.getItem('session');
        if (storedSession) {
            try {
                const parsedSession = JSON.parse(storedSession);
                parsedSession.loggedInSince = new Date(parsedSession.loggedInSince);
                if (parsedSession.lastTokenRefresh) {
                    parsedSession.lastTokenRefresh = new Date(parsedSession.lastTokenRefresh);
                }
                setSession(parsedSession);
            } catch (error) {
                console.error('Failed to parse stored session:', error);
                localStorage.removeItem('session');
            }
        }
    }, []);

    const login = (newSession: SessionInfo) => {
        setSession(newSession);
        localStorage.setItem('session', JSON.stringify(newSession));
    };

    const logout = () => {
        setSession(undefined);
        localStorage.removeItem('session');
        window.location.href = '/login';
    };


    const isAdmin = session?.role === AuthorityRole.ADMIN;

    return (
        <SessionContext.Provider
            value={{
                session,
                login,
                logout,
                isAdmin
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}