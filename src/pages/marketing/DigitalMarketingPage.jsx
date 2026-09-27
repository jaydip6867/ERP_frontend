import React, { useState } from 'react';
import { Globe, TrendingUp, BarChart2, DollarSign, Target, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';

export const DigitalMarketingPage = () => {
  const [channels] = useState([
    { name: 'Google Ads (Search & Shopping)', spend: 120000, clicks: 18400, conversions: 420, roas: '4.2x' },
    { name: 'Meta Ads (Instagram & Facebook)', spend: 250000, impressions: '1.2M', leads: 840, cpa: '₹297' },
    { name: 'LinkedIn B2B Sponsored InMail', spend: 85000, qualified_leads: 62, cpl: '₹1,370', status: 'Active' },
    { name: 'Organic SEO & Programmatic Pages', traffic: '45,200', keywords_ranked: 380, domain_rating: 46 },
  ]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Digital Marketing, Paid Media & SEO Acquisition"
          subtitle="Omnichannel campaign management, paid search, social display, programmatic advertising, and organic growth."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Digital Marketing' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ad Spend (MTD)</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">₹4,55,000</div>
          <div className="text-xs text-slate-400 mt-1">Google + Meta + LinkedIn</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbound Digital Leads</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">1,322 Leads</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">↑ 18% vs last month</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blended ROAS</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">4.18x</div>
          <div className="text-xs text-slate-400 mt-1">Revenue to ad spend ratio</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organic Search Visitors</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">45.2K Visits</div>
          <div className="text-xs text-slate-400 mt-1">Surat & Pan-India B2B keywords</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900">Paid Acquisition Channels</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Channel / Platform</th>
                <th className="px-5 py-3">Monthly Spend</th>
                <th className="px-5 py-3">Performance Output</th>
                <th className="px-5 py-3">Efficiency Metric</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((ch, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{ch.name}</td>
                  <td className="px-5 py-3.5 font-mono">₹{(ch.spend || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-700">
                    {ch.conversions ? `${ch.conversions} Orders` : ch.leads ? `${ch.leads} Leads` : `${ch.traffic} Sessions`}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-indigo-600">
                    {ch.roas ? `ROAS: ${ch.roas}` : ch.cpa ? `CPA: ${ch.cpa}` : `CPL: ${ch.cpl || 'N/A'}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DigitalMarketingPage;
