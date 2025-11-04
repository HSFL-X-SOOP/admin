import apiClient from '../client';
import {PotentialSensorDTO} from '../models/sensors';

class SensorsService {
    async getPotentialSensors(): Promise<PotentialSensorDTO[]> {
        const response = await apiClient.get<PotentialSensorDTO[]>('/admin/potential-sensors');
        return response.data;
    }

    async toggleSensorActive(id: number): Promise<PotentialSensorDTO[]> {
        const response = await apiClient.get<PotentialSensorDTO[]>(`/admin/potential-sensors-toggle/${id}`);
        return response.data;
    }
}

export default new SensorsService();