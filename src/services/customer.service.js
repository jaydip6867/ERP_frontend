import { apiClient } from './api.client';

export const customerService = {
  getCustomers: (params) => apiClient.get('/customers', { params }),
  getCustomerById: (id) => apiClient.get(`/customers/${id}`),
  getCustomer360: (id) => apiClient.get(`/customers/${id}/360`),
  createCustomer: (data) => apiClient.post('/customers', data),
  updateCustomer: (id, data) => apiClient.put(`/customers/${id}`, data),
  approveCredit: (id, data) => apiClient.put(`/customers/${id}/credit-approval`, data),
  mergeDuplicates: (data) => apiClient.post('/customers/merge-duplicates', data),

  // Contacts
  addContact: (customerId, data) => apiClient.post(`/customers/${customerId}/contacts`, data),
  updateContact: (customerId, contactId, data) => apiClient.put(`/customers/${customerId}/contacts/${contactId}`, data),
  deleteContact: (customerId, contactId) => apiClient.delete(`/customers/${customerId}/contacts/${contactId}`),

  // Addresses
  addAddress: (customerId, data) => apiClient.post(`/customers/${customerId}/addresses`, data),
  updateAddress: (customerId, addressId, data) => apiClient.put(`/customers/${customerId}/addresses/${addressId}`, data),
  deleteAddress: (customerId, addressId) => apiClient.delete(`/customers/${customerId}/addresses/${addressId}`),

  // Documents
  addDocument: (customerId, data) => apiClient.post(`/customers/${customerId}/documents`, data),
  verifyDocument: (customerId, docId, data) => apiClient.put(`/customers/${customerId}/documents/${docId}/verify`, data),

  // Interactions
  addInteraction: (customerId, data) => apiClient.post(`/customers/${customerId}/interactions`, data),
};
export default customerService;
