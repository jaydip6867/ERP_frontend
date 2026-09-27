import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw, AlertOctagon, Plus, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { qcService } from '../../services/qc.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const QcDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    total_inspections: 0,
    passed: 0,
    failed: 0,
    rework: 0,
    scrap: 0,
    pending: 0,
    pass_rate_percent: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await qcService.getDashboardMetrics();
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
        title="Quality Assurance & QC Control"
        subtitle="Manage inspection gates across Incoming GRN, In-process shop floor, Final FG, and Pre-dispatch."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quality Control' },
        ]}
        actions={
          <Link
            to="/qc/inspections"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Inspection Register
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Pass Rate"
          value={`${metrics.pass_rate_percent}%`}
          icon={CheckCircle2}
          description="Quality compliance benchmark"
        />
        <StatCard
          title="Total Inspections"
          value={metrics.total_inspections}
          icon={ShieldCheck}
          description="Across all four operational gates"
        />
        <StatCard
          title="Rework Triggered"
          value={metrics.rework}
          icon={RotateCcw}
          description="Assigned for corrective action"
        />
        <StatCard
          title="Rejected / Scrapped"
          value={metrics.scrap + metrics.failed}
          icon={XCircle}
          description="Non-compliant material"
        />
      </div>

      {/* QC Inspection Gates */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Inspection Gates Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/qc/inspections?type=incoming')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-700 uppercase">Gate 1</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Incoming QC (GRN)</h4>
            <p className="text-xs text-slate-600 mt-1">Vendor supplies & raw material inwards</p>
          </div>

          <div
            onClick={() => navigate('/qc/inspections?type=in_process')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase">Gate 2</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">In-Process QC</h4>
            <p className="text-xs text-slate-600 mt-1">Interstage machining and assembly checks</p>
          </div>

          <div
            onClick={() => navigate('/qc/inspections?type=final')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase">Gate 3</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Final QC (Finished Goods)</h4>
            <p className="text-xs text-slate-600 mt-1">Acceptance before warehouse lot receipt</p>
          </div>

          <div
            onClick={() => navigate('/qc/inspections?type=dispatch')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 uppercase">Gate 4</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Dispatch QC</h4>
            <p className="text-xs text-slate-600 mt-1">Packaging, labeling, and customer shipment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QcDashboardPage;
