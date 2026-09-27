import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { technologyService } from '../../services/technology.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const BiReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await technologyService.getBiReports();
      setReports(res.data?.reports || [
        {
          _id: '1',
          name: 'Executive Sales & Revenue Velocity',
          category: 'Sales & Revenue',
          description: 'PowerBI dashboard tracking YoY revenue, EBITDA margins, and region-wise sales velocity.',
          embed_url: 'https://app.powerbi.com/view?r=eyJrIjoiZGFuemEtZGVtbyJ9',
          refresh_rate: 'Hourly',
        },
        {
          _id: '2',
          name: 'Supply Chain & Inventory Turnover Ratio',
          category: 'Operations',
          description: 'Real-time stock turnover rates, lead times, batch expiry risks, and warehouse capacity.',
          embed_url: 'https://metabase.danza.internal/dashboard/supply-chain',
          refresh_rate: 'Realtime',
        },
        {
          _id: '3',
          name: 'HR Headcount & Employee Retention Analytics',
          category: 'People & HR',
          description: 'Monthly attrition percentage, recruitment funnel yield, and department training hours.',
          embed_url: 'https://app.powerbi.com/view?r=eyJrIjoiZGFuemEtaHIifQ',
          refresh_rate: 'Daily',
        },
      ]);
    } catch (err) {
      toast.error('Failed to load BI dashboards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Business Intelligence & Analytics Hub"
          subtitle="Integrated PowerBI, Metabase, and custom executive data lake analytics dashboards."
          breadcrumbs={[{ label: 'Technology' }, { label: 'BI Reports' }]}
        />
        <button
          onClick={loadReports}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Dashboards
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reports.map((rep) => (
          <div key={rep._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                  {rep.category}
                </span>
                <span className="text-xs text-slate-400">Sync: {rep.refresh_rate}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{rep.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Direct Embed</span>
              <a
                href={rep.embed_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
              >
                Launch Dashboard <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BiReportsPage;
