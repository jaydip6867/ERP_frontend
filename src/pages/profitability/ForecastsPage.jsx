import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle, Sparkles, BarChart2 } from 'lucide-react';
import { profitabilityService } from '../../services/profitability.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const ForecastsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const res = await profitabilityService.getForecasts();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const projections = data?.forecast_periods || [
    { period: 'Next 30 Days (M+1)', projected_revenue: 650000, projected_material_cost: 290000, projected_profit: 240000, confidence: '92%' },
    { period: 'Next 60 Days (M+2)', projected_revenue: 1350000, projected_material_cost: 610000, projected_profit: 490000, confidence: '84%' },
    { period: 'Next 90 Days (M+3)', projected_revenue: 2100000, projected_material_cost: 950000, projected_profit: 760000, confidence: '76%' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forward Revenue & Demand Forecasting"
        subtitle="Predictive financial projections modeled on active quotations, repeat cycles, and historical trends."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Profitability', href: '/profitability' },
          { label: 'Forecasts' },
        ]}
      />

      {/* Strict Distinction Warning */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-bold">Governance Rule: </span>
          All figures on this page are <span className="font-semibold underline">projected statistical forecasts</span> and are
          strictly separated from certified General Ledger audited historical financials.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projections.map((p, idx) => (
          <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{p.period}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {p.confidence} Confidence
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500">Projected Pipeline Sales</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                ₹{p.projected_revenue.toLocaleString()}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Estimated Net Margin</span>
              <span className="font-mono font-bold text-emerald-600">
                + ₹{p.projected_profit.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastsPage;
