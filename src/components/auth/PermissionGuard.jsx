import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const MODULE_ALIASES = {
  product: 'inventory',
  products: 'inventory',
  warehouse: 'inventory',
  warehouses: 'inventory',
  stock: 'inventory',
  workorder: 'production',
  workorders: 'production',
  lead: 'marketing',
  leads: 'marketing',
  quotation: 'sales',
  quotations: 'sales',
  order: 'sales',
  orders: 'sales',
  supplier: 'procurement',
  suppliers: 'procurement',
  purchase: 'procurement',
  invoice: 'finance',
  invoices: 'finance',
  tax: 'finance',
  gst: 'finance',
};

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

  const roleCode = (
    user.role_id?.role_code ||
    user.role_id?.role_name ||
    user.role?.role_code ||
    user.role?.role_name ||
    user.role_code ||
    (typeof user.role === 'string' ? user.role : '') ||
    ''
  ).toUpperCase();

  const isSuper =
    roleCode === 'OWNER' ||
    roleCode === 'ADMIN' ||
    roleCode === 'SUPER_ADMIN' ||
    roleCode === 'SUPERADMIN' ||
    roleCode === 'FOUNDER' ||
    roleCode === 'BOARD_FOUNDER' ||
    roleCode === 'BOARD / FOUNDER' ||
    roleCode === 'CEO' ||
    user.email === 'admin@danzaerp.com' ||
    user.email === 'owner@danzaerp.com';

  if (isSuper) {
    return { hasPermission: true, dataScope: 'ALL', isSuperuser: true };
  }

  const permissions = user.permissions || [];
  const normalizedModule = MODULE_ALIASES[moduleCode?.toLowerCase()] || moduleCode;

  const modulePerm = permissions.find(
    (p) => p.module === moduleCode || p.module === normalizedModule
  );

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
    if (fallback !== null) {
      return fallback;
    }

    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          You do not have active <span className="font-semibold text-slate-700 font-mono">[{moduleCode}]</span> permissions to perform <span className="font-semibold text-slate-700">[{action}]</span>. Please contact your system administrator if you require access.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
