import { useState, useEffect, useCallback } from "react";
import sensorsService from "@/api/services/sensors";
import { PotentialSensorDTO } from "@/api/models/sensors";
import { useToast } from "@/hooks/useToast";

export const useSensors = () => {
    const [sensors, setSensors] = useState<PotentialSensorDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    // Load sensors on mount
    useEffect(() => {
        loadSensors();
    }, []);

    const loadSensors = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await sensorsService.getPotentialSensors();
            setSensors(data);
            return { success: true, data };
        } catch (error) {
            const errorMessage = "Failed to load sensors";
            console.error(errorMessage, error);
            setError(errorMessage);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const toggleSensorStatus = useCallback(async (sensorId: number) => {
        try {
            setIsLoading(true);
            const updatedSensors = await sensorsService.toggleSensorActive(sensorId);
            setSensors(updatedSensors);

            const sensor = updatedSensors.find(s => s.id === sensorId);
            if (sensor) {
                toast.showSuccess(
                    `Sensor ${sensor.name} ${sensor.isActive ? 'activated' : 'deactivated'}`
                );
            }

            return { success: true, data: updatedSensors };
        } catch (error) {
            const errorMessage = "Failed to toggle sensor status";
            console.error(errorMessage, error);
            toast.showError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const refreshSensors = useCallback(async () => {
        return loadSensors();
    }, [loadSensors]);

    const getActiveSensors = useCallback(() => {
        return sensors.filter(sensor => sensor.isActive);
    }, [sensors]);

    const getInactiveSensors = useCallback(() => {
        return sensors.filter(sensor => !sensor.isActive);
    }, [sensors]);

    const getSensorById = useCallback((id: number) => {
        return sensors.find(sensor => sensor.id === id);
    }, [sensors]);

    const searchSensors = useCallback((query: string) => {
        const searchLower = query.toLowerCase();
        return sensors.filter((sensor) =>
            sensor.name?.toLowerCase().includes(searchLower) ||
            sensor.description?.toLowerCase().includes(searchLower)
        );
    }, [sensors]);

    return {
        // State
        sensors,
        isLoading,
        error,

        // Computed values
        totalCount: sensors.length,
        activeCount: sensors.filter(s => s.isActive).length,
        inactiveCount: sensors.filter(s => !s.isActive).length,

        // Methods
        loadSensors,
        toggleSensorStatus,
        refreshSensors,
        getActiveSensors,
        getInactiveSensors,
        getSensorById,
        searchSensors,
    };
};