import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Eye, CheckCircle2, Clock, Truck, ShieldAlert } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { salesOrderService } from '../../../services/salesOrder.service';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/shell/DataTable';
import { StatusBadge } from '../../../components/shell/StatusBadge';
import { FilterBar } from '../../../components/shell/FilterBar';

export const SalesOrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders(pagination.page);
  }, [pagination.page, search, statusFilter]);

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await salesOrderService.getOrders({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setOrders(res.data || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load sales orders:', err);
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
      header: 'Date',
      key: 'order_date',
      render: (val) => new Date(val).toLocaleDateString('en-IN'),
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (c) => (
        <div>
          <p className="font-semibold text-slate-900">{c?.display_name || c?.company_name || 'N/A'}</p>
          <p className="text-xs text-slate-500 font-mono">{c?.gstin || ''}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      key: 'items',
      render: (items) => (
        <span className="text-xs text-slate-600 font-medium">
          {items?.length || 0} line items
        </span>
      ),
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-semibold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Approval',
      key: 'approval',
      render: (app) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            app?.status === 'approved'
              ? 'bg-emerald-100 text-emerald-800'
              : app?.status === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {app?.status?.toUpperCase() || 'NOT_REQUIRED'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle="Manage confirmed customer orders, stock allocation, and dispatch progress."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/sales/quotations' },
          { label: 'Orders' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/sales/orders/pending"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Queue
            </Link>
            <Link
              to="/sales/orders/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Sales Order
            </Link>
          </div>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order #, customer PO..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: '' },
              { label: 'Draft', value: 'draft' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Approved', value: 'approved' },
              { label: 'Processing', value: 'processing' },
              { label: 'Partially Dispatched', value: 'partially_dispatched' },
              { label: 'Dispatched', value: 'dispatched' },
              { label: 'Completed', value: 'completed' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/sales/orders/${row._id}`)}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/sales/orders/${row._id}`)}
              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
              title="View Order Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default SalesOrdersListPage;
