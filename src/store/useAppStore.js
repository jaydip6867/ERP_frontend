import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/api.constants.js';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAppStore = create((set, get) => ({
  // UI & Sidebar State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  // User & Authentication State
  user: getInitialUser(),
  accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null,
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null,
  isAuthenticated: Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)),
  isSessionExpired: false,
  sessionExpiredRedirectPath: '/',

  /**
   * Action: Complete successful login
   */
  loginSuccess: (user, accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    set({
      user,
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
      isSessionExpired: false,
    });
  },

  /**
   * Action: Update tokens after background rotation
   */
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    set({
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
    });
  },

  /**
   * Action: Update current user in store & localStorage
   */
  updateUser: (updatedUser) => {
    const merged = { ...get().user, ...updatedUser };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(merged));
    set({ user: merged });
  },

  /**
   * Action: Clear session and logout
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isSessionExpired: false,
    });
  },

  /**
   * Action: Trigger session expired state
   */
  handleSessionExpired: (currentPath = window.location.pathname) => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isSessionExpired: true,
      sessionExpiredRedirectPath: currentPath,
    });
  },

  clearSessionExpiredFlag: () => {
    set({ isSessionExpired: false });
  },

  // Global Notifications / Toast State
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), ...notification },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
