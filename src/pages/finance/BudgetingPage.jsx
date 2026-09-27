import React from 'react';
import { DollarSign, TrendingUp, PieChart, ShieldCheck, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';

export const BudgetingPage = () => {
  const budgets = [
    { department: 'Manufacturing & Mills', allocated: 45000000, consumed: 38200000, pct: 84.8 },
    { department: 'Sales & Distribution', allocated: 12000000, consumed: 9400000, pct: 78.3 },
    { department: 'Marketing & Digital Media', allocated: 8000000, consumed: 7100000, pct: 88.7 },
    { department: 'Technology & Automation', allocated: 5000000, consumed: 3800000, pct: 76.0 },
    { department: 'R&D / New Product Development', allocated: 6000000, consumed: 4100000, pct: 68.3 },
    { department: 'Human Resources & People', allocated: 4000000, consumed: 3200000, pct: 80.0 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Corporate Budgeting & OPEX / CAPEX Approvals"
          subtitle="Departmental fiscal allocations, variance thresholds, budget freeze controls, and capex requests."
          breadcrumbs={[{ label: 'Finance' }, { label: 'Budgeting' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{b.department}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  b.pct > 85 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {b.pct}% Consumed
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-xs text-slate-400">Consumed</div>
                  <div className="text-lg font-bold font-mono text-slate-900">₹{(b.consumed / 100000).toFixed(1)}L</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Budget</div>
                  <div className="text-lg font-bold font-mono text-slate-600">₹{(b.allocated / 100000).toFixed(1)}L</div>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${b.pct > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${b.pct}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetingPage;
