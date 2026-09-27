import React, { useState, useEffect } from 'react';
import { Truck, Plus, Star, Phone } from 'lucide-react';
import { dispatchService } from '../../services/dispatch.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const TransportersPage = () => {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    transporter_name: '',
    contact_person: '',
    phone: '',
    transporter_id_gst: '',
    rating: 4,
  });

  useEffect(() => {
    loadTransporters();
  }, []);

  const loadTransporters = async () => {
    try {
      setLoading(true);
      const res = await dispatchService.getTransporters();
      setTransporters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatchService.createTransporter(formData);
      setShowModal(false);
      loadTransporters();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding transporter');
    }
  };

  const columns = [
    {
      header: 'Transporter Name',
      key: 'transporter_name',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <p className="text-xs font-mono text-slate-500">{row.transporter_code} &bull; {row.transporter_id_gst || 'No GSTIN'}</p>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (cp, row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{cp || 'N/A'}</p>
          <p className="text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (r) => (
        <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{r || 4}/5</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
          {st?.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transporters & Freight Carriers"
        subtitle="Manage logistics partners, fleet types, and GST transporter IDs."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders & Delivery', href: '/dispatch' },
          { label: 'Transporters' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Transporter
          </button>
        }
      />

      <DataTable columns={columns} data={transporters} loading={loading} />

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Transporter" size="md">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transporter / Logistics Name *</label>
              <input
                type="text"
                required
                value={formData.transporter_name}
                onChange={(e) => setFormData({ ...formData, transporter_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transporter GSTIN / ID</label>
              <input
                type="text"
                value={formData.transporter_id_gst}
                onChange={(e) => setFormData({ ...formData, transporter_id_gst: e.target.value.toUpperCase() })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Transporter
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TransportersPage;
