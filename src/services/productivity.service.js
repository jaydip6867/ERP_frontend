import { apiClient } from './api.client';

export const productivityService = {
  getMeetings: (params) => apiClient.get('/productivity/meetings', { params }),
  createMeeting: (data) => apiClient.post('/productivity/meetings', data),
  getMeetingById: (id) => apiClient.get(`/productivity/meetings/${id}`),
  updateMeetingMinutes: (id, data) => apiClient.put(`/productivity/meetings/${id}/minutes`, data),
  getTasks: (params) => apiClient.get('/productivity/tasks', { params }),
  createTask: (data) => apiClient.post('/productivity/tasks', data),
  updateTaskStatus: (id, data) => apiClient.put(`/productivity/tasks/${id}/status`, data),
  getCalendarEvents: (params) => apiClient.get('/productivity/calendar', { params }),
  createCalendarEvent: (data) => apiClient.post('/productivity/calendar', data),
};

export default productivityService;
