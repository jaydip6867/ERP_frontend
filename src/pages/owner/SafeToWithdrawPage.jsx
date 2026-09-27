import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Wallet, ArrowDownRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { expenseOwnerService } from '../../services/expenseOwner.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const SafeToWithdrawPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await expenseOwnerService.getSafeToWithdraw();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load safe-to-withdraw metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSafe = (data?.safe_to_withdraw_amount || 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safe-to-Withdraw Surplus Calculator"
        subtitle="Solvency & liquidity engine calculating permissible founder drawings without jeopardizing ERP commitments."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Owner Finance', href: '/owner/capital' },
          { label: 'Safe-to-Withdraw' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Recalculate Surplus
          </button>
        }
      />

      {/* Main Surplus Status Banner */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isSafe ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isSafe ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {isSafe ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Maximum Safe Owner Withdrawal
            </span>
            <div className={`text-3xl font-extrabold font-mono mt-0.5 ${
              isSafe ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              ₹{(data?.safe_to_withdraw_amount || 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-600 max-w-sm">
          {isSafe
            ? '✓ Healthy liquidity cushion. Drawing this amount will not impair operational runway, supplier payments, or statutory liabilities.'
            : '⚠ Warning: Current liquid reserves are below the mandatory 60-day operating threshold plus near-term payables.'}
        </div>
      </div>

      {/* Formula Breakdown Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Prudential Liquidity Formula Waterfall
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="font-semibold text-slate-800">Total Liquid Cash in Corporate Bank Accounts</span>
            <span className="font-mono font-bold text-emerald-600">
              + ₹{(data?.breakdown?.liquid_cash || 2500000).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-600 pl-4">Less: Supplier Payables Due in Next 30 Days</span>
            <span className="font-mono text-rose-600">
              - ₹{(data?.breakdown?.payables_due_30_days || 800000).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-600 pl-4">Less: Mandatory 60-Day Operating Runway Reserve</span>
            <span className="font-mono text-rose-600">
              - ₹{(data?.breakdown?.operating_reserve_60_days || 700000).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-600 pl-4">Less: Accrued Statutory Dues (GST & TDS Liabilities)</span>
            <span className="font-mono text-rose-600">
              - ₹{(data?.breakdown?.statutory_dues || 250000).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-3 bg-slate-50 px-4 rounded-lg font-bold text-base border border-slate-200">
            <span className="text-slate-900">Calculated Safe-to-Withdraw Capital</span>
            <span className={`font-mono ${isSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
              = ₹{(data?.safe_to_withdraw_amount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeToWithdrawPage;
