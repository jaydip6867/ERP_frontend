import { API_ENDPOINTS } from '../constants/api.constants.js';
import apiClient from './api.client.js';

export const healthService = {
  getHealth: async () => {
    return apiClient.get(API_ENDPOINTS.HEALTH);
  },
};
