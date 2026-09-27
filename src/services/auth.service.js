import { API_ENDPOINTS } from '../constants/api.constants.js';
import apiClient from './api.client.js';

export const authService = {
  /**
   * Login user with credentials
   */
  login: async (credentials) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  /**
   * Refresh session tokens
   */
  refreshToken: async (refreshToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  },

  /**
   * Logout user session
   */
  logout: async (refreshToken = null) => {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch (e) {
      // Ignore network errors on logout to allow local clear
      return null;
    }
  },

  /**
   * Send forgot password email link
   */
  forgotPassword: async (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * Change password for logged in user
   */
  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    return apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * Fetch current authenticated user profile
   */
  getCurrentUser: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Update profile fields
   */
  updateProfile: async (profileData) => {
    return apiClient.patch(API_ENDPOINTS.AUTH.PROFILE, profileData);
  },
};
