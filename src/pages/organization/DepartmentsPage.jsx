import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Search, Users } from 'lucide-react';
import { organizationService } from '../../services/organization.service';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    department_code: '',
    department_name: '',
    head_user_id: '',
    parent_department_id: '',
    branch_id: '',
    description: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadLookups();
  }, [search]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getDepartments({ search });
      setDepartments(res.data?.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        adminService.getUsers({ limit: 100 }),
        adminService.getBranches(),
      ]);
      setUsers(uRes.data?.users || uRes.data || []);
      setBranches(bRes.data?.branches || bRes.data || []);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        department_code: dept.department_code,
        department_name: dept.department_name,
        head_user_id: dept.head_user_id?._id || dept.head_user_id || '',
        parent_department_id: dept.parent_department_id?._id || dept.parent_department_id || '',
        branch_id: dept.branch_id?._id || dept.branch_id || '',
        description: dept.description || '',
        status: dept.status || 'active',
      });
    } else {
      setEditingDept(null);
      setFormData({
        department_code: '',
        department_name: '',
        head_user_id: '',
        parent_department_id: '',
        branch_id: '',
        description: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingDept) {
        await organizationService.updateDepartment(editingDept._id, formData);
      } else {
        await organizationService.createDepartment(formData);
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Code',
      key: 'department_code',
      cellClassName: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Department Name',
      key: 'department_name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.department_name}</div>
          <div className="text-xs text-slate-400">{row.description || 'No description'}</div>
        </div>
      ),
    },
    {
      header: 'Head of Department',
      key: 'head_user_id',
      render: (val) => (
        <span className="font-medium text-slate-700">
          {val?.full_name ? val.full_name : <span className="text-slate-400 italic">Unassigned</span>}
        </span>
      ),
    },
    {
      header: 'Parent Dept',
      key: 'parent_department_id',
      render: (val) => (
        <span className="text-xs text-slate-600">
          {val?.department_name ? val.department_name : '-'}
        </span>
      ),
    },
    {
      header: 'Branch',
      key: 'branch_id',
      render: (val) => (
        <span className="text-xs text-slate-600">
          {val?.branch_name ? val.branch_name : 'All Branches'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            val === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Departments Directory"
          subtitle="Configure operational divisions, reporting lines, and department heads."
          breadcrumbs={[{ label: 'Organization' }, { label: 'Departments' }]}
        />
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by department name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        rowKey="_id"
        actions={(row) => (
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit Department"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.department_name}` : 'Create Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                value={formData.department_code}
                onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. HR, RND, SALES"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={formData.department_name}
                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. Research & Development"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Head</label>
              <select
                value={formData.head_user_id}
                onChange={(e) => setFormData({ ...formData, head_user_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Select Head User --</option>
                {users.map((u) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Department</label>
              <select
                value={formData.parent_department_id}
                onChange={(e) => setFormData({ ...formData, parent_department_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- None (Top Level) --</option>
                {departments
                  .filter((d) => !editingDept || String(d._id) !== String(editingDept._id))
                  .map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.department_name} ({d.department_code})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Branch</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Corporate / All Branches --</option>
                {branches.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              placeholder="Scope, operational mandate, or responsibilities..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
