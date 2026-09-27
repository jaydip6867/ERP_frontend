import React from 'react';
import { Target, TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';

export const PerformanceMarketingPage = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Performance Marketing & Conversion Funnel"
          subtitle="Return on Ad Spend (ROAS), Customer Acquisition Cost (CAC), multi-touch attribution, and cohort retention."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Performance Marketing' }]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Acquisition Cost (CAC)</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">₹385 / Account</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">↓ 12% lower than target cap</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Lifetime Value (LTV)</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">₹48,200</div>
          <div className="text-xs text-indigo-600 mt-1 font-medium">LTV / CAC Ratio: 125x</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Checkout Conversion Funnel</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">3.4%</div>
          <div className="text-xs text-slate-400 mt-1">Lead to confirmed B2B order</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMarketingPage;
