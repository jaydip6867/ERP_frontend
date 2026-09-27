import React, { useState, useEffect } from 'react';
import { Target, Award, TrendingUp, CheckCircle, Search } from 'lucide-react';
import { performanceService } from '../../services/performance.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const TargetsPage = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const res = await performanceService.getTargets();
      setTargets(res.data || []);
    } catch (err) {
      console.error('Failed to load targets:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Targets & Goals Achievement"
        subtitle="Evaluate company, branch, and individual sales rep performance against live closed ERP sales."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Performance' },
          { label: 'Targets' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Goal Title</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Target (₹)</th>
                <th className="py-3 px-4 text-right">Actual Won (₹)</th>
                <th className="py-3 px-4 text-center">Achievement %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading target goals...</td>
                </tr>
              ) : targets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No targets configured</td>
                </tr>
              ) : (
                targets.map((t) => {
                  const pct = t.target_amount > 0 ? Math.round(((t.actual_amount || 0) / t.target_amount) * 100) : 0;
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{t.title}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t.target_level || 'USER'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{t.user_id?.full_name || t.assigned_name || 'Sales Team'}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{t.period || 'Q3 FY26'}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        ₹{(t.target_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        ₹{(t.actual_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          pct >= 100 ? 'bg-emerald-100 text-emerald-800' : pct >= 75 ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TargetsPage;
