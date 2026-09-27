import React, { useState, useEffect } from 'react';
import { Receipt, Eye, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';

export const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    loadInvoices(pagination.page);
  }, [pagination.page, search, paymentFilter]);

  const loadInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices({
        page,
        limit: 10,
        search,
        payment_status: paymentFilter || undefined,
      });
      setInvoices(res.data?.invoices || []);
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
      header: 'Invoice #',
      key: 'invoice_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'invoice_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (c) => (
        <div>
          <p className="font-semibold text-slate-900">{c?.display_name || c?.company_name}</p>
          <p className="text-xs font-mono text-slate-500">{c?.gstin || 'Unregistered'}</p>
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
        return <span className="font-mono text-xs">₹{totalTax.toLocaleString('en-IN')}</span>;
      },
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
            ps === 'paid'
              ? 'bg-emerald-100 text-emerald-800'
              : ps === 'partially_paid'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {ps?.toUpperCase()?.replace('_', ' ')}
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
        title="Invoices Register"
        subtitle="Immutable tax invoices. Corrections are handled exclusively through Credit & Debit Notes."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'List' },
        ]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice #, customer..."
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
        onRowClick={(row) => navigate(`/invoices/${row._id}`)}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/invoices/${row._id}`)}
              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
              title="View Invoice"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/invoices/${row._id}/print`)}
              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
              title="Print Tax Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default InvoiceListPage;
