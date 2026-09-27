import { apiClient } from './api.client';

export const taxService = {
  getTaxRates: () => apiClient.get('/tax/rates'),
  createTaxRate: (data) => apiClient.post('/tax/rates', data),
  updateTaxRate: (id, data) => apiClient.put(`/tax/rates/${id}`, data),
  getGstr1: (params) => apiClient.get('/tax/gstr-1', { params }),
  getGstr3b: (params) => apiClient.get('/tax/gstr-3b', { params }),
  getItcRegister: (params) => apiClient.get('/tax/itc-register', { params }),
  getTaxLedger: () => apiClient.get('/tax/ledger'),
};

export default taxService;
