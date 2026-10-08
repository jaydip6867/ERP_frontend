import { apiClient } from './api.client';

export const purchaseService = {
  // Suppliers
  getSuppliers: (params) => apiClient.get('/purchase/suppliers', { params }),
  getSupplierById: (id) => apiClient.get(`/purchase/suppliers/${id}`),
  createSupplier: (data) => apiClient.post('/purchase/suppliers', data),
  updateSupplier: (id, data) => apiClient.put(`/purchase/suppliers/${id}`, data),

  // Requisitions
  getRequisitions: (params) => apiClient.get('/purchase/requisitions', { params }),
  createRequisition: (data) => apiClient.post('/purchase/requisitions', data),
  approveRequisition: (id, data) => apiClient.put(`/purchase/requisitions/${id}/approve`, data),

  // Purchase Orders
  getOrders: (params) => apiClient.get('/purchase/orders', { params }),
  getOrderById: (id) => apiClient.get(`/purchase/orders/${id}`),
  createOrder: (data) => apiClient.post('/purchase/orders', data),

  // GRN
  getGrns: (params) => apiClient.get('/purchase/grns', { params }),
  getGrnById: (id) => apiClient.get(`/purchase/grns/${id}`),
  createGrn: (data) => apiClient.post('/purchase/grns', data),
  postGrnToStock: (id, data) => apiClient.put(`/purchase/grns/${id}/post-to-stock`, data),

  // Invoices & Returns
  getInvoices: (params) => apiClient.get('/purchase/invoices', { params }),
  createInvoice: (data) => apiClient.post('/purchase/invoices', data),
  getReturns: (params) => apiClient.get('/purchase/returns', { params }),
  createReturn: (data) => apiClient.post('/purchase/returns', data),

  // Supplier Categories
  getCategories: (params) => apiClient.get('/purchase/categories', { params }),
  createCategory: (data) => apiClient.post('/purchase/categories', data),
  updateCategory: (id, data) => apiClient.put(`/purchase/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/purchase/categories/${id}`),

  // Inquiries / Quotations (RFQ)
  getInquiries: (params) => apiClient.get('/purchase/inquiries', { params }),
  getInquiryById: (id) => apiClient.get(`/purchase/inquiries/${id}`),
  createInquiry: (data) => apiClient.post('/purchase/inquiries', data),
  updateSupplierQuotationStatus: (id, supplierId, data) => apiClient.put(`/purchase/inquiries/${id}/suppliers/${supplierId}/status`, data),
};

export default purchaseService;
