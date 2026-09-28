import React, { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldAlert, Plus, Coins, RefreshCw } from 'lucide-react';
import { expenseOwnerService } from '../../services/expenseOwner.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';
import { Badge } from '../../components/ui/Badge';

export const OwnerCapitalPage = () => {
  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState({ net_equity: 0, total_infused: 0, total_drawings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await expenseOwnerService.getOwnerLedger();
      const rawData = res.data || {};
      const txList = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData.transactions)
        ? rawData.transactions
        : [];

      setLedger(txList);

      const infused = typeof rawData.total_capital_infused === 'number'
        ? rawData.total_capital_infused
        : txList
            .filter((tx) => tx.transaction_type === 'CAPITAL_CONTRIBUTION' || tx.transaction_type === 'CAPITAL_INFUSION')
            .reduce((s, tx) => s + (tx.amount || 0), 0);

      const drawings = typeof rawData.total_drawings === 'number'
        ? rawData.total_drawings
        : txList
            .filter((tx) => tx.transaction_type === 'DRAWING' || tx.transaction_type === 'DRAWINGS')
            .reduce((s, tx) => s + (tx.amount || 0), 0);

      const net = typeof rawData.net_equity === 'number'
        ? rawData.net_equity
        : (infused - drawings);

      setSummary({ net_equity: net, total_infused: infused, total_drawings: drawings });
    } catch (err) {
      console.error('Failed to load owner capital ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const safeLedger = Array.isArray(ledger) ? ledger : [];
  const totalInfused = summary.total_infused;
  const totalDrawings = summary.total_drawings;
  const netOwnerEquity = summary.net_equity;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Capital & Equity Ledger"
        subtitle="Manage promoter equity infusions, partner capital accounts, and personal drawings."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Owner Capital' },
        ]}
        actions={
          <button
            onClick={loadLedger}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Strict Accounting Rule Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Strict Accounting Standard: </span>
          Owner drawings and profit withdrawals are categorized as{' '}
          <span className="font-semibold underline">Reductions of Equity (Drawings)</span> on the Balance Sheet.
          They are <span className="font-bold">strictly prohibited</span> from being logged as Operating Expenses in P&L.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Capital Infused"
          value={`₹${totalInfused.toLocaleString()}`}
          subtitle="Cumulative promoter contributions"
          icon={ArrowDownLeft}
          variant="success"
        />
        <StatCard
          title="Total Drawings Withdrawn"
          value={`₹${totalDrawings.toLocaleString()}`}
          subtitle="Drawings deducted from equity"
          icon={ArrowUpRight}
          variant="danger"
        />
        <StatCard
          title="Net Owner Equity Balance"
          value={`₹${netOwnerEquity.toLocaleString()}`}
          subtitle="Remaining capital standing"
          icon={Landmark}
          variant="primary"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Capital Ledger & Drawings Log</h3>
          <span className="text-xs text-slate-500 font-medium">
            {safeLedger.length} transaction(s) recorded
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Transaction No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Partner / Owner</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Loading capital ledger...</td>
                </tr>
              ) : safeLedger.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No capital transactions recorded</td>
                </tr>
              ) : (
                safeLedger.map((tx, idx) => {
                  const isDrawing = tx.transaction_type === 'DRAWING' || tx.transaction_type === 'DRAWINGS';
                  return (
                    <tr key={tx._id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{tx.transaction_number || `TX-${idx + 1}`}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                        {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{tx.owner_name || 'Founder'}</td>
                      <td className="py-3 px-4">
                        {!isDrawing ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Capital Infusion (+)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Drawing / Withdrawal (-)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{tx.description || '-'}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${isDrawing ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isDrawing ? '-' : '+'} ₹{(tx.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerCapitalPage;
