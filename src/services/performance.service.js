import { apiClient } from './api.client';

export const performanceService = {
  getTargets: (params) => apiClient.get('/performance/targets', { params }),
  createTarget: (data) => apiClient.post('/performance/targets', data),
  getLeaderboard: (params) => apiClient.get('/performance/leaderboard', { params }),
};

export default performanceService;
