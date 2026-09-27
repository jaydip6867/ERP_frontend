import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isSessionExpired } = useAppStore();
  const location = useLocation();

  if (isSessionExpired) {
    return <Navigate to="/session-expired" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
