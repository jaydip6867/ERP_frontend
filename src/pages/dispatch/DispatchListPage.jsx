import React, { useState, useEffect } from 'react';
import { Truck, Plus, Eye, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dispatchService } from '../../services/dispatch.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';

export const DispatchListPage = () => {
  const navigate = useNavigate();
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadDispatches(pagination.page);
  }, [pagination.page, search, statusFilter]);

  const loadDispatches = async (page = 1) => {
    try {
      setLoading(true);
      const res = await dispatchService.getDispatches({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setDispatches(res.data?.dispatches || []);
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
      header: 'Dispatch #',
      key: 'dispatch_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'dispatch_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Sales Order #',
      key: 'sales_order_id',
      render: (so) => <span className="font-mono text-xs text-indigo-700 font-semibold">{so?.order_number}</span>,
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (c) => <span className="font-semibold text-slate-900">{c?.display_name || c?.company_name}</span>,
    },
    {
      header: 'Transporter & LR',
      key: 'transporter_id',
      render: (tr, row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{tr?.transporter_name || 'Direct Vehicle'}</p>
          <p className="font-mono text-slate-500">LR: {row.lr_number || 'Pending'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
    {
      header: 'Inventory Deducted',
      key: 'stock_deducted',
      render: (sd) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            sd ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {sd ? 'DEDUCTED' : 'PENDING'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatches & Shipments"
        subtitle="Manage shipment creation, inventory lot deductions, tracking checkpoints, and POD receipts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders & Delivery' },
        ]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch #, LR #, tracking..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Shipments', value: '' },
              { label: 'Ready to Ship', value: 'ready_to_ship' },
              { label: 'Dispatched', value: 'dispatched' },
              { label: 'In Transit', value: 'in_transit' },
              { label: 'Delivered', value: 'delivered' },
              { label: 'RTO / Returned', value: 'rto' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={dispatches}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/dispatch/${row._id || row.id}`)}
        actions={(row) => (
          <button
            onClick={() => navigate(`/dispatch/${row._id || row.id}`)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="View Dispatch Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};

export default DispatchListPage;
