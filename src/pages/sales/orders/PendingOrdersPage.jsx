import React, { useState, useEffect } from 'react';
import { Clock, Eye, AlertTriangle, ArrowRight, Truck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { salesOrderService } from '../../../services/salesOrder.service';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/shell/DataTable';
import { StatusBadge } from '../../../components/shell/StatusBadge';

export const PendingOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      const res = await salesOrderService.getPendingOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load pending orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Order #',
      key: 'order_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (c) => (
        <span className="font-semibold text-slate-900">
          {c?.display_name || c?.company_name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-600">{w?.warehouse_name || 'Central'}</span>,
    },
    {
      header: 'Fulfillment Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
    {
      header: 'Expected Delivery',
      key: 'expected_delivery_date',
      render: (dt) =>
        dt ? (
          <span className="text-xs font-medium text-slate-700">
            {new Date(dt).toLocaleDateString('en-IN')}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not Set</span>
        ),
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-semibold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Orders Work Queue"
        subtitle="Active orders awaiting stock reservation, production completion, or dispatch execution."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/sales/orders' },
          { label: 'Pending Queue' },
        ]}
        actions={
          <Link
            to="/sales/orders/processing"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            Processing Pipeline
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        actions={(row) => (
          <button
            onClick={() => navigate(`/sales/orders/${row._id || row.id}`)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="Open Order"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};

export default PendingOrdersPage;
