import React, { useState, useEffect } from 'react';
import { Microscope, Beaker, Lightbulb, Compass, RefreshCw } from 'lucide-react';
import { dashboardsService } from '../../services/dashboards.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const RndExecutiveDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardsService.getRnd();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load R&D executive cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="R&D / NPD Head Executive Innovation Cockpit"
          subtitle="Innovation velocity, active stage-gate NPD projects, prototype readiness, and time-to-market metrics."
          breadcrumbs={[{ label: 'Executive Cockpits' }, { label: 'R&D Executive' }]}
        />
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active NPD Projects</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.rnd?.activeNpdProjects || 0} In Flight</div>
          <div className="text-xs text-slate-400 mt-1">Design, sampling & testing</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Opportunities</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{data?.rnd?.pipelineOpportunities || 0} Scored</div>
          <div className="text-xs text-slate-400 mt-1">High ROI business cases</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab Samples Ready</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{data?.rnd?.samplesReady || 0} Prototype</div>
          <div className="text-xs text-slate-400 mt-1">Ready for buyer evaluation</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time to Market Velocity</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.rnd?.timeToMarketWeeks || 12} Weeks</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">Innovation Index: {data?.rnd?.innovationIndex || '8.6/10'}</div>
        </div>
      </div>
    </div>
  );
};

export default RndExecutiveDashboardPage;
