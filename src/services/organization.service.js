import { apiClient } from './api.client.js';

export const organizationService = {
  getTree: () => apiClient.get('/organization/tree'),
  getDepartments: (params) => apiClient.get('/organization/departments', { params }),
  createDepartment: (data) => apiClient.post('/organization/departments', data),
  updateDepartment: (id, data) => apiClient.patch(`/organization/departments/${id}`, data),
  getPositions: (params) => apiClient.get('/organization/positions', { params }),
  createPosition: (data) => apiClient.post('/organization/positions', data),
  updatePosition: (id, data) => apiClient.patch(`/organization/positions/${id}`, data),
};

export default organizationService;
