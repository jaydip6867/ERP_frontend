import React, { useState, useEffect } from 'react';
import { Users, Plus, Star, Phone, Mail, Building, Eye, Edit2 } from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    email: '',
    mobile: '',
    gstin: '',
    category: 'raw_materials',
    rating: 4,
    payment_terms: 'Net 30 Days',
  });

  useEffect(() => {
    loadSuppliers(pagination.page);
  }, [pagination.page, search]);

  const loadSuppliers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getSuppliers({ page, limit: 10, search });
      setSuppliers(res.data?.suppliers || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error(err);
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
      category: 'raw_materials',
      rating: 4,
      payment_terms: 'Net 30 Days',
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
      category: sup.category || 'raw_materials',
      rating: sup.rating ?? 4,
      payment_terms: sup.payment_terms || 'Net 30 Days',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await purchaseService.updateSupplier(editingSupplier._id, formData);
      } else {
        await purchaseService.createSupplier(formData);
      }
      setShowModal(false);
      loadSuppliers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving supplier');
    }
  };

  const columns = [
    {
      header: 'Supplier Details',
      key: 'supplier_name',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <p className="text-xs font-mono text-slate-500">{row.supplier_code} &bull; {row.gstin || 'Unregistered'}</p>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (cp, row) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium text-slate-800">{cp || 'N/A'}</p>
          <p>{row.mobile || row.email}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (cat) => <span className="capitalize text-xs font-medium text-slate-700">{cat?.replace('_', ' ')}</span>,
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
      render: (pt) => <span className="text-xs text-slate-600">{pt}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Vendors Directory"
        subtitle="Manage vendor masters, ratings, GST compliance, and payment terms."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Suppliers' },
        ]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        }
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search supplier name, code, GSTIN..." filters={[]} />

      <DataTable
        columns={columns}
        data={suppliers}
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
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Edit Supplier"
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
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
              <input
                type="text"
                required
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  placeholder="24AAACA1234F1Z8"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="raw_materials">Raw Materials</option>
                  <option value="consumables">Consumables & Hardware</option>
                  <option value="packaging">Packaging</option>
                  <option value="machinery">Machinery & Spares</option>
                  <option value="services">Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="5">5 - Excellent (A-grade)</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Standard</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
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
