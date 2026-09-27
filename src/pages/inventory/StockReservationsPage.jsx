import React, { useState, useEffect } from 'react';
import { Bookmark, Eye, CheckCircle2 } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const StockReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    loadReservations(pagination.page);
  }, [pagination.page]);

  const loadReservations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await inventoryService.getReservations({ page, limit: 10 });
      setReservations(res.data?.reservations || []);
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
      header: 'Sales Order #',
      key: 'sales_order_id',
      cellClassName: 'font-mono font-bold text-slate-900',
      render: (so) => so?.order_number || 'N/A',
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
      header: 'Reserved Qty',
      key: 'reserved_qty',
      cellClassName: 'font-mono font-bold text-indigo-700',
    },
    {
      header: 'Reserved Date',
      key: 'reserved_at',
      render: (dt) => new Date(dt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
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
        title="Stock Reservations"
        subtitle="Current inventory quantities allocated and locked for specific Sales Orders."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Reservations' },
        ]}
      />

      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />
    </div>
  );
};

export default StockReservationsPage;
