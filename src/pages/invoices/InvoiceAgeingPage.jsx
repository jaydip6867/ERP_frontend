import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const InvoiceAgeingPage = () => {
  const navigate = useNavigate();
  const [ageing, setAgeing] = useState({
    under_30: { count: 0, amount: 0, invoices: [] },
    days_31_60: { count: 0, amount: 0, invoices: [] },
    days_61_90: { count: 0, amount: 0, invoices: [] },
    above_90: { count: 0, amount: 0, invoices: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgeing();
  }, []);

  const loadAgeing = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoiceAgeing();
      setAgeing(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buckets = [
    { title: 'Current (0 - 30 Days)', count: ageing.under_30?.count || 0, amount: ageing.under_30?.amount || 0, color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
    { title: 'Due (31 - 60 Days)', count: ageing.days_31_60?.count || 0, amount: ageing.days_31_60?.amount || 0, color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { title: 'Overdue (61 - 90 Days)', count: ageing.days_61_90?.count || 0, amount: ageing.days_61_90?.amount || 0, color: 'border-orange-300 bg-orange-50 text-orange-800' },
    { title: 'Critical (90+ Days)', count: ageing.above_90?.count || 0, amount: ageing.above_90?.amount || 0, color: 'border-rose-300 bg-rose-50 text-rose-800' },
  ];

  const totalOutstanding =
    (ageing.under_30?.amount || 0) +
    (ageing.days_31_60?.amount || 0) +
    (ageing.days_61_90?.amount || 0) +
    (ageing.above_90?.amount || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Receivable & Ageing Analysis"
        subtitle="Track unpaid invoice exposures and credit default risks across ageing maturity buckets."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'Ageing' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {buckets.map((b, idx) => (
          <div key={idx} className={`p-5 rounded-xl border ${b.color} shadow-sm space-y-2`}>
            <span className="text-xs font-bold uppercase tracking-wider">{b.title}</span>
            <p className="text-2xl font-extrabold font-mono text-slate-900">
              ₹{Number(b.amount).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-600 font-medium">{b.count} invoices pending</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Overdue & Unpaid Invoices Summary
        </h3>
        <p className="text-xs text-slate-600">
          Total accounts receivable exposure currently stands at{' '}
          <strong className="text-slate-900 font-mono text-sm">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </strong>
          . Credit terms and customer credit limits are enforced at the Sales Order level.
        </p>
      </div>
    </div>
  );
};

export default InvoiceAgeingPage;
