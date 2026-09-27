import { apiClient } from './api.client';

export const productionService = {
  getDashboardMetrics: () => apiClient.get('/production/dashboard'),
  getWorkOrders: (params) => apiClient.get('/production/work-orders', { params }),
  getWorkOrderById: (id) => apiClient.get(`/production/work-orders/${id}`),
  createWorkOrder: (data) => apiClient.post('/production/work-orders', data),
  checkMaterialAvailability: (params) => apiClient.get('/production/material-availability', { params }),
  receiveFinishedGoods: (id, data) => apiClient.post(`/production/work-orders/${id}/receive-fg`, data),
  getWorkOrderCosting: (id) => apiClient.get(`/production/work-orders/${id}/costing`),

  // Material Issues
  getMaterialIssues: (params) => apiClient.get('/production/material-issues', { params }),
  issueMaterials: (data) => apiClient.post('/production/material-issues', data),

  // Logs & Scrap
  getProductionLogs: (params) => apiClient.get('/production/logs', { params }),
  createProductionLog: (data) => apiClient.post('/production/logs', data),
  getScrapRecords: (params) => apiClient.get('/production/scrap', { params }),
  createScrapRecord: (data) => apiClient.post('/production/scrap', data),
};

export default productionService;
