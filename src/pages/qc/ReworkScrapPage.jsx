import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { qcService } from '../../services/qc.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const ReworkScrapPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    loadRework(pagination.page);
  }, [pagination.page]);

  const loadRework = async (page = 1) => {
    try {
      setLoading(true);
      const res = await qcService.getReworkRecords({ page, limit: 10 });
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
      header: 'Rework #',
      key: 'rework_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'rework_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Product',
      key: 'product_id',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900">{p?.product_name || 'N/A'}</p>
          <p className="text-xs font-mono text-slate-500">{p?.product_code}</p>
        </div>
      ),
    },
    {
      header: 'Rework Qty',
      key: 'rework_qty',
      cellClassName: 'font-mono font-bold text-amber-700 text-center',
    },
    {
      header: 'Defect Description',
      key: 'defect_description',
      render: (d) => <span className="text-xs text-slate-700">{d}</span>,
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
        title="Quality Rework & Corrective Actions"
        subtitle="Manage units flagged for secondary machining, reprocessing, or calibration."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quality Control', href: '/qc' },
          { label: 'Rework' },
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

export default ReworkScrapPage;
