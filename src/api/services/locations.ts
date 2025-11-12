import apiClient from '../client';
import { LocationDTO, DetailedLocationDTO, UpdateLocationRequest, AssignHarborMasterRequest } from '../models/locations';

class LocationsService {
    async getLocations(): Promise<LocationDTO[]> {
        const response = await apiClient.get<LocationDTO[]>('/locations');
        return response.data;
    }

    async getLocationById(id: number): Promise<DetailedLocationDTO> {
        const response = await apiClient.get<DetailedLocationDTO>(`/location/${id}`);
        return response.data;
    }

    async updateLocation(id: number, request: UpdateLocationRequest): Promise<DetailedLocationDTO> {
        const response = await apiClient.put<DetailedLocationDTO>(`/location/${id}`, request);
        return response.data;
    }

    async deleteLocationImage(id: number): Promise<void> {
        await apiClient.delete(`/location/${id}/image`);
    }

    async assignHarborMaster(request: AssignHarborMasterRequest): Promise<void> {
        await apiClient.post('/admin/assignLocation', request);
    }
}

export default new LocationsService();