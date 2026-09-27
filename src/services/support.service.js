import { apiClient } from './api.client';

export const supportService = {
  getDashboard: () => apiClient.get('/support/dashboard'),
  getTickets: (params) => apiClient.get('/support/tickets', { params }),
  createTicket: (data) => apiClient.post('/support/tickets', data),
  getTicketById: (id) => apiClient.get(`/support/tickets/${id}`),
  addActivity: (id, data) => apiClient.post(`/support/tickets/${id}/activities`, data),
  escalateTicket: (id, data) => apiClient.put(`/support/tickets/${id}/escalate`, data),
  resolveTicket: (id, data) => apiClient.put(`/support/tickets/${id}/resolve`, data),
  getCapa: (params) => apiClient.get('/support/capa', { params }),
  createCapa: (data) => apiClient.post('/support/capa', data),
  getFeedbacks: (params) => apiClient.get('/support/feedbacks', { params }),
  createFeedback: (data) => apiClient.post('/support/feedbacks', data),
};

export default supportService;
