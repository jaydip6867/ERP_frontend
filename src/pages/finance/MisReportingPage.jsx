import React, { useState, useEffect } from 'react';
import { FileText, Plus, ExternalLink, Download, CheckCircle } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const MisReportingPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getManagementReports();
      setReports(res.data?.reports || [
        {
          _id: '1',
          title: 'Executive Board Pack & P&L Analysis',
          report_type: 'BOARD_DECK',
          period: '2026-09',
          status: 'published',
          file_url: 'https://danza.internal/finance/board-deck-q2.pdf',
        },
        {
          _id: '2',
          title: 'Monthly Departmental Budget Variance Statement',
          report_type: 'BUDGET_VARIANCE',
          period: '2026-08',
          status: 'published',
          file_url: 'https://danza.internal/finance/variance-aug.pdf',
        },
        {
          _id: '3',
          title: 'Apparel SKU Contribution Margin & Costing Audit',
          report_type: 'COSTING_SUMMARY',
          period: '2026-08',
          status: 'published',
          file_url: 'https://danza.internal/finance/sku-margins.pdf',
        },
      ]);
    } catch (err) {
      toast.error('Failed to load MIS reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Management Information System (MIS) Reports"
          subtitle="Monthly executive dossiers, variance analyses, board decks, and gross margin audits."
          breadcrumbs={[{ label: 'Finance' }, { label: 'MIS Reports' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reports.map((r) => (
          <div key={r._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700">
                  {r.report_type}
                </span>
                <span className="text-xs font-semibold text-slate-500">Period: {r.period}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{r.title}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                {r.status}
              </span>
              {r.file_url && (
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Download MIS <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisReportingPage;
