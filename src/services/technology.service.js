import { apiClient } from './api.client.js';

export const technologyService = {
  getDashboard: () => apiClient.get('/technology/dashboard'),
  getIntegrations: (params) => apiClient.get('/technology/integrations', { params }),
  createIntegration: (data) => apiClient.post('/technology/integrations', data),
  updateIntegration: (id, data) => apiClient.patch(`/technology/integrations/${id}`, data),
  testIntegration: (id) => apiClient.post(`/technology/integrations/${id}/test`),

  getAutomationRules: (params) => apiClient.get('/technology/automation-rules', { params }),
  createAutomationRule: (data) => apiClient.post('/technology/automation-rules', data),
  updateAutomationRule: (id, data) => apiClient.patch(`/technology/automation-rules/${id}`, data),
  runAutomationRule: (id) => apiClient.post(`/technology/automation-rules/${id}/run`),
  getAutomationRuns: (params) => apiClient.get('/technology/automation-runs', { params }),

  getBiReports: (params) => apiClient.get('/technology/bi-reports', { params }),
  getSystemHealth: () => apiClient.get('/technology/system-health'),
  getWebhooks: (params) => apiClient.get('/technology/webhooks', { params }),
  getPortalUsers: (params) => apiClient.get('/technology/portal-users', { params }),
};

export default technologyService;
