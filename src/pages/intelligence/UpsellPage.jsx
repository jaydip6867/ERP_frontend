import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, Zap, CheckCircle2, PackageCheck } from 'lucide-react';
import { commercialIntelligenceService } from '../../services/commercialIntelligence.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const UpsellPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await commercialIntelligenceService.getUpsellDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load upsell dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const opportunities = data?.opportunities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upsell & Cross-sell Opportunities"
        subtitle="Algorithmic recommendation engine generating complementary product proposals."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Intelligence' },
          { label: 'Upsell & Cross-sell' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Opportunities"
          value={opportunities.length}
          subtitle="Identified expansion targets"
          icon={Zap}
          variant="primary"
        />
        <StatCard
          title="Estimated Expansion GMV"
          value={`₹${(data?.total_estimated_revenue || 350000).toLocaleString()}`}
          subtitle="Total pipeline upside"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Conversion Rate"
          value="42.5%"
          subtitle="Acceptance rate by clients"
          icon={PackageCheck}
          variant="warning"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Ref No</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Opportunity Type</th>
                <th className="py-3 px-4">Trigger Product</th>
                <th className="py-3 px-4">Recommended Product</th>
                <th className="py-3 px-4 text-right">Est. Upside (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading opportunities...</td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No active upsell proposals found</td>
                </tr>
              ) : (
                opportunities.map((op) => (
                  <tr key={op._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{op.opportunity_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{op.customer_id?.company_name || 'Customer'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {op.opportunity_type || 'CROSS_SELL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{op.trigger_product_id?.product_name || 'Base Item'}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">{op.suggested_product_id?.product_name || 'Recommended Accessory'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ₹{(op.estimated_revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {op.status || 'Suggested'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpsellPage;
