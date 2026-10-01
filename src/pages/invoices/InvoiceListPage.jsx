import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Eye,
  Printer,
  Plus,
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';

export const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Create Invoice Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    payment_terms: 'Net 30 Days',
    is_interstate: false,
    items: [
      {
        product_id: '',
        quantity: 1,
        rate: 0,
        discount_percent: 0,
        gst_rate: 18,
      },
    ],
  });

  useEffect(() => {
    loadInvoices(pagination.page);
    loadMetrics();
  }, [pagination.page, search, paymentFilter]);

  const loadMetrics = async () => {
    try {
      const res = await invoiceService.getDashboardMetrics();
      setMetrics(res.data || null);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const loadInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices({
        page,
        limit: 10,
        search,
        payment_status: paymentFilter || undefined,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.invoices)
        ? res.data.invoices
        : [];

      setInvoices(list);

      if (res.meta) {
        setPagination({
          page: res.meta.page || 1,
          limit: res.meta.limit || 10,
          total: res.meta.total || list.length,
          totalPages: res.meta.totalPages || Math.ceil((res.meta.total || list.length) / 10),
        });
      } else {
        setPagination((prev) => ({
          ...prev,
          total: list.length,
          totalPages: Math.ceil(list.length / prev.limit) || 1,
        }));
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        productService.getProducts({ limit: 100 }),
      ]);
      const custList = Array.isArray(custRes.data)
        ? custRes.data
        : Array.isArray(custRes.data?.customers)
        ? custRes.data.customers
        : Array.isArray(custRes.data?.items)
        ? custRes.data.items
        : [];
      const prodList = Array.isArray(prodRes.data)
        ? prodRes.data
        : Array.isArray(prodRes.data?.products)
        ? prodRes.data.products
        : Array.isArray(prodRes.data?.items)
        ? prodRes.data.items
        : [];

      setCustomers(custList);
      setProducts(prodList);

      setFormData({
        customer_id: custList[0]?._id || '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        payment_terms: 'Net 30 Days',
        is_interstate: false,
        items: [
          {
            product_id: prodList[0]?._id || '',
            quantity: 1,
            rate: prodList[0]?._selling_price || prodList[0]?.price || 100,
            discount_percent: 0,
            gst_rate: 18,
          },
        ],
      });
      setCreateModalOpen(true);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
      setCreateModalOpen(true);
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: products[0]?._id || '',
          quantity: 1,
          rate: products[0]?.selling_price || 100,
          discount_percent: 0,
          gst_rate: 18,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === 'product_id') {
        const prod = products.find((p) => p._id === value);
        if (prod) {
          newItems[index].rate = prod.selling_price || prod.price || newItems[index].rate;
        }
      }
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    formData.items.forEach((item) => {
      const lineBase = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const discount = (lineBase * (Number(item.discount_percent) || 0)) / 100;
      const taxable = Math.max(0, lineBase - discount);
      const tax = (taxable * (Number(item.gst_rate) || 0)) / 100;
      subtotal += taxable;
      taxTotal += tax;
    });
    return {
      subtotal,
      taxTotal,
      grandTotal: Math.round(subtotal + taxTotal),
    };
  };

  const totals = calculateTotals();

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        items: formData.items.map((it) => {
          const prod = products.find((p) => p._id === it.product_id);
          return {
            product_id: it.product_id,
            item_name: prod?.product_name || 'Standard Product',
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            discount_percent: Number(it.discount_percent) || 0,
            gst_rate: Number(it.gst_rate) || 18,
          };
        }),
      };

      const res = await invoiceService.createInvoice(payload);
      setCreateModalOpen(false);
      await loadInvoices();
      await loadMetrics();
      if (res.data?._id) {
        navigate(`/invoices/${res.data._id}`);
      }
    } catch (err) {
      console.error('Failed to create invoice:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create tax invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      key: 'invoice_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'invoice_date',
      render: (dt) => (dt ? new Date(dt).toLocaleDateString('en-IN') : 'N/A'),
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (c, row) => (
        <div>
          <p className="font-semibold text-slate-900">
            {c?.display_name || c?.company_name || row.customer_name || 'Customer'}
          </p>
          <p className="text-xs font-mono text-slate-500">
            {c?.gstin || row.billing_address?.gstin || 'Unregistered'}
          </p>
        </div>
      ),
    },
    {
      header: 'Taxable Amount',
      key: 'taxable_total',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'GST Total',
      key: 'cgst_total',
      render: (_, row) => {
        const totalTax = (row.cgst_total || 0) + (row.sgst_total || 0) + (row.igst_total || 0);
        return <span className="font-mono text-xs font-medium">₹{totalTax.toLocaleString('en-IN')}</span>;
      },
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-bold text-slate-900 font-mono',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Payment Status',
      key: 'payment_status',
      render: (ps) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            ps === 'paid'
              ? 'bg-emerald-100 text-emerald-800'
              : ps === 'partially_paid'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {ps ? ps.toUpperCase().replace('_', ' ') : 'UNPAID'}
        </span>
      ),
    },
    {
      header: 'E-Invoice',
      key: 'e_invoice',
      render: (ei) => (
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            ei?.status === 'generated' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {ei?.status === 'generated' ? 'IRN READY' : 'NOT GENERATED'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Invoices Register"
        subtitle="Statutory tax invoices with GST calculation, e-invoicing status, and collection tracking."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'List' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadInvoices();
                loadMetrics();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Refresh Invoices"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Generate Tax Invoice
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoices</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {metrics?.total_invoices ?? invoices.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Active billing documents</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ₹{Number(metrics?.total_billed ?? invoices.reduce((acc, i) => acc + (i.grand_total || 0), 0)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Gross sales including taxes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Payments</p>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              ₹{Number(metrics?.total_collected ?? invoices.reduce((acc, i) => acc + (i.paid_amount || 0), 0)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Cleared collections</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Receivables</p>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
              ₹{Number(metrics?.total_outstanding ?? invoices.reduce((acc, i) => acc + (i.balance_amount || 0), 0)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Pending payments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice #, customer name, GSTIN..."
        filters={[
          {
            label: 'Payment Status',
            value: paymentFilter,
            onChange: setPaymentFilter,
            options: [
              { label: 'All Statuses', value: '' },
              { label: 'Paid', value: 'paid' },
              { label: 'Partially Paid', value: 'partially_paid' },
              { label: 'Unpaid', value: 'unpaid' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/invoices/${row._id || row.id}`)}
        actions={(row) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => navigate(`/invoices/${row._id || row.id}`)}
              className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
              title="View Invoice Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/invoices/${row._id || row.id}/print`)}
              className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
              title="Print Tax Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Create Tax Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Tax Invoice"
        subtitle="Create a statutory GST tax invoice for outward supply"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.display_name || c.company_name} ({c.gstin || 'Unregistered'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Immediate">Immediate / Advance</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 45 Days">Net 45 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_interstate}
                  onChange={(e) => setFormData({ ...formData, is_interstate: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Interstate Supply (Levy IGST instead of CGST + SGST)
              </label>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Line Items & Products</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="p-3 space-y-3">
              {formData.items.map((item, idx) => {
                const lineBase = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                const discount = (lineBase * (Number(item.discount_percent) || 0)) / 100;
                const taxable = Math.max(0, lineBase - discount);
                const tax = (taxable * (Number(item.gst_rate) || 0)) / 100;
                const lineTotal = Math.round(taxable + tax);

                return (
                  <div key={idx} className="flex flex-wrap items-center gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Product</label>
                      <select
                        required
                        value={item.product_id}
                        onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.product_name} ({p.product_code || 'PROD'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-28">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-20">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Disc %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount_percent}
                        onChange={(e) => handleItemChange(idx, 'discount_percent', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">GST %</label>
                      <select
                        value={item.gst_rate}
                        onChange={(e) => handleItemChange(idx, 'gst_rate', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="w-28 text-right pr-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Total</label>
                      <span className="font-mono text-xs font-bold text-slate-900 block pt-1">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={formData.items.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-6 text-xs">
              <div>
                <span className="text-slate-500">Taxable Total: </span>
                <span className="font-bold font-mono text-slate-800">₹{totals.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Tax: </span>
                <span className="font-bold font-mono text-slate-800">₹{totals.taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-700 font-bold">Grand Total: </span>
                <span className="font-bold font-mono text-blue-600 text-sm">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Generating...' : 'Issue Tax Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceListPage;
