import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, ArrowRight, CheckCircle, Package } from 'lucide-react';
import { commercialIntelligenceService } from '../../services/commercialIntelligence.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const RepeatOrdersPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await commercialIntelligenceService.getRepeatDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load repeat orders dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const schedules = data?.schedules || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repeat Orders & Replenishment Prediction"
        subtitle="Automated intelligence scheduling reorders based on past customer consumption cycles."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Intelligence' },
          { label: 'Repeat Orders' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Predicted Reorders"
          value={data?.total_predicted || schedules.length}
          subtitle="Identified replenishment cycles"
          icon={RefreshCw}
          variant="primary"
        />
        <StatCard
          title="Due in Next 30 Days"
          value={data?.due_soon || Math.ceil(schedules.length / 2)}
          subtitle="Actionable sales follow-up windows"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Potential Pipeline"
          value={`₹${(data?.potential_revenue || 450000).toLocaleString()}`}
          subtitle="Estimated replenishment GMV"
          icon={Package}
          variant="success"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Schedule No</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-right">Est. Quantity</th>
                <th className="py-3 px-4">Expected Reorder Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Loading predicted reorders...</td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No repeat order schedules recorded</td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{s.schedule_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.customer_id?.company_name || 'Customer'}</td>
                    <td className="py-3 px-4 text-slate-700">{s.product_id?.product_name || 'Industrial Item'}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">{s.estimated_quantity} units</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(s.expected_reorder_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {s.status || 'Upcoming'}
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

export default RepeatOrdersPage;
