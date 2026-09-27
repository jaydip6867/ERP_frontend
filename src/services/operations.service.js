import { apiClient } from './api.client.js';

export const operationsService = {
  getDashboard: () => apiClient.get('/operations/dashboard'),
  getSupplyChain: () => apiClient.get('/operations/supply-chain'),
  createSupplyChain: (data) => apiClient.post('/operations/supply-chain', data),
  getMerchandising: (params) => apiClient.get('/operations/product-merchandising', { params }),
  getVendors: () => apiClient.get('/operations/vendor-management'),

  getPrinting: (params) => apiClient.get('/operations/printing', { params }),
  createPrinting: (data) => apiClient.post('/operations/printing', data),
  getEmbroidery: (params) => apiClient.get('/operations/embroidery', { params }),
  createEmbroidery: (data) => apiClient.post('/operations/embroidery', data),
  getPacking: (params) => apiClient.get('/operations/packing', { params }),
  createPacking: (data) => apiClient.post('/operations/packing', data),
  getLogistics: (params) => apiClient.get('/operations/logistics', { params }),
  createLogistics: (data) => apiClient.post('/operations/logistics', data),

  // Marketing extensions
  getMarketingAssets: (params) => apiClient.get('/marketing/assets', { params }),
  createMarketingAsset: (data) => apiClient.post('/marketing/assets', data),
  getContent: (params) => apiClient.get('/marketing/content', { params }),
  createContent: (data) => apiClient.post('/marketing/content', data),
  getCreatives: (params) => apiClient.get('/marketing/creatives', { params }),
  createCreative: (data) => apiClient.post('/marketing/creatives', data),
  getPhysical: (params) => apiClient.get('/marketing/physical', { params }),
  createPhysical: (data) => apiClient.post('/marketing/physical', data),

  // Sales segment
  getSalesSegment: (segment) => apiClient.get(`/sales/segments/${segment}`),

  // Finance extensions
  getCostCenters: () => apiClient.get('/finance/cost-centers'),
  createCostCenter: (data) => apiClient.post('/finance/cost-centers', data),
  getManagementReports: (params) => apiClient.get('/finance/management-reports', { params }),
  createManagementReport: (data) => apiClient.post('/finance/management-reports', data),
};

export default operationsService;
