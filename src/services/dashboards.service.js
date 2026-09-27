import { apiClient } from './api.client.js';

export const dashboardsService = {
  getFounder: () => apiClient.get('/dashboards/founder'),
  getCeo: () => apiClient.get('/dashboards/ceo'),
  getCro: () => apiClient.get('/dashboards/cro'),
  getCmo: () => apiClient.get('/dashboards/cmo'),
  getCoo: () => apiClient.get('/dashboards/coo'),
  getCfo: () => apiClient.get('/dashboards/cfo'),
  getChro: () => apiClient.get('/dashboards/chro'),
  getCto: () => apiClient.get('/dashboards/cto'),
  getRnd: () => apiClient.get('/dashboards/rnd'),
};

export default dashboardsService;
