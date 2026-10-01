import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { invoiceService } from '../../services/invoice.service';
import { customerService } from '../../services/customer.service';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';

export const CreditDebitNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  // Issue Note Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [formData, setFormData] = useState({
    note_type: 'credit_note',
    party_type: 'customer',
    customer_id: '',
    supplier_id: '',
    original_invoice_id: '',
    original_invoice_number: '',
    reason: 'sales_return',
    taxable_amount: '',
    gst_rate: 18,
    is_interstate: false,
    remarks: '',
  });

  useEffect(() => {
    loadNotes(pagination.page);
  }, [pagination.page, typeFilter]);

  const loadNotes = async (page = 1) => {
    try {
      setLoading(true);
      const res = await invoiceService.getCreditDebitNotes({
        page,
        limit: 10,
        note_type: typeFilter || undefined,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.notes)
        ? res.data.notes
        : [];

      setNotes(list);

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
      console.error('Failed to load credit/debit notes:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, supRes, invRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }).catch(() => ({ data: [] })),
        purchaseService.getSuppliers({ limit: 100 }).catch(() => ({ data: [] })),
        invoiceService.getInvoices({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      const custList = Array.isArray(custRes.data)
        ? custRes.data
        : Array.isArray(custRes.data?.customers)
        ? custRes.data.customers
        : Array.isArray(custRes.data?.items)
        ? custRes.data.items
        : [];

      const supList = Array.isArray(supRes.data)
        ? supRes.data
        : Array.isArray(supRes.data?.suppliers)
        ? supRes.data.suppliers
        : [];

      const invList = Array.isArray(invRes.data)
        ? invRes.data
        : Array.isArray(invRes.data?.invoices)
        ? invRes.data.invoices
        : [];

      setCustomers(custList);
      setSuppliers(supList);
      setInvoices(invList);

      setFormData({
        note_type: 'credit_note',
        party_type: 'customer',
        customer_id: custList[0]?._id || '',
        supplier_id: supList[0]?._id || '',
        original_invoice_id: '',
        original_invoice_number: '',
        reason: 'sales_return',
        taxable_amount: '',
        gst_rate: 18,
        is_interstate: false,
        remarks: '',
      });
      setCreateModalOpen(true);
    } catch (err) {
      console.error('Failed to load note dependencies:', err);
      setCreateModalOpen(true);
    }
  };

  const handleInvoiceSelect = (invId) => {
    if (!invId) {
      setFormData((prev) => ({
        ...prev,
        original_invoice_id: '',
        original_invoice_number: '',
      }));
      return;
    }
    const inv = invoices.find((i) => i._id === invId);
    if (inv) {
      setFormData((prev) => ({
        ...prev,
        original_invoice_id: inv._id,
        original_invoice_number: inv.invoice_number,
        customer_id: inv.customer_id?._id || inv.customer_id || prev.customer_id,
        is_interstate: Boolean(inv.is_interstate),
      }));
    }
  };

  const calculateNoteTotals = () => {
    const taxable = Number(formData.taxable_amount) || 0;
    const rate = Number(formData.gst_rate) || 0;
    const tax = (taxable * rate) / 100;
    return {
      taxable,
      tax,
      grandTotal: Math.round(taxable + tax),
    };
  };

  const noteTotals = calculateNoteTotals();

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.party_type === 'customer' && !formData.customer_id) {
      alert('Please select a customer');
      return;
    }
    if (formData.party_type === 'supplier' && !formData.supplier_id) {
      alert('Please select a supplier');
      return;
    }
    if (!formData.taxable_amount || Number(formData.taxable_amount) <= 0) {
      alert('Please enter a valid taxable adjustment amount');
      return;
    }

    try {
      setSubmitting(true);
      const taxable = Number(formData.taxable_amount);
      const gstRate = Number(formData.gst_rate) || 18;
      const isInter = Boolean(formData.is_interstate);

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isInter) {
        igst = Math.round((taxable * gstRate) / 100 * 100) / 100;
      } else {
        cgst = Math.round((taxable * (gstRate / 2)) / 100 * 100) / 100;
        sgst = Math.round((taxable * (gstRate / 2)) / 100 * 100) / 100;
      }

      const payload = {
        note_type: formData.note_type,
        party_type: formData.party_type,
        customer_id: formData.party_type === 'customer' ? formData.customer_id : undefined,
        supplier_id: formData.party_type === 'supplier' ? formData.supplier_id : undefined,
        original_invoice_id: formData.original_invoice_id || undefined,
        original_invoice_number: formData.original_invoice_number || undefined,
        reason: formData.reason,
        taxable_amount: taxable,
        gst_rate: gstRate,
        is_interstate: isInter,
        cgst_total: cgst,
        sgst_total: sgst,
        igst_total: igst,
        grand_total: taxable + cgst + sgst + igst,
        remarks: formData.remarks,
      };

      await invoiceService.createCreditDebitNote(payload);
      setCreateModalOpen(false);
      await loadNotes();
    } catch (err) {
      console.error('Failed to issue note:', err);
      alert(err.response?.data?.message || err.message || 'Failed to issue note');
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const creditNotes = notes.filter((n) => n.note_type === 'credit_note');
  const debitNotes = notes.filter((n) => n.note_type === 'debit_note');
  const totalCreditVal = creditNotes.reduce((acc, n) => acc + (n.grand_total || 0), 0);
  const totalDebitVal = debitNotes.reduce((acc, n) => acc + (n.grand_total || 0), 0);

  const columns = [
    {
      header: 'Note #',
      key: 'note_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Type',
      key: 'note_type',
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            t === 'credit_note' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {t ? t.replace('_', ' ') : 'NOTE'}
        </span>
      ),
    },
    {
      header: 'Date',
      key: 'note_date',
      render: (dt) => (dt ? new Date(dt).toLocaleDateString('en-IN') : 'N/A'),
    },
    {
      header: 'Party',
      key: 'customer_id',
      render: (c, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">
            {c?.display_name || c?.company_name || row.supplier_id?.supplier_name || 'Party'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {c?.gstin || row.supplier_id?.gstin || (row.party_type ? row.party_type.toUpperCase() : '')}
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (r) => (
        <span className="capitalize text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {r ? r.replace(/_/g, ' ') : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Invoice Ref',
      key: 'original_invoice_number',
      render: (ref) => <span className="font-mono text-xs text-slate-600">{ref || 'Direct Memo'}</span>,
    },
    {
      header: 'Taxable (₹)',
      key: 'taxable_amount',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-bold text-slate-900 font-mono',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st || 'issued'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit & Debit Notes"
        subtitle="Post-issuance billing adjustments, sales return credits, and vendor debit memos under GST regulations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'Credit/Debit Notes' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadNotes}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Refresh Notes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Issue Note
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Notes Issued</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{notes.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total adjustment vouchers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit Notes (Returns/Disc)</p>
            <p className="text-2xl font-bold font-mono text-indigo-600 mt-1">
              ₹{totalCreditVal.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">{creditNotes.length} customer credit vouchers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Debit Notes (Vendor Memos)</p>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
              ₹{totalDebitVal.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">{debitNotes.length} vendor debit vouchers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Adjustment Exposure</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ₹{(totalCreditVal + totalDebitVal).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Cumulative adjustment volume</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Filter notes..."
        filters={[
          {
            label: 'Note Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Notes', value: '' },
              { label: 'Credit Notes', value: 'credit_note' },
              { label: 'Debit Notes', value: 'debit_note' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={notes}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => setSelectedNote(row)}
        actions={(row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNote(row);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="View Note Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {/* Selected Note Details Modal */}
      {selectedNote && (
        <Modal
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          title={`${selectedNote.note_type === 'credit_note' ? 'Credit Note' : 'Debit Note'}: ${selectedNote.note_number}`}
          subtitle="Tax adjustment voucher details"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Note Number</p>
                <p className="font-mono font-bold text-slate-900">{selectedNote.note_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Type</p>
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {selectedNote.note_type ? selectedNote.note_type.replace('_', ' ') : 'Note'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Note Date</p>
                <p className="text-slate-800">{new Date(selectedNote.note_date || selectedNote.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Status</p>
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedNote.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Original Reference Invoice</p>
              <p className="font-mono font-bold text-slate-900">{selectedNote.original_invoice_number || 'Direct Memo'}</p>
              {selectedNote.reason && (
                <p className="text-xs text-slate-600 mt-1">Reason: <span className="font-medium text-slate-800 capitalize">{selectedNote.reason.replace(/_/g, ' ')}</span></p>
              )}
              {selectedNote.remarks && (
                <p className="text-xs text-slate-500 italic mt-1">{selectedNote.remarks}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
              <div>
                <p className="text-xs text-slate-500">Taxable Adjustment</p>
                <p className="font-bold text-slate-800 font-mono text-base">₹{Number(selectedNote.taxable_amount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tax Component</p>
                <p className="font-bold text-slate-800 font-mono text-base">
                  ₹{Number((selectedNote.cgst_total || 0) + (selectedNote.sgst_total || 0) + (selectedNote.igst_total || 0)).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-medium">Grand Total</p>
                <p className="font-extrabold text-indigo-700 font-mono text-lg">₹{Number(selectedNote.grand_total || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Issue Note Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Issue Credit or Debit Note"
        subtitle="Create post-issuance GST adjustment voucher"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note Type</label>
              <select
                value={formData.note_type}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    note_type: val,
                    party_type: val === 'credit_note' ? 'customer' : 'supplier',
                    reason: val === 'credit_note' ? 'sales_return' : 'purchase_return',
                  }));
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="credit_note">Credit Note (Credit Customer / Sales Return)</option>
                <option value="debit_note">Debit Note (Debit Supplier / Purchase Return)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Party Type</label>
              <select
                value={formData.party_type}
                onChange={(e) => setFormData({ ...formData, party_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {formData.party_type === 'customer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer *</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.display_name || c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                <select
                  required
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Original Tax Invoice Reference
              </label>
              <select
                value={formData.original_invoice_id}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Direct Memo / Standalone</option>
                {invoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoice_number} (₹{Number(inv.grand_total || 0).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales_return">Sales Return</option>
                <option value="purchase_return">Purchase Return</option>
                <option value="rate_difference">Rate Difference</option>
                <option value="discount_adjustment">Post-sale Discount</option>
                <option value="defective_goods">Defective Goods / Damage</option>
                <option value="correction_in_invoice">Correction in Invoice</option>
                <option value="other">Other Statutory Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate %</label>
              <select
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxable Adjustment Amount (₹) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 5000"
                value={formData.taxable_amount}
                onChange={(e) => setFormData({ ...formData, taxable_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_interstate}
                  onChange={(e) => setFormData({ ...formData, is_interstate: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Interstate (Levy IGST)
              </label>
            </div>
          </div>

          {/* Computed Summary Box */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500">Taxable: </span>
              <span className="font-bold font-mono text-slate-800">₹{noteTotals.taxable.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500">Tax ({formData.gst_rate}%): </span>
              <span className="font-bold font-mono text-slate-800">₹{noteTotals.tax.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-700 font-bold">Total Note Amount: </span>
              <span className="font-bold font-mono text-blue-600 text-sm">₹{noteTotals.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              placeholder="e.g. Goods returned due to color mismatch"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              {submitting ? 'Issuing Note...' : 'Issue Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CreditDebitNotesPage;
