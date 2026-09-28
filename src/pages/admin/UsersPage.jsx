import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, UserX, Shield, Edit2, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { roleService } from '../../services/role.service';
import { useAppStore } from '../../store/useAppStore';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';
import { FilterBar } from '../../components/shell/FilterBar';

export const UsersPage = () => {
  const { user: currentUser } = useAppStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    role_id: '',
    branch_id: '',
    department: 'Sales',
    designation: 'Executive',
    password: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
    loadLookups();
  }, [search, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search,
        status: statusFilter || undefined,
      });
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.users || res.data?.data || []);
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [rolesRes, branchesRes] = await Promise.all([
        roleService.getRoles({ limit: 100 }),
        adminService.getBranches(),
      ]);
      const rList = Array.isArray(rolesRes.data)
        ? rolesRes.data
        : (rolesRes.data?.roles || rolesRes.data?.data || []);
      const bList = Array.isArray(branchesRes.data)
        ? branchesRes.data
        : (branchesRes.data?.branches || branchesRes.data?.data || []);
      setRoles(rList);
      setBranches(bList);
    } catch (err) {
      console.error('Failed to load roles/branches:', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      email: '',
      mobile: '',
      role_id: roles[0]?._id || roles[0]?.id || '',
      branch_id: branches[0]?._id || branches[0]?.id || '',
      department: 'Sales',
      designation: 'Executive',
      password: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role_id: user.role_id?._id || user.role_id?.id || (typeof user.role_id === 'string' ? user.role_id : ''),
      branch_id: user.branch_id?._id || user.branch_id?.id || (typeof user.branch_id === 'string' ? user.branch_id : ''),
      department: user.department || 'Sales',
      designation: user.designation || 'Executive',
      password: '',
      status: user.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData };
      if (!payload.branch_id) delete payload.branch_id;
      if (!payload.password) delete payload.password;

      if (editingUser) {
        await adminService.updateUser(editingUser._id || editingUser.id, payload);
      } else {
        await adminService.createUser(payload);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const userId = user._id || user.id;
    const currentStatus = user.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    if (user.email === 'admin@danzaerp.com') {
      alert('The primary system administrator account cannot be deactivated.');
      return;
    }

    const currentUserId = currentUser?._id || currentUser?.id;
    if (currentUserId && (currentUserId === userId || currentUserId.toString() === userId.toString())) {
      alert('You cannot deactivate your own active session account.');
      return;
    }

    try {
      setTogglingId(userId);
      setUsers((prev) =>
        prev.map((u) =>
          (u._id === userId || u.id === userId) ? { ...u, status: newStatus } : u
        )
      );

      await adminService.updateUser(userId, { status: newStatus });
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) =>
          (u._id === userId || u.id === userId) ? { ...u, status: currentStatus } : u
        )
      );
      alert(err.response?.data?.message || err.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      header: 'User Code',
      key: 'user_code',
      cellClassName: 'font-mono font-medium text-slate-800',
    },
    {
      header: 'Full Name',
      key: 'full_name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val}</span>
          <span className="text-xs text-slate-400">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role_id',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          {val?.role_name || (typeof val === 'string' ? val : 'No Role')}
        </span>
      ),
    },
    {
      header: 'Branch',
      key: 'branch_id',
      render: (val) => val?.branch_name || 'All Branches',
    },
    {
      header: 'Department',
      key: 'department',
    },
    {
      header: 'Status & Access',
      key: 'status',
      render: (val, row) => {
        const isActive = val === 'active';
        const currentUserId = currentUser?._id || currentUser?.id;
        const rowId = row._id || row.id;
        const isSelfOrAdmin =
          row.email === 'admin@danzaerp.com' ||
          (currentUserId && currentUserId.toString() === rowId.toString());
        const isToggling = togglingId === rowId;

        return (
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isToggling || isSelfOrAdmin}
              onClick={() => handleToggleStatus(row)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                isActive ? 'bg-emerald-500' : 'bg-slate-300'
              } ${isSelfOrAdmin ? 'opacity-40 cursor-not-allowed' : ''} ${
                isToggling ? 'opacity-50 cursor-wait' : ''
              }`}
              title={
                isSelfOrAdmin
                  ? 'Primary administrator session cannot be deactivated'
                  : isActive
                  ? 'Active: User can log in. Click to deactivate and block login.'
                  : 'Inactive: Login blocked. Click to activate user.'
              }
            >
              <span className="sr-only">Toggle active status</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="User Management"
        subtitle="Manage ERP operator accounts, role assignments, and branch security policies."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search users by name, email, code..."
        filters={[
          {
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Locked', value: 'locked' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={Array.isArray(users) ? users : []}
        loading={loading}
        rowKey={(row) => row._id || row.id}
        actions={(row) => (
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      />

      {/* User Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.full_name}` : 'Create New User Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select Role</option>
                {(Array.isArray(roles) ? roles : []).map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    {r.role_name} ({r.role_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Branches</option>
                {(Array.isArray(branches) ? branches : []).map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status (Login Access) *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              >
                <option value="active">Active (Permitted to log in)</option>
                <option value="inactive">Inactive (Login blocked)</option>
              </select>
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default UsersPage;
