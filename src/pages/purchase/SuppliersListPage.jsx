import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Star,
  Phone,
  Mail,
  Building,
  Eye,
  Edit2,
  MapPin,
  IndianRupee,
  ShoppingBag,
  FileText,
  CreditCard,
  ExternalLink,
  Calendar,
  Tag,
} from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const SuppliersListPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Quick category creation inside supplier modal
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Supplier dossier view modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [supplierPendingPayment, setSupplierPendingPayment] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    loadCategories();
  }, []);

  useEffect(() => {
    loadSuppliers(pagination.page);
  }, [pagination.page, search, categoryFilter]);

  const loadCategories = async () => {
    try {
      const res = await purchaseService.getCategories();
      const list = Array.isArray(res.data) ? res.data : [];
      setCategoriesList(list);
    } catch (err) {
      console.error('Failed to load supplier categories:', err);
    }
  };

  const handleCreateQuickCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setSavingCat(true);
      const res = await purchaseService.createCategory({ name: newCatName.trim() });
      const newCat = res.data;
      await loadCategories();
      setFormData((prev) => ({
        ...prev,
        category: newCat.code || newCat.name,
        category_id: newCat._id,
      }));
      setNewCatName('');
      setShowQuickCategoryModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSavingCat(false);
    }
  };

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

  const handleOpenView = async (sup) => {
    setViewSupplier(sup);
    setShowViewModal(true);
    setLoadingDetails(true);
    setSupplierOrders([]);
    setSupplierPendingPayment(sup.current_balance || 0);

    try {
      const res = await purchaseService.getSupplierById(sup._id || sup.id);
      const data = res.data || {};
      setViewSupplier((prev) => ({ ...prev, ...data }));
      setSupplierOrders(data.purchase_orders || []);
      setSupplierPendingPayment(data.pending_payment ?? sup.current_balance ?? 0);
    } catch (err) {
      console.error('Failed to load supplier details:', err);
      try {
        const poRes = await purchaseService.getOrders({ supplier_id: sup._id || sup.id, limit: 50 });
        const orders = Array.isArray(poRes.data)
          ? poRes.data
          : Array.isArray(poRes.data?.orders)
          ? poRes.data.orders
          : [];
        setSupplierOrders(orders);
      } catch (poErr) {
        console.error('Failed to fetch POs:', poErr);
      }
    } finally {
      setLoadingDetails(false);
    }
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
      header: 'Pending Balance',
      key: 'current_balance',
      render: (bal) => (
        <span className={`text-xs font-semibold font-mono ${bal > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
          ₹{(bal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/purchase/categories')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer transition"
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              Supplier Categories
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>
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
            options: categoriesList.map((c) => ({
              label: c.name,
              value: c.code || c.name,
            })),
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
        onRowClick={(row) => handleOpenView(row)}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => handleOpenView(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="View Supplier Dossier & POs"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickCategoryModal(true)}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const selCat = categoriesList.find(
                      (c) => c.code === e.target.value || c.name === e.target.value || c._id === e.target.value
                    );
                    setFormData({
                      ...formData,
                      category: e.target.value,
                      category_id: selCat?._id || null,
                    });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  {categoriesList.length > 0 ? (
                    categoriesList.map((c) => (
                      <option key={c._id || c.code} value={c.code || c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="RAW_MATERIALS">Raw Materials</option>
                      <option value="CONSUMABLES">Consumables & Hardware</option>
                      <option value="PACKAGING">Packaging</option>
                      <option value="MACHINERY">Machinery & Spares</option>
                      <option value="SERVICES">Services</option>
                      <option value="GENERAL">General</option>
                    </>
                  )}
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

      {/* Supplier Dossier & Purchase Orders Modal */}
      {showViewModal && viewSupplier && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`Supplier Dossier: ${viewSupplier.supplier_name}`}
          subtitle={`Code: ${viewSupplier.supplier_code || 'N/A'} • GSTIN: ${viewSupplier.gstin || 'Unregistered'}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 text-sm">
            {/* Top Cards: Financials & Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 uppercase tracking-wide">
                  <IndianRupee className="w-4 h-4" /> Pending Payment
                </span>
                <p className="text-2xl font-black text-rose-700 mt-2 font-mono">
                  ₹{Number(supplierPendingPayment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-rose-600/80 mt-1">Outstanding vendor bills / balance</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShoppingBag className="w-4 h-4" /> Purchase Orders
                </span>
                <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">
                  {supplierOrders.length} {supplierOrders.length === 1 ? 'Order' : 'Orders'}
                </p>
                <p className="text-xs text-indigo-600/80 mt-1">Linked POs created under this supplier</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                  <Star className="w-4 h-4 text-amber-500 fill-current" /> Rating & Terms
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-slate-900">{viewSupplier.rating || 4}/5 ★</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 font-medium capitalize">
                    {viewSupplier.category?.replace(/_/g, ' ') || 'Raw Materials'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{viewSupplier.payment_terms || 'Net 30 Days'}</p>
              </div>
            </div>

            {/* Supplier Information Details */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600" /> Supplier Profile & Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Contact Person</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewSupplier.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile / Phone</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {viewSupplier.mobile || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {viewSupplier.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">PAN Number</span>
                  <p className="font-mono font-semibold text-slate-800 text-sm mt-0.5">{viewSupplier.pan || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Registered Facility Address
                  </span>
                  <p className="text-slate-700 mt-0.5">
                    {viewSupplier.address?.address_line1 ? (
                      <>
                        {viewSupplier.address.address_line1}, {viewSupplier.address.city}, {viewSupplier.address.state} - {viewSupplier.address.pincode}
                      </>
                    ) : (
                      'Address not configured'
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Bank Settlement Account
                  </span>
                  <p className="text-slate-700 mt-0.5 font-mono">
                    {viewSupplier.bank_details?.bank_name ? (
                      <>
                        {viewSupplier.bank_details.bank_name} &bull; A/C: {viewSupplier.bank_details.account_number || 'N/A'} &bull; IFSC: {viewSupplier.bank_details.ifsc_code || 'N/A'}
                      </>
                    ) : (
                      'Bank account details not specified'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Orders List Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Purchase Orders under {viewSupplier.supplier_name}
                  </h4>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">
                    {supplierOrders.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    navigate('/purchase/orders/create');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create PO
                </button>
              </div>

              {loadingDetails ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mb-2" />
                  <p className="text-xs">Loading purchase orders history...</p>
                </div>
              ) : supplierOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-xs">
                  No purchase orders created for this supplier yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">PO Number</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Items / Products</th>
                        <th className="py-2.5 px-3 text-right">Grand Total</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supplierOrders.map((po) => (
                        <tr key={po._id || po.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                            {po.po_number}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {po.po_date ? new Date(po.po_date).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {po.items?.length || 0} items
                            {po.items?.[0]?.product_id?.product_name && (
                              <span className="text-slate-400 text-[11px] block truncate max-w-[200px]">
                                {po.items[0].product_id.product_name}
                                {po.items.length > 1 ? ` +${po.items.length - 1} more` : ''}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{Number(po.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <StatusBadge status={po.status} />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setShowViewModal(false);
                                navigate(`/purchase/orders/${po._id || po.id}`);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEdit(viewSupplier);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Supplier Info
              </button>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Category Modal */}
      <Modal
        isOpen={showQuickCategoryModal}
        onClose={() => setShowQuickCategoryModal(false)}
        title="Create New Supplier Category"
        size="sm"
      >
        <form onSubmit={handleCreateQuickCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electrical Components"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowQuickCategoryModal(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCat || !newCatName.trim()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition shadow-sm"
            >
              {savingCat ? 'Creating...' : 'Create & Select'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuppliersListPage;
