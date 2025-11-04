export interface GeoPoint {
    lat: number;
    lon: number;
}

export interface LocationDTO {
    id: number;
    name?: string | null;
    coordinates?: GeoPoint | null;
}

export interface DetailedLocationDTO {
    id?: number | null;
    name?: string | null;
    coordinates?: GeoPoint | null;
    address?: string | null;
    description?: string | null;
    openingTime?: string | null;  // LocalTime
    closingTime?: string | null;  // LocalTime
}

export interface UpdateLocationRequest {
    name?: string | null;
    address?: string | null;
    description?: string | null;
    openingTime?: string | null;
    closingTime?: string | null;
}