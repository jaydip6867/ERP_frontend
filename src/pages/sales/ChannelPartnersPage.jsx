import React, { useState, useEffect } from 'react';
import { Users2, Plus, Edit2, Percent, CheckCircle2 } from 'lucide-react';
import { salesService } from '../../services/sales.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const ChannelPartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    partner_name: '',
    partner_type: 'distributor',
    contact_person: '',
    email: '',
    phone: '',
    commission_percent: 5,
    city: '',
    state: '',
    gstin: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await salesService.getChannelPartners();
      setPartners(res.data || []);
    } catch (err) {
      console.error('Failed to load channel partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingPartner) {
        await salesService.updateChannelPartner(editingPartner._id, formData);
      } else {
        await salesService.createChannelPartner(formData);
      }
      setIsModalOpen(false);
      loadPartners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save channel partner');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Partner Code', key: 'partner_code', cellClassName: 'font-mono font-bold text-slate-800' },
    {
      header: 'Partner Firm Name',
      key: 'partner_name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val}</span>
          <span className="text-xs text-slate-400">{row.contact_person} • {row.phone}</span>
        </div>
      ),
    },
    { header: 'Partner Type', key: 'partner_type', render: (val) => <span className="capitalize">{val}</span> },
    {
      header: 'Commission %',
      key: 'commission_percent',
      render: (val) => <span className="font-bold text-indigo-600 font-mono">{val}%</span>,
    },
    { header: 'City', key: 'city' },
    { header: 'GSTIN', key: 'gstin', cellClassName: 'font-mono text-xs' },
    { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Channel Partners & Affiliates"
        subtitle="Manage authorized external dealers, regional sales agents, and commercial commission percentages."
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Channel Partners' }]}
        actions={
          <button
            onClick={() => {
              setEditingPartner(null);
              setFormData({
                partner_name: '',
                partner_type: 'distributor',
                contact_person: '',
                email: '',
                phone: '',
                commission_percent: 5,
                city: '',
                state: '',
                gstin: '',
                status: 'active',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={partners}
        loading={loading}
        actions={(row) => (
          <button
            onClick={() => {
              setEditingPartner(row);
              setFormData({ ...row });
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPartner ? 'Edit Channel Partner' : 'Onboard Channel Partner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Firm Name *</label>
              <input
                type="text"
                required
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Type</label>
              <select
                value={formData.partner_type}
                onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="distributor">Distributor</option>
                <option value="dealer">Dealer</option>
                <option value="agent">Sales Agent</option>
                <option value="reseller">Reseller</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Key Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commission Rate (%) *</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                required
                value={formData.commission_percent}
                onChange={(e) => setFormData({ ...formData, commission_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono"
              />
            </div>
          </div>

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
              {saving ? 'Saving...' : 'Save Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ChannelPartnersPage;
