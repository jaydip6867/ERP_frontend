import React from 'react';
import { useAppStore } from '../../store/useAppStore';

/**
 * Hook to check granular module permissions.
 *
 * @param {string} moduleCode
 * @param {string} [action='can_view']
 * @returns {{ hasPermission: boolean, dataScope: string, isSuperuser: boolean }}
 */
export const usePermission = (moduleCode, action = 'can_view') => {
  const { user } = useAppStore();

  if (!user) {
    return { hasPermission: false, dataScope: 'OWN', isSuperuser: false };
  }

  const roleCode = user.role_id?.role_code || (typeof user.role_id === 'string' ? '' : '');
  const isSuper =
    roleCode === 'OWNER' ||
    roleCode === 'ADMIN' ||
    roleCode === 'SUPER_ADMIN' ||
    user.email === 'admin@danzaerp.com';

  if (isSuper) {
    return { hasPermission: true, dataScope: 'ALL', isSuperuser: true };
  }

  const permissions = user.permissions || [];
  const modulePerm = permissions.find((p) => p.module === moduleCode);

  if (!modulePerm) {
    return { hasPermission: false, dataScope: 'OWN', isSuperuser: false };
  }

  const hasPermission = Boolean(modulePerm[action]);
  const dataScope = modulePerm.data_scope || 'OWN';

  return { hasPermission, dataScope, isSuperuser: false };
};

/**
 * Reusable Component Guard that conditionally renders child components
 * only if the authenticated user possesses the required permission.
 *
 * @param {object} props
 * @param {string} props.module - Target module code (e.g. 'roles', 'inventory', 'sales')
 * @param {string} [props.action='can_view'] - Required action ('can_view', 'can_create', 'can_edit', etc.)
 * @param {React.ReactNode} [props.fallback=null] - Component rendered if unauthorized
 * @param {React.ReactNode} props.children
 */
export const PermissionGuard = ({
  module: moduleCode,
  action = 'can_view',
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermission(moduleCode, action);

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
