import { apiClient } from './api.client';

export const qcService = {
  getDashboardMetrics: () => apiClient.get('/qc/dashboard'),
  getParameters: (params) => apiClient.get('/qc/parameters', { params }),
  createParameter: (data) => apiClient.post('/qc/parameters', data),
  getTemplates: (params) => apiClient.get('/qc/templates', { params }),
  createTemplate: (data) => apiClient.post('/qc/templates', data),
  getInspections: (params) => apiClient.get('/qc/inspections', { params }),
  getInspectionById: (id) => apiClient.get(`/qc/inspections/${id}`),
  createInspection: (data) => apiClient.post('/qc/inspections', data),
  getReworkRecords: (params) => apiClient.get('/qc/rework', { params }),
};

export default qcService;
