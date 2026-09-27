import { apiClient } from './api.client';

export const marketingService = {
  getDashboard: () => apiClient.get('/marketing/dashboard'),
  getCampaigns: (params) => apiClient.get('/marketing/campaigns', { params }),
  createCampaign: (data) => apiClient.post('/marketing/campaigns', data),
  getCampaignPerformance: (id) => apiClient.get(`/marketing/campaigns/${id}/performance`),
  addCampaignSpend: (id, data) => apiClient.post(`/marketing/campaigns/${id}/spends`, data),
};

export default marketingService;
