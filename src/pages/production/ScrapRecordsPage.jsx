import React, { useState, useEffect } from 'react';
import { AlertOctagon, Plus, Eye, DollarSign } from 'lucide-react';
import { productionService } from '../../services/production.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';

export const ScrapRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    loadScrap(pagination.page);
  }, [pagination.page]);

  const loadScrap = async (page = 1) => {
    try {
      setLoading(true);
      const res = await productionService.getScrapRecords({ page, limit: 10 });
      setRecords(res.data?.records || []);
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
      header: 'Scrap Slip #',
      key: 'scrap_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'scrap_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Product / Part',
      key: 'product_id',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900">{p?.product_name || 'N/A'}</p>
          <p className="text-xs font-mono text-slate-500">{p?.product_code || ''}</p>
        </div>
      ),
    },
    {
      header: 'Scrap Qty',
      key: 'quantity',
      cellClassName: 'font-mono font-bold text-rose-600',
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (r) => <span className="capitalize text-xs text-slate-700">{r?.replace('_', ' ')}</span>,
    },
    {
      header: 'Disposition',
      key: 'disposition',
      render: (d) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {d?.replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scrap & Defect Register"
        subtitle="Track manufacturing rejections, setup scrap, and salvage dispositions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production', href: '/production' },
          { label: 'Scrap Records' },
        ]}
      />

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />
    </div>
  );
};

export default ScrapRecordsPage;
