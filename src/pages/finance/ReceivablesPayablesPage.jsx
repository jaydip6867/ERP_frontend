import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, AlertCircle, RefreshCw, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';
import { Badge } from '../../components/ui/Badge';

export const ReceivablesPayablesPage = () => {
  const [activeTab, setActiveTab] = useState('receivables');
  const [receivables, setReceivables] = useState([]);
  const [recSummary, setRecSummary] = useState({ total: 0, aging: {} });
  const [payables, setPayables] = useState([]);
  const [paySummary, setPaySummary] = useState({ total: 0, aging: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recRes, payRes] = await Promise.all([
        financeService.getReceivables(),
        financeService.getPayables(),
      ]);

      // Normalize Receivables data
      const recData = recRes?.data || {};
      const recInvoices = Array.isArray(recData)
        ? recData
        : Array.isArray(recData.invoices)
        ? recData.invoices
        : Array.isArray(recRes?.invoices)
        ? recRes.invoices
        : [];

      setReceivables(recInvoices);
      setRecSummary({
        total: typeof recData.total_receivable === 'number'
          ? recData.total_receivable
          : recInvoices.reduce((sum, item) => sum + (item.balance_amount || 0), 0),
        aging: recData.aging_buckets || {},
      });

      // Normalize Payables data
      const payData = payRes?.data || {};
      const payBills = Array.isArray(payData)
        ? payData
        : Array.isArray(payData.bills)
        ? payData.bills
        : Array.isArray(payRes?.bills)
        ? payRes.bills
        : [];

      setPayables(payBills);
      setPaySummary({
        total: typeof payData.total_payable === 'number'
          ? payData.total_payable
          : payBills.reduce((sum, item) => sum + (item.balance_amount || 0), 0),
        aging: payData.aging_buckets || {},
      });
    } catch (err) {
      console.error('Failed to load receivables/payables:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  const safeReceivables = Array.isArray(receivables) ? receivables : [];
  const safePayables = Array.isArray(payables) ? payables : [];

  const totalReceivables = recSummary.total || safeReceivables.reduce((sum, item) => sum + (item.balance_amount || 0), 0);
  const totalPayables = paySummary.total || safePayables.reduce((sum, item) => sum + (item.balance_amount || 0), 0);

  const currentAging = activeTab === 'receivables' ? recSummary.aging : paySummary.aging;

  // Filter current active list by search term
  const currentList = activeTab === 'receivables' ? safeReceivables : safePayables;
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return currentList;
    const term = searchTerm.toLowerCase();
    return currentList.filter((item) => {
      const docNo = (item.invoice_number || item.bill_number || item.po_number || '').toLowerCase();
      const party = (item.customer_name || item.supplier_name || item.customer_id?.company_name || item.supplier_id?.supplier_name || '').toLowerCase();
      return docNo.includes(term) || party.includes(term);
    });
  }, [currentList, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receivables & Payables Ageing"
        subtitle="Customer invoice receivables and supplier payment liabilities categorized by maturity and overdue ageing."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Receivables & Payables' },
        ]}
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
          <button
            onClick={loadData}
            className="ml-auto text-xs font-semibold underline hover:text-rose-900 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('receivables');
            setSearchTerm('');
          }}
          className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'receivables'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Customer Receivables (₹{totalReceivables.toLocaleString()})
        </button>
        <button
          onClick={() => {
            setActiveTab('payables');
            setSearchTerm('');
          }}
          className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'payables'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Supplier Payables (₹{totalPayables.toLocaleString()})
        </button>
      </div>

      {/* Aging Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>0 - 30 Days (Current)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600">
            ₹{(currentAging.current_0_30 || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Normal credit period</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>31 - 60 Days</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-600">
            ₹{(currentAging.overdue_31_60 || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Mild delay overdue</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>61 - 90 Days</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600">
            ₹{(currentAging.overdue_61_90 || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Requires follow-up</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>90+ Days (Critical)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            ₹{(currentAging.overdue_90_plus || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">High risk / escalate</p>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search by ${activeTab === 'receivables' ? 'invoice' : 'bill'} no, party...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing <span className="font-bold text-slate-900">{filteredList.length}</span> {activeTab === 'receivables' ? 'receivable' : 'payable'} record(s)
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Doc Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">{activeTab === 'receivables' ? 'Customer' : 'Supplier'}</th>
                <th className="py-3 px-4 text-center">Ageing / Overdue</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-right">Paid (₹)</th>
                <th className="py-3 px-4 text-right">Outstanding (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading ageing records...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                      <span className="font-semibold text-slate-700">No outstanding records found</span>
                      <span className="text-xs text-slate-400">
                        {searchTerm ? 'No results match your search filter.' : 'All accounts are completely balanced and settled.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const docNumber = item.invoice_number || item.bill_number || item.po_number || item.doc_number || `DOC-${idx + 1}`;
                  const docDate = item.invoice_date || item.bill_date || item.createdAt;
                  const dueDate = item.due_date;
                  const partyName = item.customer_name || item.supplier_name || item.customer_id?.company_name || item.supplier_id?.supplier_name || 'Party';
                  const total = item.total_amount || item.grand_total || 0;
                  const outstanding = item.balance_amount !== undefined ? item.balance_amount : total;
                  const paid = item.paid_amount !== undefined ? item.paid_amount : Math.max(0, total - outstanding);
                  const days = item.days_overdue !== undefined ? item.days_overdue : item.days_outstanding !== undefined ? item.days_outstanding : null;

                  return (
                    <tr key={item._id || item.invoice_id || item.bill_id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                        {docNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {docDate ? new Date(docDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                        {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {partyName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {days !== null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${
                              days > 90
                                ? 'bg-rose-100 text-rose-800'
                                : days > 60
                                ? 'bg-amber-100 text-amber-800'
                                : days > 30
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {days}d overdue
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Current</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ₹{total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600">
                        ₹{paid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        ₹{outstanding.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            outstanding === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : paid > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {outstanding === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending'}
                        </span>
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

export default ReceivablesPayablesPage;
