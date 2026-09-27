import { apiClient } from './api.client';

export const profitabilityService = {
  getStatement: (params) => apiClient.get('/profitability/statement', { params }),
  getProducts: (params) => apiClient.get('/profitability/products', { params }),
  getForecasts: (params) => apiClient.get('/profitability/forecasts', { params }),
};

export default profitabilityService;
