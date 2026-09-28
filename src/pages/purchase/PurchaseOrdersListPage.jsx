import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const PurchaseOrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    loadOrders(pagination.page);
  }, [pagination.page]);

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getOrders({ page, limit: 10 });
      setOrders(res.data?.orders || []);
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
      header: 'PO Number',
      key: 'po_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'po_date',
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
      header: 'Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-700">{w?.warehouse_name || 'Central'}</span>,
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-semibold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Fulfillment Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders (PO)"
        subtitle="Manage vendor purchase orders, delivery terms, and partial receipt tracking."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Purchase Orders' },
        ]}
      />

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/purchase/orders/${row._id || row.id}`)}
        actions={(row) => (
          <button
            onClick={() => navigate(`/purchase/orders/${row._id || row.id}`)}
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

export default PurchaseOrdersListPage;
