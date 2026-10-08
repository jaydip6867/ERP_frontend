import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, Eye, Trash2, CheckCircle2, AlertCircle, Calendar, Building2, Package, RefreshCw, PackageCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchase.service';
import { adminService } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';
import { ConvertToGrnModal } from '../../components/purchase/ConvertToGrnModal';

export const PurchaseOrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [grnModalPo, setGrnModalPo] = useState(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: '',
    warehouse_id: '',
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    payment_terms: 'Net 30 Days',
    is_interstate: false,
    notes: '',
    items: [
      {
        product_id: '',
        description: '',
        ordered_qty: 10,
        rate: 100,
        gst_rate: 18,
      },
    ],
  });

  useEffect(() => {
    loadOrders(pagination.page);
  }, [pagination.page, search, statusFilter]);

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getOrders({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.orders)
        ? res.data.orders
        : [];

      setOrders(list);

      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrerequisites = async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        purchaseService.getSuppliers({ limit: 100 }),
        adminService.getWarehouses(),
        productService.getProducts({ limit: 100 }),
      ]);

      const supList = Array.isArray(supRes.data)
        ? supRes.data
        : Array.isArray(supRes.data?.suppliers)
        ? supRes.data.suppliers
        : [];

      const whList = Array.isArray(whRes.data?.warehouses)
        ? whRes.data.warehouses
        : Array.isArray(whRes.data)
        ? whRes.data
        : [];

      const prodList = Array.isArray(prodRes.data?.products)
        ? prodRes.data.products
        : Array.isArray(prodRes.data)
        ? prodRes.data
        : [];

      setSuppliers(supList);
      setWarehouses(whList);
      setProducts(prodList);

      setFormData((prev) => ({
        ...prev,
        supplier_id: prev.supplier_id || (supList[0]?._id || supList[0]?.id || ''),
        warehouse_id: prev.warehouse_id || (whList[0]?._id || whList[0]?.id || ''),
        items: prev.items.map((it) => ({
          ...it,
          product_id: it.product_id || (prodList[0]?._id || prodList[0]?.id || ''),
          rate: it.rate || (prodList[0]?.cost_price || prodList[0]?.selling_price || 100),
        })),
      }));
    } catch (err) {
      console.error('Failed to load PO prerequisites:', err);
    }
  };

  const handleOpenCreate = () => {
    loadPrerequisites();
    setFormData({
      supplier_id: suppliers[0]?._id || suppliers[0]?.id || '',
      warehouse_id: warehouses[0]?._id || warehouses[0]?.id || '',
      po_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      payment_terms: 'Net 30 Days',
      is_interstate: false,
      notes: '',
      items: [
        {
          product_id: products[0]?._id || products[0]?.id || '',
          description: '',
          ordered_qty: 10,
          rate: products[0]?.cost_price || products[0]?.selling_price || 100,
          gst_rate: 18,
        },
      ],
    });
    setShowCreateModal(true);
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: defaultProd?._id || defaultProd?.id || '',
          description: '',
          ordered_qty: 10,
          rate: defaultProd?.cost_price || defaultProd?.selling_price || 100,
          gst_rate: 18,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      const target = { ...nextItems[index], [field]: value };

      if (field === 'product_id') {
        const prod = products.find((p) => (p._id || p.id) === value);
        if (prod) {
          target.rate = prod.cost_price || prod.selling_price || target.rate || 0;
          target.gst_rate = prod.tax_rate ?? target.gst_rate ?? 18;
          target.description = prod.product_name || '';
        }
      }

      nextItems[index] = target;
      return { ...prev, items: nextItems };
    });
  };

  // Live tax calculations
  const orderSummary = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    formData.items.forEach((item) => {
      const qty = Number(item.ordered_qty || 0);
      const rate = Number(item.rate || 0);
      const gstRate = Number(item.gst_rate || 0);
      const lineTaxable = qty * rate;
      const lineTax = (lineTaxable * gstRate) / 100;
      subtotal += lineTaxable;
      taxTotal += lineTax;
    });

    const grandTotal = Math.round(subtotal + taxTotal);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      grandTotal,
    };
  }, [formData.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id) {
      alert('Please select a supplier.');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].product_id) {
      alert('Please add at least one line item with a valid product.');
      return;
    }

    try {
      setSubmitting(true);
      await purchaseService.createOrder(formData);
      setShowCreateModal(false);
      loadOrders(1);
      alert('Purchase Order created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create Purchase Order');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter orders by search locally if needed
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const term = search.toLowerCase();
    return orders.filter((o) => {
      const poNum = (o.po_number || '').toLowerCase();
      const supName = (o.supplier_id?.supplier_name || '').toLowerCase();
      return poNum.includes(term) || supName.includes(term);
    });
  }, [orders, search]);

  const columns = [
    {
      header: 'PO Number',
      key: 'po_number',
      cellClassName: 'font-mono font-bold text-indigo-600',
    },
    {
      header: 'PO Date',
      key: 'po_date',
      render: (dt) => (dt ? new Date(dt).toLocaleDateString('en-IN') : '-'),
    },
    {
      header: 'Supplier / Vendor',
      key: 'supplier_id',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-900">{s?.supplier_name || 'N/A'}</p>
          <p className="text-xs text-slate-500 font-mono">{s?.gstin || s?.supplier_code || ''}</p>
        </div>
      ),
    },
    {
      header: 'Destination Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-700 font-medium">{w?.warehouse_name || 'Central Warehouse'}</span>,
    },
    {
      header: 'Items Count',
      key: 'items',
      render: (it) => <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{it?.length || 0} line(s)</span>,
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-mono font-bold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st || 'approved'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders (PO)"
        subtitle="Manage vendor purchase orders, procurement contracts, delivery terms, and partial receipt tracking."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Purchase Orders' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOrders(pagination.page)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by PO number, supplier name..."
        filters={[
          {
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Approved', value: 'approved' },
              { label: 'Partially Received', value: 'partial_received' },
              { label: 'Received / Closed', value: 'received' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={filteredOrders}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/purchase/orders/${row._id || row.id}`)}
        actions={(row) => (
          <div className="flex items-center gap-1.5 justify-end">
            {row.status !== 'completed' && row.status !== 'cancelled' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGrnModalPo(row);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                title="Convert to Goods Receipt (GRN)"
              >
                <PackageCheck className="w-3.5 h-3.5 flex-shrink-0" />
                Convert to GRN
              </button>
            )}
            <button
              onClick={() => navigate(`/purchase/orders/${row._id || row.id}`)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="View PO Details"
            >
              <Eye className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        )}
      />

      {/* Convert to GRN Modal */}
      {grnModalPo && (
        <ConvertToGrnModal
          isOpen={Boolean(grnModalPo)}
          onClose={() => setGrnModalPo(null)}
          purchaseOrder={grnModalPo}
          onSuccess={() => loadOrders(pagination.page)}
        />
      )}

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Vendor Purchase Order"
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Vendor *</label>
                <select
                  required
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.supplier_name} ({s.supplier_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Warehouse</label>
                <select
                  value={formData.warehouse_id}
                  onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w._id || w.id} value={w._id || w.id}>
                      {w.warehouse_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PO Date</label>
                <input
                  type="date"
                  required
                  value={formData.po_date}
                  onChange={(e) => setFormData({ ...formData, po_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
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
                  <option value="Against Delivery (COD)">Against Delivery (COD)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_interstate"
                  checked={formData.is_interstate}
                  onChange={(e) => setFormData({ ...formData, is_interstate: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="is_interstate" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Interstate Supply (IGST Applicable)
                </label>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Order Line Items
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5 min-w-[200px]">Product / Material *</th>
                      <th className="p-2.5 w-24">Qty *</th>
                      <th className="p-2.5 w-28">Unit Rate (₹) *</th>
                      <th className="p-2.5 w-24">GST %</th>
                      <th className="p-2.5 w-28 text-right">Taxable (₹)</th>
                      <th className="p-2.5 w-28 text-right">Total (₹)</th>
                      <th className="p-2.5 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.items.map((item, idx) => {
                      const qty = Number(item.ordered_qty || 0);
                      const rate = Number(item.rate || 0);
                      const gst = Number(item.gst_rate || 0);
                      const taxable = qty * rate;
                      const lineTotal = taxable + (taxable * gst) / 100;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <select
                              required
                              value={item.product_id}
                              onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs outline-none"
                            >
                              <option value="">Select Material / Item</option>
                              {products.map((p) => (
                                <option key={p._id || p.id} value={p._id || p.id}>
                                  {p.product_name} ({p.product_code})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              required
                              value={item.ordered_qty}
                              onChange={(e) => handleItemChange(idx, 'ordered_qty', e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              value={item.rate}
                              onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.gst_rate}
                              onChange={(e) => handleItemChange(idx, 'gst_rate', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-1.5 text-xs outline-none"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td className="p-2 text-right font-mono font-medium text-slate-700">
                            ₹{taxable.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              disabled={formData.items.length <= 1}
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Delivery required within 10 days. Deliver to gate no. 2."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Taxable Amount):</span>
                  <span className="font-mono font-semibold">₹{orderSummary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{formData.is_interstate ? 'IGST Total:' : 'CGST + SGST Total:'}</span>
                  <span className="font-mono font-semibold">₹{orderSummary.taxTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono text-indigo-600">₹{orderSummary.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating PO...' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseOrdersListPage;
