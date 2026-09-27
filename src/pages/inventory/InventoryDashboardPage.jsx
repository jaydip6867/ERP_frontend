import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  Bookmark,
  ShieldAlert,
  Coins,
  Warehouse,
  History,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventory.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const InventoryDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    total_products: 0,
    low_stock_products: 0,
    total_batches: 0,
    quarantine_batches: 0,
    active_reservations: 0,
    pending_transfers: 0,
    total_valuation: 0,
    total_units: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load inventory dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Stock Logistics"
        subtitle="Real-time multi-warehouse stock visibility, batch tracing, and transaction auditing."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/inventory/ledger"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <History className="w-4 h-4 text-slate-500" />
              Stock Ledger
            </Link>
            <Link
              to="/inventory/transfers"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
              New Stock Transfer
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Valuation"
          value={`₹${Number(metrics.total_valuation || 0).toLocaleString('en-IN')}`}
          icon={Coins}
          description={`${metrics.total_units} total physical units across facilities`}
        />
        <StatCard
          title="Active SKUs / Products"
          value={metrics.total_products}
          icon={Boxes}
          description="Catalog items tracked in inventory"
        />
        <StatCard
          title="Low Stock Alerts"
          value={metrics.low_stock_products}
          icon={AlertTriangle}
          trend={metrics.low_stock_products > 0 ? { direction: 'down', label: 'Action required' } : undefined}
          description="Items below reorder safety threshold"
        />
        <StatCard
          title="Quarantined Batches"
          value={metrics.quarantine_batches}
          icon={ShieldAlert}
          description="Held for Quality Control / Inspection"
        />
      </div>

      {/* Operations Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/inventory/summary')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Stock Summary</h3>
          <p className="text-xs text-slate-600">
            Real-time balance breakdown per product, committed reservations, and available stock.
          </p>
        </div>

        <div
          onClick={() => navigate('/inventory/batches')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Bookmark className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Batch Management & Expiry</h3>
          <p className="text-xs text-slate-600">
            Track {metrics.total_batches} active manufacturing batches, shelf life, and quarantine flags.
          </p>
        </div>

        <div
          onClick={() => navigate('/inventory/adjustments')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Stock Adjustments</h3>
          <p className="text-xs text-slate-600">
            Process write-offs, physical count discrepancies, and approved inventory modifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardPage;
