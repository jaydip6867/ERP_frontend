import React, { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldAlert, Plus, Coins } from 'lucide-react';
import { expenseOwnerService } from '../../services/expenseOwner.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';
import { Badge } from '../../components/ui/Badge';

export const OwnerCapitalPage = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await expenseOwnerService.getOwnerLedger();
      setLedger(res.data || []);
    } catch (err) {
      console.error('Failed to load owner capital ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalInfused = ledger
    .filter((tx) => tx.transaction_type === 'CAPITAL_CONTRIBUTION')
    .reduce((s, tx) => s + (tx.amount || 0), 0);
  const totalDrawings = ledger
    .filter((tx) => tx.transaction_type === 'DRAWING')
    .reduce((s, tx) => s + (tx.amount || 0), 0);
  const netOwnerEquity = totalInfused - totalDrawings;

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
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Capital Ledger & Drawings Log</h3>
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
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No capital transactions recorded</td>
                </tr>
              ) : (
                ledger.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{tx.transaction_number}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{tx.owner_name || 'Founder'}</td>
                    <td className="py-3 px-4">
                      {tx.transaction_type === 'CAPITAL_CONTRIBUTION' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Capital Infusion (+)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Drawing / Withdrawal (-)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{tx.description}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${tx.transaction_type === 'DRAWING' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.transaction_type === 'DRAWING' ? '-' : '+'} ₹{(tx.amount || 0).toLocaleString()}
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

export default OwnerCapitalPage;
