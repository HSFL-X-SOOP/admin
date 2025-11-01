// Auth Models
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string | null;
    role?: AuthorityRole | null;
}

// Profile and Role Models
export enum AuthorityRole {
    ADMIN = "ADMIN",
    USER = "USER",
    HARBOURMASTER = "HARBOURMASTER"
}
