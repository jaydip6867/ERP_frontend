import { apiClient } from './api.client';

export const executiveService = {
  getCeoDashboard: () => apiClient.get('/executive/ceo-dashboard'),
  getFounderDecisions: (params) => apiClient.get('/executive/founder-decisions', { params }),
  executeDecisionAction: (id, data) => apiClient.post(`/executive/founder-decisions/${id}/actions`, data),
  getAssistantAgenda: () => apiClient.get('/executive/assistant-agenda'),
};

export default executiveService;
