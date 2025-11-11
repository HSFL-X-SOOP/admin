// User Profile related types based on API specification

export enum UserActivityRole {
    SWIMMER = "SWIMMER",
    SAILOR = "SAILOR",
    FISHERMAN = "FISHERMAN"
}

export enum UserAuthorityRole {
    ADMIN = "ADMIN",
    HARBOR_MASTER = "HARBOR_MASTER",
    USER = "USER"
}

export enum Language {
    EN = "EN",
    DE = "DE"
}

export enum MeasurementSystem {
    METRIC = "METRIC",
    IMPERIAL = "IMPERIAL"
}

export interface UserProfile {
    id: number;
    email: string;
    authorityRole: UserAuthorityRole;
    activityRoles: UserActivityRole[];
    userCreatedAt: string;
    verified: boolean;
    firstName?: string | null;
    lastName?: string | null;
    language?: Language | null;
    measurementSystem?: MeasurementSystem | null;
    profileCreatedAt?: string | null;
    profileUpdatedAt?: string | null;
}

export interface CreateUserProfileRequest {
    firstName?: string | null;
    lastName?: string | null;
    language: Language;
    measurementSystem: MeasurementSystem;
    roles: UserActivityRole[];
}

export interface UpdateUserProfileRequest {
    firstName?: string | null;
    lastName?: string | null;
    language?: Language | null;
    measurementSystem?: MeasurementSystem | null;
    roles?: UserActivityRole[] | null;
}

export interface UserProfilesResponse {
    items: UserProfile[];
    totalCount: number;
    filteredCount: number;
}

export interface UserProfileFilters {
    page?: number;
    limit?: number;
    id?: number;
    email?: string;
    authorityRole?: UserAuthorityRole;
    activityRole?: UserActivityRole;
    verified?: boolean;
    language?: Language;
    measurementSystem?: MeasurementSystem;
    userCreatedAt?: string;
    profileCreatedAt?: string;
    profileUpdatedAt?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}