import { apiClient } from './api.client';

export const commonService = {
  getNotifications: (params) => apiClient.get('/common/notifications', { params }),
  markNotificationRead: (id) => apiClient.put(`/common/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.put('/common/notifications/read-all'),
  globalSearch: (query) => apiClient.get('/common/search', { params: { q: query } }),
};

export default commonService;
