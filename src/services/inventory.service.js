import { apiClient } from './api.client';

export const inventoryService = {
  getDashboardMetrics: () => apiClient.get('/inventory/dashboard'),
  getStockSummary: (params) => apiClient.get('/inventory/summary', { params }),
  getStockLedger: (params) => apiClient.get('/inventory/ledger', { params }),
  getTransfers: (params) => apiClient.get('/inventory/transfers', { params }),
  createTransfer: (data) => apiClient.post('/inventory/transfers', data),
  completeTransfer: (id) => apiClient.put(`/inventory/transfers/${id}/complete`),
  getAdjustments: (params) => apiClient.get('/inventory/adjustments', { params }),
  createAdjustment: (data) => apiClient.post('/inventory/adjustments', data),
  approveAdjustment: (id) => apiClient.put(`/inventory/adjustments/${id}/approve`),
  getBatches: (params) => apiClient.get('/inventory/batches', { params }),
  updateBatchStatus: (id, data) => apiClient.patch(`/inventory/batches/${id}/status`, data),
  getReservations: (params) => apiClient.get('/inventory/reservations', { params }),
  getPhysicalCounts: (params) => apiClient.get('/inventory/physical-counts', { params }),
};

export default inventoryService;
