import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2 } from 'lucide-react';
import { productionService } from '../../services/production.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const MaterialIssuePage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    loadIssues(pagination.page);
  }, [pagination.page]);

  const loadIssues = async (page = 1) => {
    try {
      setLoading(true);
      const res = await productionService.getMaterialIssues({ page, limit: 10 });
      setIssues(res.data?.issues || []);
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
      header: 'Issue Slip #',
      key: 'issue_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'issue_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Work Order #',
      key: 'work_order_id',
      render: (wo) => <span className="font-mono text-xs text-indigo-700 font-semibold">{wo?.wo_number || 'Direct'}</span>,
    },
    {
      header: 'Source Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-700">{w?.warehouse_name || 'Central'}</span>,
    },
    {
      header: 'Material Lines',
      key: 'items',
      render: (items) => <span className="text-xs text-slate-600 font-medium">{items?.length || 0} items issued</span>,
    },
    {
      header: 'Stock Deducted',
      key: 'stock_deducted',
      render: (sd) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            sd ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {sd ? 'POSTED TO LEDGER' : 'PENDING'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Issue Slips"
        subtitle="Raw materials and sub-assemblies issued to shop floor with atomic stock ledger deductions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production', href: '/production' },
          { label: 'Material Issues' },
        ]}
      />

      <DataTable
        columns={columns}
        data={issues}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />
    </div>
  );
};

export default MaterialIssuePage;
