import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Filter,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { roleService } from '../services/role.service';
import { useAppStore } from '../store/useAppStore';

const ACTION_COLUMNS = [
  { key: 'can_view', label: 'View', short: 'V' },
  { key: 'can_create', label: 'Create', short: 'C' },
  { key: 'can_edit', label: 'Edit', short: 'E' },
  { key: 'can_delete', label: 'Delete', short: 'D' },
  { key: 'can_approve', label: 'Approve', short: 'A' },
  { key: 'can_export', label: 'Export', short: 'X' },
  { key: 'can_print', label: 'Print', short: 'P' },
  { key: 'can_view_cost', label: 'View Cost', short: '$$' },
];

const DATA_SCOPES = ['OWN', 'TEAM', 'BRANCH', 'ALL'];

export const RolesManagementPage = () => {
  const { user } = useAppStore();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [serverMessage, setServerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Create Role Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    role_name: '',
    role_code: '',
    description: '',
    status: 'active',
  });
  const [creatingRole, setCreatingRole] = useState(false);

  // Fetch all roles
  const fetchRoles = async () => {
    setLoadingRoles(true);
    setErrorMessage(null);
    try {
      const response = await roleService.getRoles({ limit: 100 });
      const rolesList = response.data || [];
      setRoles(rolesList);
      if (rolesList.length > 0 && !selectedRole) {
        setSelectedRole(rolesList[0]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load roles list');
    } finally {
      setLoadingRoles(false);
    }
  };

  // Fetch permissions matrix for selected role
  const fetchPermissions = async (roleId) => {
    if (!roleId) return;
    setLoadingMatrix(true);
    setServerMessage(null);
    setErrorMessage(null);
    try {
      const response = await roleService.getRolePermissions(roleId);
      setPermissions(response.data?.permissions || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load permissions matrix');
    } finally {
      setLoadingMatrix(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole?._id) {
      fetchPermissions(selectedRole._id);
    }
  }, [selectedRole?._id]);

  const handleToggleAction = (moduleCode, actionKey) => {
    if (selectedRole?.is_system_role && (selectedRole.role_code === 'OWNER' || selectedRole.role_code === 'ADMIN')) {
      return; // Immutable superuser roles
    }

    setPermissions((prev) =>
      prev.map((perm) => {
        if (perm.module === moduleCode) {
          const updatedVal = !perm[actionKey];
          // If enabling create/edit/delete/etc., automatically ensure can_view is true
          const autoView = updatedVal && actionKey !== 'can_view' ? true : perm.can_view;
          return {
            ...perm,
            [actionKey]: updatedVal,
            can_view: autoView,
          };
        }
        return perm;
      })
    );
  };

  const handleDataScopeChange = (moduleCode, scope) => {
    if (selectedRole?.is_system_role && (selectedRole.role_code === 'OWNER' || selectedRole.role_code === 'ADMIN')) {
      return;
    }

    setPermissions((prev) =>
      prev.map((perm) =>
        perm.module === moduleCode ? { ...perm, data_scope: scope } : perm
      )
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole?._id) return;
    setSavingMatrix(true);
    setServerMessage(null);
    setErrorMessage(null);

    try {
      await roleService.updateRolePermissions(selectedRole._id, permissions);
      setServerMessage(`Permissions for role '${selectedRole.role_name}' successfully updated.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update permissions.');
    } finally {
      setSavingMatrix(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setCreatingRole(true);
    setErrorMessage(null);

    try {
      const response = await roleService.createRole({
        ...newRoleData,
        role_code: newRoleData.role_code.toUpperCase().replace(/\s+/g, '_'),
      });
      const created = response.data?.role || response.data;
      setRoles((prev) => [...prev, created]);
      setSelectedRole(created);
      setCreateModalOpen(false);
      setNewRoleData({ role_name: '', role_code: '', description: '', status: 'active' });
      setServerMessage(`Role '${created.role_name}' created successfully.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create role');
    } finally {
      setCreatingRole(false);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSuperSelected =
    selectedRole?.role_code === 'OWNER' || selectedRole?.role_code === 'ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Roles & Authorization Engine</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise RBAC permissions matrix with multi-tier Data Scopes (OWN, TEAM, BRANCH, ALL).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchRoles} isLoading={loadingRoles}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Role
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {serverMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{serverMessage}</span>
          </div>
          <button onClick={() => setServerMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Roles List / Right Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roles Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">System Roles ({roles.length})</CardTitle>
                <Badge variant="indigo">RBAC</Badge>
              </div>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </CardHeader>

            <CardContent className="p-2 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredRoles.map((role) => {
                const isSelected = selectedRole?._id === role._id;
                return (
                  <button
                    key={role._id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-900 shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{role.role_name}</span>
                        {role.is_system_role && (
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            System
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {role.role_code}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}
                    />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Granular Permissions Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-lg">{selectedRole?.role_name || 'Select Role'}</CardTitle>
                  <Badge variant={selectedRole?.status === 'active' ? 'success' : 'default'}>
                    {selectedRole?.status || 'Active'}
                  </Badge>
                  {isSuperSelected && (
                    <Badge variant="indigo">Unrestricted Full Access</Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1">
                  {selectedRole?.description || 'Configure module action permissions and data-scope visibility'}
                </CardDescription>
              </div>

              {!isSuperSelected && (
                <Button size="sm" onClick={handleSavePermissions} isLoading={savingMatrix}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Matrix
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              {isSuperSelected ? (
                <div className="p-8 text-center bg-indigo-50/40 rounded-b-xl space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedRole?.role_name} has Permanent Universal Access
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The {selectedRole?.role_name} role is hardwired into the authorization engine with full permissions on all modules and an unrestricted <b>ALL</b> data scope.
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">ERP Module</th>
                      {ACTION_COLUMNS.map((col) => (
                        <th key={col.key} className="py-3 px-2 text-center" title={col.label}>
                          {col.short}
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center">Data Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissions.map((perm) => (
                      <tr key={perm.module} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{perm.module_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono capitalize">
                            {perm.category} • {perm.module}
                          </div>
                        </td>

                        {ACTION_COLUMNS.map((col) => {
                          const isChecked = Boolean(perm[col.key]);
                          return (
                            <td key={col.key} className="py-3 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleAction(perm.module, col.key)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                              />
                            </td>
                          );
                        })}

                        <td className="py-3 px-4 text-center">
                          <select
                            value={perm.data_scope || 'OWN'}
                            onChange={(e) => handleDataScopeChange(perm.module, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {DATA_SCOPES.map((scope) => (
                              <option key={scope} value={scope}>
                                {scope}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Role Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create New Custom Role</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <Input
                  label="Role Display Name"
                  placeholder="e.g. Regional Operations Lead"
                  value={newRoleData.role_name}
                  onChange={(e) =>
                    setNewRoleData({ ...newRoleData, role_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Input
                  label="Role Code (Unique Uppercase Identifier)"
                  placeholder="e.g. REGIONAL_OPS_LEAD"
                  value={newRoleData.role_code}
                  onChange={(e) =>
                    setNewRoleData({ ...newRoleData, role_code: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe departmental responsibilities..."
                  value={newRoleData.description}
                  onChange={(e) =>
                    setNewRoleData({ ...newRoleData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={creatingRole}>
                  Create Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
