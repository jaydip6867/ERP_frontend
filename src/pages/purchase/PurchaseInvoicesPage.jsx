import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Eye, DollarSign, Calendar, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const PurchaseInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices(pagination.page);
  }, [pagination.page]);

  const loadInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getInvoices({ page, limit: 10 });
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.invoices)
        ? res.data.invoices
        : [];
      setInvoices(list);
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

  const columns = [
    {
      header: 'System Bill #',
      key: 'invoice_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Vendor Bill #',
      key: 'vendor_bill_number',
      cellClassName: 'font-mono text-slate-700',
    },
    {
      header: 'Date',
      key: 'bill_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Supplier',
      key: 'supplier_id',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-900">{s?.supplier_name || 'N/A'}</p>
          <p className="text-xs text-slate-500 font-mono">{s?.gstin || ''}</p>
        </div>
      ),
    },
    {
      header: 'Taxable Amount',
      key: 'taxable_amount',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-bold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Payment Status',
      key: 'payment_status',
      render: (ps) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            ps === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {ps?.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Invoices (Supplier Bills)"
        subtitle="Book vendor commercial invoices, calculate input tax credit (ITC), and track vendor payables."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Bills' },
        ]}
      />

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => setSelectedInvoice(row)}
        actions={(row) => (
          <button
            onClick={() => setSelectedInvoice(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="View Bill Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Purchase Bill Details: ${selectedInvoice.invoice_number}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Bill Number</p>
                <p className="font-mono font-bold text-slate-900">{selectedInvoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Vendor Ref #</p>
                <p className="font-mono text-slate-800">{selectedInvoice.vendor_bill_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Bill Date</p>
                <p className="text-slate-800">{new Date(selectedInvoice.bill_date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Payment Status</p>
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedInvoice.payment_status || 'Unpaid'}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendor / Supplier</p>
              <p className="font-bold text-slate-900 text-base">{selectedInvoice.supplier_id?.supplier_name || 'Vendor'}</p>
              <p className="text-xs font-mono text-slate-500">GSTIN: {selectedInvoice.supplier_id?.gstin || 'Unregistered'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
              <div>
                <p className="text-xs text-slate-500">Taxable Net Amount</p>
                <p className="font-bold text-slate-800 text-base">₹{Number(selectedInvoice.taxable_amount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-medium">Grand Total Payable</p>
                <p className="font-extrabold text-indigo-700 text-xl">₹{Number(selectedInvoice.grand_total || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseInvoicesPage;
