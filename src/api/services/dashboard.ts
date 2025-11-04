import apiClient from '../client';
import {DashboardInfo} from '../models/dashboard';

class DashboardService {
    async getDashboardInfo(): Promise<DashboardInfo> {
        const response = await apiClient.get<DashboardInfo>('/admin/dashboardInfo');
        return response.data;
    }
}

export default new DashboardService();
