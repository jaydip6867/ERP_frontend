import React, { useState, useEffect } from 'react';
import { PackageCheck, Plus, Eye, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const GrnListPage = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    loadGrns(pagination.page);
  }, [pagination.page]);

  const loadGrns = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getGrns({ page, limit: 10 });
      setGrns(res.data?.grns || []);
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
      header: 'GRN Number',
      key: 'grn_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'grn_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Supplier',
      key: 'supplier_id',
      render: (s) => <span className="font-semibold text-slate-900">{s?.supplier_name}</span>,
    },
    {
      header: 'PO Ref #',
      key: 'po_id',
      render: (po) => <span className="font-mono text-xs text-indigo-700">{po?.po_number || 'Direct'}</span>,
    },
    {
      header: 'Challan #',
      key: 'vendor_challan_no',
      render: (ch) => <span className="text-xs text-slate-600">{ch || 'N/A'}</span>,
    },
    {
      header: 'Stock Posted',
      key: 'stock_posted',
      render: (sp) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            sp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {sp ? 'POSTED' : 'PENDING QC'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods Receipt Notes (GRN)"
        subtitle="Manage inward gate receipts, partial shipments, and warehouse lot postings."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'GRN' },
        ]}
      />

      <DataTable
        columns={columns}
        data={grns}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/purchase/grn/${row._id}`)}
        actions={(row) => (
          <button
            onClick={() => navigate(`/purchase/grn/${row._id}`)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};

export default GrnListPage;
