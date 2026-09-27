export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'danza_erp_access_token',
  REFRESH_TOKEN: 'danza_erp_refresh_token',
  USER_DATA: 'danza_erp_user',
  THEME: 'danza_erp_theme',
};
