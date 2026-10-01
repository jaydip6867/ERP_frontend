import React, { useState, useEffect } from 'react';
import { Users, Plus, Star, Phone, Mail, Building, Eye, Edit2, MapPin } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';

export const SuppliersListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    email: '',
    mobile: '',
    gstin: '',
    pan: '',
    category: 'raw_materials',
    rating: 4,
    payment_terms: 'Net 30 Days',
    address: {
      address_line1: '',
      city: '',
      state: 'Gujarat',
      pincode: '',
    },
  });

  useEffect(() => {
    loadSuppliers(pagination.page);
  }, [pagination.page, search, categoryFilter]);

  const loadSuppliers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getSuppliers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.suppliers)
        ? res.data.suppliers
        : [];

      setSuppliers(list);

      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      supplier_name: '',
      contact_person: '',
      email: '',
      mobile: '',
      gstin: '',
      pan: '',
      category: 'raw_materials',
      rating: 4,
      payment_terms: 'Net 30 Days',
      address: {
        address_line1: '',
        city: '',
        state: 'Gujarat',
        pincode: '',
      },
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      supplier_name: sup.supplier_name || '',
      contact_person: sup.contact_person || '',
      email: sup.email || '',
      mobile: sup.mobile || '',
      gstin: sup.gstin || '',
      pan: sup.pan || '',
      category: sup.category || 'raw_materials',
      rating: sup.rating ?? 4,
      payment_terms: sup.payment_terms || 'Net 30 Days',
      address: {
        address_line1: sup.address?.address_line1 || '',
        city: sup.address?.city || '',
        state: sup.address?.state || 'Gujarat',
        pincode: sup.address?.pincode || '',
      },
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const supplierId = editingSupplier?._id || editingSupplier?.id;
      if (editingSupplier) {
        await purchaseService.updateSupplier(supplierId, formData);
      } else {
        await purchaseService.createSupplier(formData);
      }
      setShowModal(false);
      loadSuppliers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving supplier');
    }
  };

  const columns = [
    {
      header: 'Supplier Details',
      key: 'supplier_name',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <p className="text-xs font-mono text-slate-500">
            {row.supplier_code} &bull; {row.gstin || 'Unregistered'}
          </p>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (cp, row) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium text-slate-800">{cp || 'N/A'}</p>
          <p className="text-slate-500">{row.mobile || row.email || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (cat) => (
        <span className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {cat?.replace(/_/g, ' ') || 'General'}
        </span>
      ),
    },
    {
      header: 'Location',
      key: 'address',
      render: (addr) => (
        <span className="text-xs text-slate-600">
          {addr?.city ? `${addr.city}, ${addr.state || ''}` : addr?.state || 'India'}
        </span>
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
      header: 'Terms',
      key: 'payment_terms',
      render: (pt) => <span className="text-xs text-slate-600">{pt || 'Net 30 Days'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Vendors Directory"
        subtitle="Manage vendor masters, ratings, GST compliance, and payment terms."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Suppliers' },
        ]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search supplier name, code, GSTIN..."
        filters={[
          {
            label: 'All Categories',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'Raw Materials', value: 'raw_materials' },
              { label: 'Consumables & Hardware', value: 'consumables' },
              { label: 'Packaging', value: 'packaging' },
              { label: 'Machinery & Spares', value: 'machinery' },
              { label: 'Services', value: 'services' },
              { label: 'General', value: 'general' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setCategoryFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={Array.isArray(suppliers) ? suppliers : []}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => handleOpenEdit(row)}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="View / Edit Supplier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingSupplier ? `Edit Supplier: ${editingSupplier.supplier_name}` : 'Register New Supplier'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Reliance Industries Limited"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
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
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vendor@danzaerp.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="24AAACA1234F1Z8"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="raw_materials">Raw Materials</option>
                  <option value="consumables">Consumables & Hardware</option>
                  <option value="packaging">Packaging</option>
                  <option value="machinery">Machinery & Spares</option>
                  <option value="services">Services</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="Immediate / Advance">Immediate / Advance</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 45 Days">Net 45 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                  <option value="Against Delivery">Against Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Rating</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="5">5 ★ - Grade A (Preferred)</option>
                  <option value="4">4 ★ - Grade B (Reliable)</option>
                  <option value="3">3 ★ - Grade C (Standard)</option>
                  <option value="2">2 ★ - Needs Improvement</option>
                  <option value="1">1 ★ - Critical Attention</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Address & Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Street / Facility Address"
                  value={formData.address.address_line1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, address_line1: e.target.value },
                    })
                  }
                  className="w-full sm:col-span-3 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="City (e.g. Surat)"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="State (e.g. Gujarat)"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={formData.address.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
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
                {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SuppliersListPage;
