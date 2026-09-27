import { apiClient } from './api.client.js';

export const hrService = {
  getDashboard: () => apiClient.get('/hr/dashboard'),
  getEmployees: (params) => apiClient.get('/hr/employees', { params }),
  getEmployeeById: (id) => apiClient.get(`/hr/employees/${id}`),
  createEmployee: (data) => apiClient.post('/hr/employees', data),
  updateEmployee: (id, data) => apiClient.patch(`/hr/employees/${id}`, data),
  deleteEmployee: (id) => apiClient.delete(`/hr/employees/${id}`),

  // Recruitment
  getJobOpenings: (params) => apiClient.get('/hr/job-openings', { params }),
  createJobOpening: (data) => apiClient.post('/hr/job-openings', data),
  getCandidates: (params) => apiClient.get('/hr/candidates', { params }),
  createCandidate: (data) => apiClient.post('/hr/candidates', data),
  updateCandidate: (id, data) => apiClient.patch(`/hr/candidates/${id}`, data),
  getInterviews: (params) => apiClient.get('/hr/interviews', { params }),
  createInterview: (data) => apiClient.post('/hr/interviews', data),
  getOnboarding: (params) => apiClient.get('/hr/onboarding', { params }),
  createOnboarding: (data) => apiClient.post('/hr/onboarding', data),

  // Attendance & Leaves
  getAttendance: (params) => apiClient.get('/hr/attendance', { params }),
  recordAttendance: (data) => apiClient.post('/hr/attendance', data),
  getLeaves: (params) => apiClient.get('/hr/leave', { params }),
  createLeave: (data) => apiClient.post('/hr/leave', data),
  approveLeave: (id, remarks) => apiClient.post(`/hr/leave/${id}/approve`, { remarks }),
  rejectLeave: (id, reason) => apiClient.post(`/hr/leave/${id}/reject`, { reason }),

  // Payroll
  getPayroll: (params) => apiClient.get('/hr/payroll', { params }),
  runPayroll: (data) => apiClient.post('/hr/payroll/run', data),

  // Training & Performance
  getTraining: (params) => apiClient.get('/hr/training', { params }),
  createTraining: (data) => apiClient.post('/hr/training', data),
  getPerformance: (params) => apiClient.get('/hr/performance', { params }),
  createPerformance: (data) => apiClient.post('/hr/performance', data),
  getGoals: (params) => apiClient.get('/hr/goals', { params }),
  createGoal: (data) => apiClient.post('/hr/goals', data),

  // Policies, Documents, Engagement
  getPolicies: (params) => apiClient.get('/hr/policies', { params }),
  createPolicy: (data) => apiClient.post('/hr/policies', data),
  getDocuments: (params) => apiClient.get('/hr/documents', { params }),
  uploadDocument: (data) => apiClient.post('/hr/documents', data),
  getEngagement: (params) => apiClient.get('/hr/engagement', { params }),
  createEngagement: (data) => apiClient.post('/hr/engagement', data),
};

export default hrService;
