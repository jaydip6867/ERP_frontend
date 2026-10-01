import { apiClient } from './api.client';

export const adminService = {
  // Users
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),

  // Company Profile
  getCompany: () => apiClient.get('/admin/company'),
  getCompanyProfile: () => apiClient.get('/admin/company'),
  updateCompany: (data) => apiClient.put('/admin/company', data),

  // Branches
  getBranches: () => apiClient.get('/admin/branches'),
  createBranch: (data) => apiClient.post('/admin/branches', data),
  updateBranch: (id, data) => apiClient.put(`/admin/branches/${id}`, data),

  // Warehouses
  getWarehouses: () => apiClient.get('/admin/warehouses'),
  createWarehouse: (data) => apiClient.post('/admin/warehouses', data),
  updateWarehouse: (id, data) => apiClient.put(`/admin/warehouses/${id}`, data),

  // Number Series
  getNumberSeries: () => apiClient.get('/admin/number-series'),
  updateNumberSeries: (id, data) => apiClient.put(`/admin/number-series/${id}`, data),

  // Master Data
  getMasterData: (type) => apiClient.get('/admin/master-data', { params: { type } }),
  createMasterData: (data) => apiClient.post('/admin/master-data', data),
  updateMasterData: (id, data) => apiClient.put(`/admin/master-data/${id}`, data),

  // System Settings
  getSystemSettings: () => apiClient.get('/admin/settings'),
  updateSystemSettings: (data) => apiClient.put('/admin/settings', data),

  // Audit Logs & Login History
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
  getLoginHistory: (params) => apiClient.get('/admin/login-history', { params }),
};
export default adminService;
