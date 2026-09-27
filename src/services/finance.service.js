import { apiClient } from './api.client';

export const financeService = {
  getDashboard: () => apiClient.get('/finance/dashboard'),
  getChartOfAccounts: (params) => apiClient.get('/finance/chart-of-accounts', { params }),
  createChartAccount: (data) => apiClient.post('/finance/chart-of-accounts', data),
  getJournalEntries: (params) => apiClient.get('/finance/journals', { params }),
  createJournalEntry: (data) => apiClient.post('/finance/journals', data),
  getReceipts: (params) => apiClient.get('/finance/receipts', { params }),
  createReceipt: (data) => apiClient.post('/finance/receipts', data),
  getPayments: (params) => apiClient.get('/finance/payments', { params }),
  createPayment: (data) => apiClient.post('/finance/payments', data),
  getReceivables: (params) => apiClient.get('/finance/receivables', { params }),
  getPayables: (params) => apiClient.get('/finance/payables', { params }),
  getBankAccounts: () => apiClient.get('/finance/banks'),
  createBankAccount: (data) => apiClient.post('/finance/banks', data),
  getBankTransactions: (params) => apiClient.get('/finance/banks/transactions', { params }),
  getTrialBalance: (params) => apiClient.get('/finance/reports/trial-balance', { params }),
  getProfitAndLoss: (params) => apiClient.get('/finance/reports/pnl', { params }),
  getBalanceSheet: (params) => apiClient.get('/finance/reports/balance-sheet', { params }),
  getCashFlow: (params) => apiClient.get('/finance/reports/cash-flow', { params }),
};

export default financeService;
