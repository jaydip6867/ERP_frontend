import React, { useState, useEffect } from 'react';
import { Target, DollarSign, Users, Award, TrendingUp, Calendar, Plus } from 'lucide-react';
import { marketingService } from '../../services/marketing.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';
import { Badge } from '../../components/ui/Badge';

export const MarketingCampaignsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await marketingService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load marketing dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const campaigns = data?.campaigns || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Campaigns & Full ROI Attribution"
        subtitle="End-to-end attribution: Campaign → Lead → Quotation → Sales Order → Invoice Revenue."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Marketing' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Marketing Spend"
          value={`₹${(data?.total_spend || 120000).toLocaleString()}`}
          subtitle="Cumulative ad & outreach cost"
          icon={DollarSign}
          variant="danger"
        />
        <StatCard
          title="Attributed Revenue"
          value={`₹${(data?.attributed_revenue || 850000).toLocaleString()}`}
          subtitle="Closed sales from campaigns"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Overall Marketing ROI"
          value={`${data?.overall_roi || 608}%`}
          subtitle="Revenue generated per ₹ spent"
          icon={Award}
          variant="primary"
        />
        <StatCard
          title="Blended Cost Per Lead (CPL)"
          value={`₹${(data?.blended_cpl || 450).toLocaleString()}`}
          subtitle="Average acquisition cost"
          icon={Users}
          variant="warning"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Spend (₹)</th>
                <th className="py-3 px-4 text-center">Leads Generated</th>
                <th className="py-3 px-4 text-center">Orders Won</th>
                <th className="py-3 px-4 text-right">Attributed Revenue (₹)</th>
                <th className="py-3 px-4 text-right">ROI %</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading campaigns...</td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No campaigns recorded</td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.campaign_name}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">{c.channel}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      ₹{(c.total_spend || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">{c.leads_count || 0}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{c.orders_count || 0}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(c.attributed_revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {c.roi_percentage || 0}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {c.status || 'Active'}
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

export default MarketingCampaignsPage;
