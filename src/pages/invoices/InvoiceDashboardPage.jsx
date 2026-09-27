import React, { useState, useEffect } from 'react';
import { Receipt, FileText, CheckCircle2, Clock, AlertTriangle, Coins, Plus, Printer } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const InvoiceDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    total_invoices: 0,
    unpaid_invoices: 0,
    paid_invoices: 0,
    credit_notes_count: 0,
    total_billed: 0,
    total_collected: 0,
    total_outstanding: 0,
    total_tax: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getDashboardMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoicing & Billing Cockpit"
        subtitle="GST Tax Invoices, E-Invoicing, E-Way Bill generation, and accounts receivable tracking."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/invoices/notes"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Credit & Debit Notes
            </Link>
            <Link
              to="/invoices/list"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Receipt className="w-4 h-4" />
              View Invoices
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed (Revenue)"
          value={`₹${Number(metrics.total_billed || 0).toLocaleString('en-IN')}`}
          icon={Coins}
          description="Total invoiced value"
        />
        <StatCard
          title="Collected Amount"
          value={`₹${Number(metrics.total_collected || 0).toLocaleString('en-IN')}`}
          icon={CheckCircle2}
          description="Cash / Bank receipts logged"
        />
        <StatCard
          title="Outstanding Receivables"
          value={`₹${Number(metrics.total_outstanding || 0).toLocaleString('en-IN')}`}
          icon={Clock}
          trend={metrics.total_outstanding > 0 ? { direction: 'down', label: 'Due' } : undefined}
          description={`${metrics.unpaid_invoices} pending payment`}
        />
        <StatCard
          title="GST Tax Collected"
          value={`₹${Number(metrics.total_tax || 0).toLocaleString('en-IN')}`}
          icon={Receipt}
          description="CGST + SGST + IGST liability"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/invoices/list?type=tax_invoice')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">GST Tax Invoices</h3>
          <p className="text-xs text-slate-600">
            Compliant B2B & B2C tax invoices with split CGST/SGST/IGST and HSN summaries.
          </p>
        </div>

        <div
          onClick={() => navigate('/invoices/ageing')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Invoice Ageing Analysis</h3>
          <p className="text-xs text-slate-600">
            Inspect receivables split across 0-30, 31-60, 61-90, and 90+ days credit overdue windows.
          </p>
        </div>

        <div
          onClick={() => navigate('/invoices/notes')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Credit & Debit Notes</h3>
          <p className="text-xs text-slate-600">
            Manage formal invoice revisions, sales returns, and volume discount adjustments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDashboardPage;
