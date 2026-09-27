import apiClient from './api.client.js';

export const roleService = {
  /**
   * Get paginated roles
   */
  getRoles: async (params = {}) => {
    return apiClient.get('/roles', { params });
  },

  /**
   * Create new custom role
   */
  createRole: async (roleData) => {
    return apiClient.post('/roles', roleData);
  },

  /**
   * Update existing role
   */
  updateRole: async (id, roleData) => {
    return apiClient.put(`/roles/${id}`, roleData);
  },

  /**
   * Get complete module permissions matrix for a role
   */
  getRolePermissions: async (id) => {
    return apiClient.get(`/roles/${id}/permissions`);
  },

  /**
   * Update permissions matrix for a role
   */
  updateRolePermissions: async (id, permissions) => {
    return apiClient.put(`/roles/${id}/permissions`, { permissions });
  },
};
