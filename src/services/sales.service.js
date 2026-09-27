import { apiClient } from './api.client';

export const salesService = {
  // Quotations
  getQuotations: (params) => apiClient.get('/sales/quotations', { params }),
  getQuotationById: (id) => apiClient.get(`/sales/quotations/${id}`),
  createQuotation: (data) => apiClient.post('/sales/quotations', data),
  updateQuotation: (id, data) => apiClient.put(`/sales/quotations/${id}`, data),
  createRevision: (id, data) => apiClient.post(`/sales/quotations/${id}/revisions`, data),
  approveDiscount: (id, data) => apiClient.put(`/sales/quotations/${id}/approve-discount`, data),
  convertToOrder: (id) => apiClient.put(`/sales/quotations/${id}/convert-to-order`),

  // Channel Partners
  getChannelPartners: () => apiClient.get('/sales/channel-partners'),
  createChannelPartner: (data) => apiClient.post('/sales/channel-partners', data),
  updateChannelPartner: (id, data) => apiClient.put(`/sales/channel-partners/${id}`, data),

  // Retail POS
  createPosSale: (data) => apiClient.post('/sales/pos/checkout', data),
  getDailyRetailSummary: (params) => apiClient.get('/sales/pos/daily-summary', { params }),
};
export default salesService;
