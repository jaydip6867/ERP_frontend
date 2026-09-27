import React, { useState, useEffect } from 'react';
import { GitBranch, Warehouse, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const BranchesWarehousesPage = () => {
  const [activeTab, setActiveTab] = useState('branches');
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    branch_name: '',
    branch_code: '',
    email: '',
    phone: '',
    gstin: '',
    city: '',
    state: '',
    is_head_office: false,
  });

  // Warehouse Modal
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [whForm, setWhForm] = useState({
    warehouse_name: '',
    warehouse_code: '',
    branch_id: '',
    warehouse_type: 'central',
    city: '',
    state: '',
    is_primary: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, wRes] = await Promise.all([
        adminService.getBranches(),
        adminService.getWarehouses(),
      ]);
      setBranches(bRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (err) {
      console.error('Failed to load branches and warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingBranch) {
        await adminService.updateBranch(editingBranch._id, branchForm);
      } else {
        await adminService.createBranch(branchForm);
      }
      setIsBranchModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWh = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingWh) {
        await adminService.updateWarehouse(editingWh._id, whForm);
      } else {
        await adminService.createWarehouse(whForm);
      }
      setIsWhModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save warehouse');
    } finally {
      setSaving(false);
    }
  };

  const branchColumns = [
    { header: 'Code', key: 'branch_code', cellClassName: 'font-mono font-medium text-slate-800' },
    {
      header: 'Branch Name',
      key: 'branch_name',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{val}</span>
          {row.is_head_office && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              Head Office
            </span>
          )}
        </div>
      ),
    },
    { header: 'City', key: 'city' },
    { header: 'State', key: 'state' },
    { header: 'GSTIN', key: 'gstin', cellClassName: 'font-mono' },
    { header: 'Contact Email', key: 'email' },
  ];

  const whColumns = [
    { header: 'Code', key: 'warehouse_code', cellClassName: 'font-mono font-medium text-slate-800' },
    {
      header: 'Warehouse Name',
      key: 'warehouse_name',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{val}</span>
          {row.is_primary && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              Primary Hub
            </span>
          )}
        </div>
      ),
    },
    { header: 'Branch', key: 'branch_id', render: (val) => val?.branch_name || '—' },
    { header: 'Type', key: 'warehouse_type', render: (val) => <span className="capitalize">{val}</span> },
    { header: 'City', key: 'city' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Branches & Warehouses"
        subtitle="Configure physical corporate locations, regional offices, storage depots, and primary distribution hubs."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Locations' }]}
        actions={
          activeTab === 'branches' ? (
            <button
              onClick={() => {
                setEditingBranch(null);
                setBranchForm({
                  branch_name: '',
                  branch_code: '',
                  email: '',
                  phone: '',
                  gstin: '',
                  city: '',
                  state: '',
                  is_head_office: false,
                });
                setIsBranchModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Branch
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingWh(null);
                setWhForm({
                  warehouse_name: '',
                  warehouse_code: '',
                  branch_id: branches[0]?._id || '',
                  warehouse_type: 'central',
                  city: '',
                  state: '',
                  is_primary: false,
                });
                setIsWhModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Warehouse
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'branches'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Branches ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'warehouses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          Warehouses & Depots ({warehouses.length})
        </button>
      </div>

      {activeTab === 'branches' ? (
        <DataTable
          columns={branchColumns}
          data={branches}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => {
                setEditingBranch(row);
                setBranchForm({ ...row });
                setIsBranchModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        />
      ) : (
        <DataTable
          columns={whColumns}
          data={warehouses}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => {
                setEditingWh(row);
                setWhForm({
                  ...row,
                  branch_id: row.branch_id?._id || row.branch_id || '',
                });
                setIsWhModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        />
      )}

      {/* Branch Modal */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title={editingBranch ? 'Edit Branch' : 'Add Branch Location'}
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
              <input
                type="text"
                required
                value={branchForm.branch_name}
                onChange={(e) => setBranchForm({ ...branchForm, branch_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code *</label>
              <input
                type="text"
                required
                value={branchForm.branch_code}
                onChange={(e) => setBranchForm({ ...branchForm, branch_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={branchForm.city}
                onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={branchForm.state}
                onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={branchForm.gstin}
                onChange={(e) => setBranchForm({ ...branchForm, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={branchForm.email}
                onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={branchForm.is_head_office}
                onChange={(e) => setBranchForm({ ...branchForm, is_head_office: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700">Designate as Corporate Head Office</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save Branch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Warehouse Modal */}
      <Modal
        isOpen={isWhModalOpen}
        onClose={() => setIsWhModalOpen(false)}
        title={editingWh ? 'Edit Warehouse' : 'Add Warehouse'}
      >
        <form onSubmit={handleSaveWh} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Name *</label>
              <input
                type="text"
                required
                value={whForm.warehouse_name}
                onChange={(e) => setWhForm({ ...whForm, warehouse_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Code *</label>
              <input
                type="text"
                required
                value={whForm.warehouse_code}
                onChange={(e) => setWhForm({ ...whForm, warehouse_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Branch *</label>
              <select
                required
                value={whForm.branch_id}
                onChange={(e) => setWhForm({ ...whForm, branch_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={whForm.warehouse_type}
                onChange={(e) => setWhForm({ ...whForm, warehouse_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="central">Central Distribution Center</option>
                <option value="regional">Regional Depot</option>
                <option value="retail">Retail Store Stockroom</option>
                <option value="transit">Transit Hub</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={whForm.city}
                onChange={(e) => setWhForm({ ...whForm, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={whForm.state}
                onChange={(e) => setWhForm({ ...whForm, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={whForm.is_primary}
                onChange={(e) => setWhForm({ ...whForm, is_primary: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700">Set as Primary Central Distribution Hub</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWhModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save Warehouse'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default BranchesWarehousesPage;
