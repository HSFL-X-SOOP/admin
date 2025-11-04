import {useState, useEffect, useCallback} from "react";
import locationsService from "@/api/services/locations";
import {LocationDTO, UpdateLocationRequest} from "@/api/models/locations";
import {useToast} from "@/hooks/useToast";

export const useLocations = () => {
    const [locations, setLocations] = useState<LocationDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    // Load locations on mount
    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await locationsService.getLocations();
            setLocations(data);
            return {success: true, data};
        } catch (error) {
            const errorMessage = "Failed to load locations";
            console.error(errorMessage, error);
            setError(errorMessage);
            toast.showError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const getLocationDetails = useCallback(async (id: number) => {
        try {
            const data = await locationsService.getLocationById(id);
            return {success: true, data};
        } catch (error) {
            const errorMessage = "Failed to load location details";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return {success: false, error: errorMessage};
        }
    }, [toast]);

    const updateLocation = useCallback(async (id: number, request: UpdateLocationRequest) => {
        try {
            setIsLoading(true);
            const data = await locationsService.updateLocation(id, request);

            // Update the local state
            await loadLocations();

            toast.showSuccess("Location updated successfully");
            return {success: true, data};
        } catch (error) {
            const errorMessage = "Failed to update location";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    }, [toast, loadLocations]);

    const deleteLocationImage = useCallback(async (id: number) => {
        try {
            await locationsService.deleteLocationImage(id);
            toast.showSuccess("Location image deleted successfully");
            return {success: true};
        } catch (error) {
            const errorMessage = "Failed to delete location image";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return {success: false, error: errorMessage};
        }
    }, [toast]);

    const refreshLocations = useCallback(async () => {
        return loadLocations();
    }, [loadLocations]);

    const searchLocations = useCallback((query: string) => {
        const searchLower = query.toLowerCase();
        return locations.filter((location) =>
            location.name?.toLowerCase().includes(searchLower) ||
            location.id.toString().includes(searchLower)
        );
    }, [locations]);

    const hasValidCoordinates = (location: LocationDTO) => {
        return location.coordinates !== null &&
            location.coordinates !== undefined &&
            (location.coordinates.lat !== 0 || location.coordinates.lon !== 0);
    };

    const getLocationsWithCoordinates = useCallback(() => {
        return locations.filter(location => hasValidCoordinates(location));
    }, [locations]);

    return {
        // State
        locations,
        isLoading,
        error,

        // Computed values
        totalCount: locations.length,
        locationsWithCoordinates: getLocationsWithCoordinates().length,

        // Methods
        loadLocations,
        getLocationDetails,
        updateLocation,
        deleteLocationImage,
        refreshLocations,
        searchLocations,
        getLocationsWithCoordinates,
        hasValidCoordinates,
    };
};