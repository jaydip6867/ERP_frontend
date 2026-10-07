import React, { useState, useEffect } from 'react';
import { Bookmark, ShieldAlert, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { FilterBar } from '../../components/shell/FilterBar';

export const BatchesPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadBatches(pagination.page);
  }, [pagination.page, statusFilter]);

  const loadBatches = async (page = 1) => {
    try {
      setLoading(true);
      const res = await inventoryService.getBatches({
        page,
        limit: 15,
        status: statusFilter || undefined,
      });
      const batchList = Array.isArray(res.data) ? res.data : (res.data?.batches || []);
      setBatches(batchList);
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

  const handleToggleQuarantine = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'quarantine' ? 'active' : 'quarantine';
    try {
      await inventoryService.updateBatchStatus(id, { status: nextStatus });
      loadBatches(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating batch');
    }
  };

  const columns = [
    {
      header: 'Batch Number',
      key: 'batch_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Product',
      key: 'product_id',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900">{p?.product_name || 'N/A'}</p>
          <p className="text-xs font-mono text-slate-500">{p?.product_code || ''}</p>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-600">{w?.warehouse_name || 'Central'}</span>,
    },
    {
      header: 'Current Qty',
      key: 'current_qty',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Reserved Qty',
      key: 'reserved_qty',
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
          {val || 0}
        </span>
      ),
    },
    {
      header: 'Expiry Date',
      key: 'expiry_date',
      render: (dt) =>
        dt ? (
          <span className="text-xs font-medium text-slate-700">
            {new Date(dt).toLocaleDateString('en-IN')}
          </span>
        ) : (
          <span className="text-xs text-slate-400">N/A</span>
        ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            st === 'active'
              ? 'bg-emerald-100 text-emerald-800'
              : st === 'quarantine'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {st?.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Management & Traceability"
        subtitle="Track lot numbers, expiry dates, quality hold/quarantine, and reservations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Batches' },
        ]}
      />

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search batches..."
        filters={[
          {
            label: 'Batch Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Batches', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Quarantine / Held', value: 'quarantine' },
              { label: 'Expired', value: 'expired' },
              { label: 'Depleted', value: 'depleted' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={batches}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        actions={(row) => (
          <button
            onClick={() => handleToggleQuarantine(row._id, row.status)}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              row.status === 'quarantine'
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {row.status === 'quarantine' ? 'Release' : 'Quarantine'}
          </button>
        )}
      />
    </div>
  );
};

export default BatchesPage;
