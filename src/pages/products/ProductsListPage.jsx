import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';
import { FilterBar } from '../../components/shell/FilterBar';

export const ProductsListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Lookups
  const [lookups, setLookups] = useState({ categories: [], brands: [], uoms: [], hsns: [], productTypes: [] });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    category_id: '',
    brand_id: '',
    uom_id: '',
    hsn_id: '',
    gst_rate: 18,
    purchase_rate: 0,
    selling_rate: 0,
    product_type: 'finished_good',
    opening_stock: 0,
    reorder_level: 10,
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadProducts(pagination.page);
  }, [pagination.page, search, categoryFilter, typeFilter, statusFilter]);

  const loadLookups = async () => {
    try {
      const res = await productService.getLookups();
      setLookups(res.data || { categories: [], brands: [], uoms: [], hsns: [], productTypes: [] });
    } catch (err) {
      console.error('Failed to load product lookups:', err);
    }
  };

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        page,
        limit: 10,
        search,
        category_id: categoryFilter || undefined,
        product_type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setProducts(res.data || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      sku: '',
      category_id: lookups.categories[0]?._id || '',
      brand_id: lookups.brands[0]?._id || '',
      uom_id: lookups.uoms[0]?._id || '',
      hsn_id: lookups.hsns[0]?._id || '',
      gst_rate: 18,
      purchase_rate: 0,
      selling_rate: 0,
      product_type: 'finished_good',
      opening_stock: 0,
      reorder_level: 10,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      product_name: p.product_name,
      sku: p.sku,
      category_id: p.category_id?._id || p.category_id || '',
      brand_id: p.brand_id?._id || p.brand_id || '',
      uom_id: p.uom_id?._id || p.uom_id || '',
      hsn_id: p.hsn_id?._id || p.hsn_id || '',
      gst_rate: p.gst_rate ?? 18,
      purchase_rate: p.purchase_rate ?? 0,
      selling_rate: p.selling_rate ?? 0,
      product_type: p.product_type || 'finished_good',
      opening_stock: p.opening_stock ?? 0,
      reorder_level: p.reorder_level ?? 10,
      status: p.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
      } else {
        await productService.createProduct(formData);
      }
      setIsModalOpen(false);
      loadProducts(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'SKU / Code',
      key: 'sku',
      cellClassName: 'font-mono font-medium text-slate-800',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 block">{val}</span>
          <span className="text-xs text-slate-400 font-mono">{row.product_code}</span>
        </div>
      ),
    },
    {
      header: 'Product Name',
      key: 'product_name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val}</span>
          <span className="text-xs text-slate-500">
            {row.category_id?.category_name} {row.brand_id ? `• ${row.brand_id.brand_name}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'product_type',
      render: (val) => (
        <span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {val?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Current Stock',
      key: 'current_stock',
      render: (val, row) => (
        <span
          className={`font-semibold ${
            val <= row.reorder_level ? 'text-amber-600 flex items-center gap-1' : 'text-slate-900'
          }`}
        >
          {val <= row.reorder_level && <AlertCircle className="w-3.5 h-3.5" />}
          {val} {row.uom_id?.uom_code || 'PCS'}
        </span>
      ),
    },
    {
      header: 'Selling Rate',
      key: 'selling_rate',
      render: (val) => <span className="font-bold text-slate-900">₹{val?.toLocaleString()}</span>,
    },
    {
      header: 'GST Rate',
      key: 'gst_rate',
      render: (val) => `${val}%`,
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Products & Master Catalog"
        subtitle="Manage inventory items, SKUs, sales rates, purchase costs, and real-time warehouse stock balances."
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Products' }]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search products by name, code, SKU..."
        filters={[
          {
            label: 'All Categories',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: lookups.categories.map((c) => ({ label: c.category_name, value: c._id })),
          },
          {
            label: 'All Product Types',
            value: typeFilter,
            onChange: setTypeFilter,
            options: lookups.productTypes,
          },
          {
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Discontinued', value: 'discontinued' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setCategoryFilter('');
          setTypeFilter('');
          setStatusFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => loadProducts(page)}
        onRowClick={(row) => handleOpenEdit(row)}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="View / Edit Product Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Edit Product"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.product_name}` : 'Create New Product'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Item Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {lookups.categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">None / Generic</option>
                {lookups.brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brand_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure (UOM) *</label>
              <select
                required
                value={formData.uom_id}
                onChange={(e) => setFormData({ ...formData, uom_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select UOM</option>
                {lookups.uoms.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.uom_name} ({u.uom_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Rate (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.selling_rate}
                onChange={(e) => setFormData({ ...formData, selling_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.purchase_rate}
                onChange={(e) => setFormData({ ...formData, purchase_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
              <select
                value={formData.hsn_id}
                onChange={(e) => setFormData({ ...formData, hsn_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select HSN</option>
                {lookups.hsns.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.hsn_code} ({h.description})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Type</label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {lookups.productTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level Warning</label>
              <input
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {!editingProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.opening_stock}
                  onChange={(e) => setFormData({ ...formData, opening_stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
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
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ProductsListPage;
