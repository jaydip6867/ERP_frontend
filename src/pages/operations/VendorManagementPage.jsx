import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, ShieldCheck, Phone, Mail, Building2, RefreshCw } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';
import { toast } from 'react-toastify';

export const VendorManagementPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    email: '',
    mobile: '',
    gstin: '',
    category: 'raw_materials',
    payment_terms: 'Net 30 Days',
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getVendors();
      const list = Array.isArray(res.data?.vendors)
        ? res.data.vendors
        : Array.isArray(res.data)
        ? res.data
        : [];
      setVendors(list);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      await purchaseService.createSupplier(formData);
      toast.success('Vendor / Subcontractor registered successfully');
      setShowModal(false);
      loadVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add vendor');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Vendor, Subcontractor & Mill Network"
          subtitle="Yarn spinning mills, dye houses, printing subcontractors, packaging suppliers, and delivery SLAs."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Vendors' }]}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={loadVendors}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Vendor / Subcontractor
              </button>
            </div>
          }
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Vendor / Mill</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Category / Service</th>
                <th className="px-5 py-3">Quality Rating</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading vendor partners...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No vendors registered yet.</td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v._id || v.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{v.supplier_name || v.vendor_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{v.supplier_code || v.vendor_code}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <div className="font-medium text-slate-800">{v.contact_person || 'N/A'}</div>
                      <div>{v.mobile || v.phone || v.email || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium capitalize">
                      {v.category?.replace(/_/g, ' ') || 'Textile Mill'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-amber-500">
                      ★ {v.rating || 4.8} / 5
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        Active Partner
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Register Vendor / Subcontractor"
          size="md"
        >
          <form onSubmit={handleCreateVendor} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Mill Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vardhman Textiles Dyeing Unit"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Mukesh Patel"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="mill@vardhman.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  placeholder="24AAACA1234F1Z8"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Service</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="raw_materials">Yarn Spinning / Raw Materials</option>
                  <option value="services">Dyeing & Printing Mill</option>
                  <option value="packaging">Packaging Supplies</option>
                  <option value="machinery">Machinery & Spares</option>
                  <option value="consumables">Consumables & Hardware</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 45 Days">Net 45 Days</option>
                  <option value="Immediate / Advance">Immediate / Advance</option>
                  <option value="Against Delivery">Against Delivery</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer"
              >
                Register Vendor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default VendorManagementPage;
