import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const ReceivablesPayablesPage = () => {
  const [activeTab, setActiveTab] = useState('receivables');
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, payRes] = await Promise.all([
        financeService.getReceivables(),
        financeService.getPayables(),
      ]);
      setReceivables(recRes.data || []);
      setPayables(payRes.data || []);
    } catch (err) {
      console.error('Failed to load receivables/payables:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalReceivables = receivables.reduce((sum, item) => sum + (item.balance_amount || 0), 0);
  const totalPayables = payables.reduce((sum, item) => sum + (item.balance_amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receivables & Payables Ageing"
        subtitle="Customer invoice receivables and supplier payment liabilities categorized by ageing."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Receivables & Payables' },
        ]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('receivables')}
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
          onClick={() => setActiveTab('payables')}
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

      {/* Content Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Doc Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">{activeTab === 'receivables' ? 'Customer' : 'Supplier'}</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-right">Paid (₹)</th>
                <th className="py-3 px-4 text-right">Outstanding (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading records...</td>
                </tr>
              ) : (activeTab === 'receivables' ? receivables : payables).length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No outstanding records found</td>
                </tr>
              ) : (
                (activeTab === 'receivables' ? receivables : payables).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      {item.invoice_number || item.po_number || 'DOC'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {new Date(item.createdAt || item.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.customer_id?.company_name || item.supplier_id?.supplier_name || 'Party'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{(item.grand_total || item.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600">
                      ₹{(item.paid_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      ₹{(item.balance_amount || item.grand_total || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {item.payment_status || 'Pending'}
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

export default ReceivablesPayablesPage;
