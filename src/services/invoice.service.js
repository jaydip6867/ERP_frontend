import { apiClient } from './api.client';

export const invoiceService = {
  getDashboardMetrics: () => apiClient.get('/invoices/dashboard'),
  getInvoices: (params) => apiClient.get('/invoices', { params }),
  getInvoiceById: (id) => apiClient.get(`/invoices/${id}`),
  createInvoice: (data) => apiClient.post('/invoices', data),
  generateEInvoice: (id) => apiClient.post(`/invoices/${id}/e-invoice`),
  generateEWayBill: (id, data) => apiClient.post(`/invoices/${id}/e-way-bill`, data),
  recordPayment: (id, data) => apiClient.post(`/invoices/${id}/payments`, data),
  getCreditDebitNotes: (params) => apiClient.get('/invoices/notes/list', { params }),
  createCreditDebitNote: (data) => apiClient.post('/invoices/notes', data),
  getInvoiceAgeing: () => apiClient.get('/invoices/ageing'),
};

export default invoiceService;
