import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, Check, X } from 'lucide-react';
import { executiveService } from '../../services/executive.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const FounderDecisionsPage = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getFounderDecisions();
      setDecisions(res.data || []);
    } catch (err) {
      console.error('Failed to load founder decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await executiveService.executeDecisionAction(id, { action, remarks: `Actioned as ${action}` });
      loadDecisions();
    } catch (err) {
      console.error(`Failed to execute decision ${action}:`, err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Founder Decision & Sign-off Dashboard"
        subtitle="Critical executive escalations requiring founder/MD approval (credit limit overrides, major CAPEX, high-value discounts)."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Executive', href: '/executive/ceo' },
          { label: 'Founder Decisions' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Decision Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Entity Reference</th>
                <th className="py-3 px-4 text-right">Financial Impact (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading decisions...</td>
                </tr>
              ) : decisions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No pending founder decisions</td>
                </tr>
              ) : (
                decisions.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{d.title}</div>
                      <div className="text-xs text-slate-500">{d.description}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">{d.category}</td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{d.requested_by?.full_name || 'Department Manager'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-indigo-600">{d.entity_reference || 'REF-DOC'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(d.financial_impact || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : d.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {d.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleAction(d._id, 'APPROVED')}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(d._id, 'REJECTED')}
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Decided</span>
                      )}
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

export default FounderDecisionsPage;
