import { apiClient } from './api.client';

export const leadService = {
  getDashboard: () => apiClient.get('/leads/dashboard'),
  getLeads: (params) => apiClient.get('/leads', { params }),
  getKanban: () => apiClient.get('/leads/kanban'),
  getLeadById: (id) => apiClient.get(`/leads/${id}`),
  createLead: (data) => apiClient.post('/leads', data),
  updateLead: (id, data) => apiClient.put(`/leads/${id}`, data),
  updateStage: (id, data) => apiClient.put(`/leads/${id}/stage`, data),
  convertToCustomer: (id, data) => apiClient.post(`/leads/${id}/convert`, data),

  // Follow-ups
  getFollowups: (params) => apiClient.get('/leads/followups', { params }),
  createFollowup: (data) => apiClient.post('/leads/followups', data),
  completeFollowup: (id, data) => apiClient.put(`/leads/followups/${id}/complete`, data),
};
export default leadService;
