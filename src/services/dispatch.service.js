import { apiClient } from './api.client';

export const dispatchService = {
  getTransporters: () => apiClient.get('/dispatch/transporters'),
  createTransporter: (data) => apiClient.post('/dispatch/transporters', data),
  getDispatches: (params) => apiClient.get('/dispatch', { params }),
  getDispatchById: (id) => apiClient.get(`/dispatch/${id}`),
  createDispatch: (data) => apiClient.post('/dispatch', data),
  shipDispatch: (id) => apiClient.post(`/dispatch/${id}/ship`),
  recordPod: (id, data) => apiClient.post(`/dispatch/${id}/pod`, data),
  getReturns: (params) => apiClient.get('/dispatch/returns/list', { params }),
  createReturn: (data) => apiClient.post('/dispatch/returns', data),
  restockReturn: (id) => apiClient.put(`/dispatch/returns/${id}/restock`),
};

export default dispatchService;
