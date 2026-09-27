import React, { useState, useEffect } from 'react';
import { Hammer, Layers, AlertOctagon, CheckCircle2, Clock, PlayCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { productionService } from '../../services/production.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const ProductionDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    total_work_orders: 0,
    in_progress_wo: 0,
    completed_wo: 0,
    today_logs_count: 0,
    total_scrap_qty: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await productionService.getDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production & Shop Floor Execution"
        subtitle="Manage manufacturing work orders, BOM explosion, material checks, shifts, and shop floor output."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/production/material-check"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Material Availability Check
            </Link>
            <Link
              to="/production/work-orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Hammer className="w-4 h-4" />
              Work Orders
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Work Orders" value={metrics.total_work_orders} icon={Layers} description="Active production jobs" />
        <StatCard title="In Production" value={metrics.in_progress_wo} icon={PlayCircle} description="Actively on shop floor" />
        <StatCard title="Completed Jobs" value={metrics.completed_wo} icon={CheckCircle2} description="Passed to finished goods" />
        <StatCard title="Logged Scrap (Units)" value={metrics.total_scrap_qty} icon={AlertOctagon} description="Scrapped materials" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/production/work-orders')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Hammer className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Work Orders</h3>
          <p className="text-xs text-slate-600">
            Create jobs against Sales Orders or stock replenishment with assigned BOMs and staging warehouses.
          </p>
        </div>

        <div
          onClick={() => navigate('/production/logs')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Production Shift Logs</h3>
          <p className="text-xs text-slate-600">
            Record hourly or shift production counts, downtime reasons, machine telemetry, and operator entries.
          </p>
        </div>

        <div
          onClick={() => navigate('/production/material-issue')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Material Issues</h3>
          <p className="text-xs text-slate-600">
            Issue raw materials from warehouse to assembly lines with atomic inventory stock deductions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboardPage;
