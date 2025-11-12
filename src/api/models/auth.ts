export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string | null;
    profile?: UserProfile | null;
}

export interface UserProfile {
    authorityRole: AuthorityRole;
}

export enum AuthorityRole {
    ADMIN = "ADMIN",
    USER = "USER",
    HARBOURMASTER = "HARBOURMASTER"
}
