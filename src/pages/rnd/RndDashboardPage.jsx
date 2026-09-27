import React, { useState, useEffect } from 'react';
import { Microscope, Beaker, Lightbulb, Compass, Award, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const RndDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await rndService.getDashboard();
      setMetrics(res.data || {});
    } catch (err) {
      toast.error('Failed to load R&D cockpit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="R&D, NPD & Innovation Command"
          subtitle="New product development pipeline, prototyping labs, market benchmarking, and quality root-cause problem solving."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Dashboard' }]}
        />
        <div className="flex items-center gap-2">
          <Link
            to="/rnd/product-development"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Launch NPD Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active NPD Projects</span>
            <Beaker className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.activeProjectsCount || 0} In Flight
          </div>
          <div className="text-xs text-indigo-600 mt-1 font-medium">Design & Lab Testing</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Lab Prototype Samples</span>
            <Microscope className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.pendingSamplesCount || 0} In Evaluation
          </div>
          <div className="text-xs text-slate-400 mt-1">Material & wear stress tests</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Uncapped Opportunities</span>
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.opportunitiesCount || 0} Ideas
          </div>
          <div className="text-xs text-slate-400 mt-1">Feasibility scored & prioritized</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Quality 8D Problems</span>
            <Compass className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.openProblemSolvingCount || 0} Open
          </div>
          <div className="text-xs text-slate-400 mt-1">Root cause analysis underway</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">R&D & Product Innovation Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { title: 'Market Research', link: '/rnd/market-research', icon: '📊' },
            { title: 'Competitors', link: '/rnd/competitors', icon: '🔍' },
            { title: 'R&D Opportunities', link: '/rnd/opportunities', icon: '💡' },
            { title: 'NPD Projects', link: '/rnd/product-development', icon: '🧪' },
            { title: 'Lab Samples', link: '/rnd/samples', icon: '🥼' },
            { title: 'Product Testing', link: '/rnd/testing', icon: '⚖️' },
            { title: 'Improvements', link: '/rnd/improvements', icon: '📈' },
            { title: 'Customer Research', link: '/rnd/customer-research', icon: '🗣️' },
            { title: 'Feedback & NPS', link: '/rnd/feedback', icon: '⭐' },
            { title: '8D Problem Solving', link: '/rnd/problem-solving', icon: '🧩' },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition text-center"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-bold text-slate-800">{item.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RndDashboardPage;
