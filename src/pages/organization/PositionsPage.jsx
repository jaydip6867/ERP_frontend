import React, { useState, useEffect } from 'react';
import { Plus, Layers, Edit2, Search } from 'lucide-react';
import { organizationService } from '../../services/organization.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const PositionsPage = () => {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [formData, setFormData] = useState({
    position_code: '',
    position_name: '',
    department_id: '',
    reports_to_position_id: '',
    level: 1,
    responsibilities: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPositions();
    loadDepartments();
  }, [search]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getPositions({ search });
      setPositions(res.data?.positions || []);
    } catch (err) {
      console.error('Failed to load positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await organizationService.getDepartments();
      setDepartments(res.data?.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleOpenModal = (pos = null) => {
    if (pos) {
      setEditingPos(pos);
      setFormData({
        position_code: pos.position_code,
        position_name: pos.position_name,
        department_id: pos.department_id?._id || pos.department_id || '',
        reports_to_position_id: pos.reports_to_position_id?._id || pos.reports_to_position_id || '',
        level: pos.level || 1,
        responsibilities: (pos.responsibilities || []).join('\n'),
        status: pos.status || 'active',
      });
    } else {
      setEditingPos(null);
      setFormData({
        position_code: '',
        position_name: '',
        department_id: departments[0]?._id || '',
        reports_to_position_id: '',
        level: 1,
        responsibilities: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingPos) {
        await organizationService.updatePosition(editingPos._id, payload);
      } else {
        await organizationService.createPosition(payload);
      }
      setIsModalOpen(false);
      loadPositions();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Code',
      key: 'position_code',
      cellClassName: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Designation Title',
      key: 'position_name',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.position_name}</div>
          <div className="text-xs text-indigo-600 font-medium">Level {row.level || 1}</div>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department_id',
      render: (val) => (
        <span className="font-medium text-slate-700">
          {val?.department_name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Reports To',
      key: 'reports_to_position_id',
      render: (val) => (
        <span className="text-xs text-slate-600">
          {val?.position_name ? val.position_name : 'Department Head / Executive'}
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
          title="Positions & Job Titles"
          subtitle="Define organizational designations, job levels, and hierarchy reporting relationships."
          breadcrumbs={[{ label: 'Organization' }, { label: 'Positions' }]}
        />
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Position
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by position title or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <DataTable
        columns={columns}
        data={positions}
        loading={loading}
        rowKey="_id"
        actions={(row) => (
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit Position"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? `Edit Position: ${editingPos.position_name}` : 'Create Position'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position Code *</label>
              <input
                type="text"
                required
                value={formData.position_code}
                onChange={(e) => setFormData({ ...formData, position_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase"
                placeholder="e.g. POS-RND-01"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position Title *</label>
              <input
                type="text"
                required
                value={formData.position_name}
                onChange={(e) => setFormData({ ...formData, position_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                placeholder="e.g. Senior R&D Chemist"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.department_name} ({d.department_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hierarchy Level (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reports To Position</label>
              <select
                value={formData.reports_to_position_id}
                onChange={(e) => setFormData({ ...formData, reports_to_position_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Department Head / Top --</option>
                {positions
                  .filter((p) => !editingPos || String(p._id) !== String(editingPos._id))
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.position_name} (L{p.level})
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Responsibilities (one per line)</label>
            <textarea
              rows="3"
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              placeholder="Conduct chemical batch testing&#10;Coordinate with production head"
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
              {saving ? 'Saving...' : editingPos ? 'Update Position' : 'Create Position'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PositionsPage;
