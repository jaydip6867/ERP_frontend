import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, CheckCircle2, RotateCw, ShoppingCart, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { salesService } from '../../services/sales.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';

export const QuotationsListPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadQuotations(pagination.page);
  }, [pagination.page, search, statusFilter]);

  const loadQuotations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await salesService.getQuotations({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setQuotations(res.data || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Quote Number',
      key: 'quotation_number',
      cellClassName: 'font-mono font-bold text-slate-900',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span>{val}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {row.revision_number}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (val) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val?.company_name || 'Customer'}</span>
          <span className="text-xs text-slate-400 font-mono">{val?.customer_code}</span>
        </div>
      ),
    },
    {
      header: 'Date & Validity',
      key: 'quotation_date',
      render: (val, row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">
            {new Date(val).toLocaleDateString()}
          </span>
          <span className="text-[11px] text-slate-400">
            Valid: {new Date(row.valid_until).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Taxable Amount',
      key: 'taxable_total',
      render: (val) => <span className="font-mono text-xs">₹{val?.toLocaleString()}</span>,
    },
    {
      header: 'Grand Total (with GST)',
      key: 'grand_total',
      render: (val) => <span className="font-bold text-slate-900 text-sm">₹{val?.toLocaleString()}</span>,
    },
    {
      header: 'Discount Status',
      key: 'discount_approval_status',
      render: (val) => {
        if (val === 'pending') {
          return (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Needs Approval
            </span>
          );
        }
        if (val === 'approved') {
          return (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Approved
            </span>
          );
        }
        return <span className="text-xs text-slate-400">Standard</span>;
      },
    },
    {
      header: 'Quotation Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Sales Quotations & Revisions"
        subtitle="Generate commercial proposals with line-item GST calculations, discount approval governance, and order conversions."
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Quotations' }]}
        actions={
          <Link
            to="/sales/quotations/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </Link>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search quotes by number, customer, base ID..."
        filters={[
          {
            label: 'All Statuses',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Approved', value: 'approved' },
              { label: 'Sent to Customer', value: 'sent' },
              { label: 'Converted to Order', value: 'converted_to_order' },
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
        data={quotations}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => loadQuotations(page)}
        onRowClick={(row) => navigate(`/sales/quotations/${row._id}`)}
        actions={(row) => (
          <button
            onClick={() => navigate(`/sales/quotations/${row._id}`)}
            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
        )}
      />
    </div>
  );
};
export default QuotationsListPage;
