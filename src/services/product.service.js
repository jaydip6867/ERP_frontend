import { apiClient } from './api.client';

export const productService = {
  // Lookups
  getLookups: () => apiClient.get('/products/meta/lookups'),

  // Products
  getProducts: (params) => apiClient.get('/products', { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Categories
  getCategories: () => apiClient.get('/products/categories'),
  createCategory: (data) => apiClient.post('/products/categories', data),
  updateCategory: (id, data) => apiClient.put(`/products/categories/${id}`, data),

  // Brands
  getBrands: () => apiClient.get('/products/brands'),
  createBrand: (data) => apiClient.post('/products/brands', data),
  updateBrand: (id, data) => apiClient.put(`/products/brands/${id}`, data),

  // UOM
  getUoms: () => apiClient.get('/products/uoms'),
  createUom: (data) => apiClient.post('/products/uoms', data),
  updateUom: (id, data) => apiClient.put(`/products/uoms/${id}`, data),

  // HSN
  getHsns: () => apiClient.get('/products/hsns'),
  createHsn: (data) => apiClient.post('/products/hsns', data),
  updateHsn: (id, data) => apiClient.put(`/products/hsns/${id}`, data),

  // Price Lists
  getPriceLists: () => apiClient.get('/products/price-lists'),
  getPriceListById: (id) => apiClient.get(`/products/price-lists/${id}`),
  createPriceList: (data) => apiClient.post('/products/price-lists', data),
  updatePriceList: (id, data) => apiClient.put(`/products/price-lists/${id}`, data),

  // BOM
  getBoms: (params) => apiClient.get('/products/boms', { params }),
  getBomById: (id) => apiClient.get(`/products/boms/${id}`),
  createBom: (data) => apiClient.post('/products/boms', data),
  updateBom: (id, data) => apiClient.put(`/products/boms/${id}`, data),
};
export default productService;
