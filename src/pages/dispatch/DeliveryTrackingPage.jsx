import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dispatchService } from '../../services/dispatch.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const DeliveryTrackingPage = () => {
  const navigate = useNavigate();
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDispatches();
  }, [search]);

  const loadDispatches = async () => {
    try {
      setLoading(true);
      const res = await dispatchService.getDispatches({ search, limit: 20 });
      setDispatches(res.data?.dispatches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Tracking #',
      key: 'tracking_number',
      cellClassName: 'font-mono font-bold text-slate-900',
      render: (t) => t || 'Direct Roadways',
    },
    {
      header: 'Dispatch #',
      key: 'dispatch_number',
      cellClassName: 'font-mono text-indigo-700',
    },
    {
      header: 'Customer',
      key: 'customer_id',
      render: (c) => <span className="font-semibold text-slate-800">{c?.display_name || c?.company_name}</span>,
    },
    {
      header: 'Transporter',
      key: 'transporter_id',
      render: (tr) => <span className="text-xs text-slate-600">{tr?.transporter_name || 'Fleet'}</span>,
    },
    {
      header: 'Latest Status Checkpoint',
      key: 'tracking_history',
      render: (th) => {
        const last = th?.[th?.length - 1];
        return (
          <div className="text-xs">
            <p className="font-bold text-slate-900">{last?.status || 'Dispatched'}</p>
            <p className="text-slate-500">{last?.location}</p>
          </div>
        );
      },
    },
    {
      header: 'Delivery Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery & Carrier Tracking"
        subtitle="Real-time freight status tracking, checkpoint updates, and transit milestones."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders & Delivery', href: '/dispatch' },
          { label: 'Tracking' },
        ]}
      />

      <DataTable
        columns={columns}
        data={dispatches}
        loading={loading}
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

export default DeliveryTrackingPage;
