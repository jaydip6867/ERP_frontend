import { apiClient } from './api.client';

export const expenseOwnerService = {
  getExpenses: (params) => apiClient.get('/expense-owner/expenses', { params }),
  createExpense: (data) => apiClient.post('/expense-owner/expenses', data),
  getCategories: () => apiClient.get('/expense-owner/categories'),
  createCategory: (data) => apiClient.post('/expense-owner/categories', data),
  getBudgetReport: (params) => apiClient.get('/expense-owner/budgets', { params }),
  getOwnerLedger: (params) => apiClient.get('/expense-owner/owner-ledger', { params }),
  createOwnerTransaction: (data) => apiClient.post('/expense-owner/owner-ledger', data),
  getSafeToWithdraw: () => apiClient.get('/expense-owner/safe-to-withdraw'),
};

export default expenseOwnerService;
