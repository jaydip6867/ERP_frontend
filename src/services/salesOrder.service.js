import { apiClient } from './api.client';

export const salesOrderService = {
  getOrders: (params) => apiClient.get('/sales-orders', { params }),
  getOrderById: (id) => apiClient.get(`/sales-orders/${id}`),
  createOrder: (data) => apiClient.post('/sales-orders', data),
  updateStatus: (id, data) => apiClient.patch(`/sales-orders/${id}/status`, data),
  approveOrder: (id, data) => apiClient.patch(`/sales-orders/${id}/approve`, data),
  reserveStock: (id, data) => apiClient.post(`/sales-orders/${id}/reserve`, data),
  getPendingOrders: () => apiClient.get('/sales-orders/pending'),
  getProcessingMetrics: () => apiClient.get('/sales-orders/processing-metrics'),
};

export default salesOrderService;
