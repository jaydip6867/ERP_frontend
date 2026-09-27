import { apiClient } from './api.client.js';

export const rndService = {
  getDashboard: () => apiClient.get('/rnd/dashboard'),
  getMarketResearch: (params) => apiClient.get('/rnd/market-research', { params }),
  createMarketResearch: (data) => apiClient.post('/rnd/market-research', data),
  getCompetitors: (params) => apiClient.get('/rnd/competitors', { params }),
  createCompetitor: (data) => apiClient.post('/rnd/competitors', data),

  getOpportunities: (params) => apiClient.get('/rnd/opportunities', { params }),
  createOpportunity: (data) => apiClient.post('/rnd/opportunities', data),
  getProductDevelopment: (params) => apiClient.get('/rnd/product-development', { params }),
  createProductDevelopment: (data) => apiClient.post('/rnd/product-development', data),

  getSamples: (params) => apiClient.get('/rnd/samples', { params }),
  createSample: (data) => apiClient.post('/rnd/samples', data),
  getTests: (params) => apiClient.get('/rnd/tests', { params }),
  createTest: (data) => apiClient.post('/rnd/tests', data),
  getImprovements: (params) => apiClient.get('/rnd/improvements', { params }),
  createImprovement: (data) => apiClient.post('/rnd/improvements', data),

  getCustomerResearch: (params) => apiClient.get('/rnd/customer-research', { params }),
  createCustomerResearch: (data) => apiClient.post('/rnd/customer-research', data),
  getFeedback: (params) => apiClient.get('/rnd/feedback', { params }),
  createFeedback: (data) => apiClient.post('/rnd/feedback', data),
  getProblemSolving: (params) => apiClient.get('/rnd/problem-solving', { params }),
  createProblemSolving: (data) => apiClient.post('/rnd/problem-solving', data),
};

export default rndService;
