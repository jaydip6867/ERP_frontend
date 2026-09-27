import React from 'react';
import { TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';

export const CashFlowProjectionPage = () => {
  const weeks = [
    { period: 'Week 1 (Current)', inflows: 4200000, outflows: 3100000, net: 1100000, closing: 8500000 },
    { period: 'Week 2 (+7 Days)', inflows: 5800000, outflows: 4900000, net: 900000, closing: 9400000 },
    { period: 'Week 3 (+14 Days)', inflows: 3600000, outflows: 2800000, net: 800000, closing: 10200000 },
    { period: 'Week 4 (+21 Days)', inflows: 6200000, outflows: 5400000, net: 800000, closing: 11000000 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Direct Cash Flow Forecast & Liquidity Runway"
          subtitle="Rolling 30-60-90 day treasury projections, receivable settlements, supplier payables schedule, and bank balances."
          breadcrumbs={[{ label: 'Finance' }, { label: 'Cash Flow Projection' }]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Liquid Treasury</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">₹74,00,000</div>
          <div className="text-xs text-slate-400 mt-1">Across primary corporate bank accounts</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projected 30-Day Inflows</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">₹1,98,00,000</div>
          <div className="text-xs text-slate-400 mt-1">From vetted customer receivables</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Committed 30-Day Outflows</div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">₹1,62,00,000</div>
          <div className="text-xs text-slate-400 mt-1">Yarn bills, mill processing & payroll</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900">Weekly Liquidity Waterfall</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Projection Horizon</th>
                <th className="px-5 py-3">Expected Inflows</th>
                <th className="px-5 py-3">Committed Outflows</th>
                <th className="px-5 py-3">Net Cash Flow</th>
                <th className="px-5 py-3">Estimated Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeks.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{w.period}</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-600">₹{(w.inflows).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 font-mono text-rose-600">₹{(w.outflows).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-indigo-600">+₹{(w.net).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">₹{(w.closing).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlowProjectionPage;
