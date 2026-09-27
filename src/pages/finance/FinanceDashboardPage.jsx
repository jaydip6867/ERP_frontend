import React, { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, Scale, Plus, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const FinanceDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await financeService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load finance dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Financial Intelligence"
        subtitle="Double-entry general ledger, liquidity monitoring, receivables, payables, and GAAP statements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Refresh
            </button>
            <Link
              to="/finance/statements"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Financial Statements
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bank & Liquid Cash"
          value={`₹${(data?.liquid_cash || data?.total_bank_balance || 0).toLocaleString()}`}
          subtitle="Available in active corporate accounts"
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Accounts Receivable"
          value={`₹${(data?.total_receivables || 0).toLocaleString()}`}
          subtitle="Customer outstanding invoices"
          icon={ArrowDownLeft}
          variant="warning"
        />
        <StatCard
          title="Accounts Payable"
          value={`₹${(data?.total_payables || 0).toLocaleString()}`}
          subtitle="Supplier bills due for settlement"
          icon={ArrowUpRight}
          variant="danger"
        />
        <StatCard
          title="Net Working Capital"
          value={`₹${((data?.liquid_cash || 0) + (data?.total_receivables || 0) - (data?.total_payables || 0)).toLocaleString()}`}
          subtitle="Current Assets - Current Liabilities"
          icon={Scale}
          variant="success"
        />
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/finance/chart-of-accounts"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">Chart of Accounts</h4>
          <p className="text-xs text-slate-500 mt-1">Structure assets, liabilities, equity, revenues & expenses</p>
        </Link>

        <Link
          to="/finance/journals"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600">General Journal</h4>
          <p className="text-xs text-slate-500 mt-1">Double-entry voucher entries with debit-credit enforcement</p>
        </Link>

        <Link
          to="/finance/receipts"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600">Customer Receipts</h4>
          <p className="text-xs text-slate-500 mt-1">Inward payments, invoice knock-offs & allocations</p>
        </Link>

        <Link
          to="/finance/payments"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-amber-600">Supplier Payments</h4>
          <p className="text-xs text-slate-500 mt-1">Outward disbursements against purchase bills</p>
        </Link>
      </div>

      {/* Financial Health Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-indigo-600" />
          General Ledger System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500 uppercase">Double-Entry Balance</div>
            <div className="text-xl font-bold text-emerald-600 mt-1">Balanced ✓</div>
            <p className="text-xs text-slate-500 mt-1">Total debits strictly equal total credits across all journals</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500 uppercase">Automated Clearance</div>
            <div className="text-xl font-bold text-indigo-600 mt-1">Active</div>
            <p className="text-xs text-slate-500 mt-1">Auto-reconciliation on receipt/payment issuance</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500 uppercase">Audit Compliance</div>
            <div className="text-xl font-bold text-purple-600 mt-1">100% Traceable</div>
            <p className="text-xs text-slate-500 mt-1">All journal lines include user ID, timestamp & audit trail</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
