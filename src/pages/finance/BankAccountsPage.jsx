import React, { useState, useEffect } from 'react';
import { Landmark, Plus, CheckCircle, RefreshCw, CreditCard } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const BankAccountsPage = () => {
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [banksRes, txRes] = await Promise.all([
        financeService.getBankAccounts(),
        financeService.getBankTransactions(),
      ]);
      setBanks(banksRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error('Failed to load bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts & Liquidity Management"
        subtitle="Corporate current accounts, live book balances, and bank transaction statements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Bank Accounts' },
        ]}
      />

      {/* Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banks.map((b) => (
          <div key={b._id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {b.account_type || 'CURRENT'}
              </span>
              <span className="text-xs text-slate-400 font-mono">IFSC: {b.ifsc_code}</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">{b.bank_name}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Acc No: {b.account_number}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Current Balance</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">
                ₹{(b.current_balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Transactions Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Bank Transactions & Cleared Vouchers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Bank</th>
                <th className="py-3 px-4">Description / Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Debit (Withdrawal)</th>
                <th className="py-3 px-4 text-right">Credit (Deposit)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No bank transactions recorded</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {tx.bank_account_id?.bank_name || 'Bank'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{tx.description || tx.reference_number || 'Direct Transfer'}</td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      {tx.transaction_type === 'CREDIT' ? (
                        <span className="text-emerald-600">INFLOW</span>
                      ) : (
                        <span className="text-rose-600">OUTFLOW</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">
                      {tx.transaction_type === 'DEBIT' ? `₹${tx.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600">
                      {tx.transaction_type === 'CREDIT' ? `₹${tx.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {tx.is_reconciled ? 'Reconciled' : 'Recorded'}
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

export default BankAccountsPage;
