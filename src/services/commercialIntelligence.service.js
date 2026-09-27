import { apiClient } from './api.client';

export const commercialIntelligenceService = {
  getRepeatDashboard: (params) => apiClient.get('/commercial-intelligence/repeat-orders/dashboard', { params }),
  scheduleRepeatOrders: (data) => apiClient.post('/commercial-intelligence/repeat-orders/schedule', data),
  updateRepeatOrderStatus: (id, data) => apiClient.put(`/commercial-intelligence/repeat-orders/${id}`, data),
  getUpsellDashboard: (params) => apiClient.get('/commercial-intelligence/upsell/dashboard', { params }),
  generateUpsell: (data) => apiClient.post('/commercial-intelligence/upsell/generate', data),
  updateUpsellStatus: (id, data) => apiClient.put(`/commercial-intelligence/upsell/${id}`, data),
};

export default commercialIntelligenceService;
