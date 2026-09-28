import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Receipt, ArrowLeft, Printer, ShieldCheck, Truck, DollarSign, CheckCircle2, FileText } from 'lucide-react';
import { invoiceService } from '../../services/invoice.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/invoices/list', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/invoices/list', { replace: true });
      return;
    }
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoiceById(id);
      setInvoice(res.data);
      setPaymentAmount(res.data?.balance_amount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEInvoice = async () => {
    try {
      setActionLoading(true);
      await invoiceService.generateEInvoice(id);
      loadInvoice();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating E-Invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateEWayBill = async () => {
    try {
      setActionLoading(true);
      await invoiceService.generateEWayBill(id, {});
      loadInvoice();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating E-Way Bill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await invoiceService.recordPayment(id, { amount: paymentAmount });
      setShowPaymentModal(false);
      loadInvoice();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`Tax Invoice: ${invoice.invoice_number}`}
        subtitle={`Issued on ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.invoice_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/invoices/list')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <Link
              to={`/invoices/${id}/print`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Print / PDF
            </Link>

            {invoice.e_invoice?.status !== 'generated' && (
              <button
                disabled={actionLoading}
                onClick={handleGenerateEInvoice}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              >
                <ShieldCheck className="w-4 h-4" />
                Generate E-Invoice
              </button>
            )}

            {invoice.e_way_bill?.status !== 'generated' && (
              <button
                disabled={actionLoading}
                onClick={handleGenerateEWayBill}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              >
                <Truck className="w-4 h-4" />
                Generate E-Way Bill
              </button>
            )}

            {invoice.balance_amount > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                Record Payment
              </button>
            )}
          </div>
        }
      />

      {/* Compliance / E-Invoice Banner */}
      {invoice.e_invoice?.status === 'generated' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              E-Invoice Compliant (IRN Generated)
            </span>
            <p className="font-mono text-emerald-800 text-[11px] mt-0.5 break-all">
              IRN: {invoice.e_invoice.irn}
            </p>
          </div>
          <span className="font-mono text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
            Ack #: {invoice.e_invoice.ack_no}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Payment Status</p>
          <p className="text-base font-bold text-slate-900 capitalize mt-1">
            {invoice.payment_status?.replace('_', ' ')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Customer</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {invoice.customer_id?.display_name || invoice.customer_id?.company_name}
          </p>
          <p className="text-xs text-slate-500 font-mono">{invoice.customer_id?.gstin || 'Unregistered'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Tax Type</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {invoice.is_interstate ? 'Interstate (IGST)' : 'Intrastate (CGST + SGST)'}
          </p>
          <p className="text-xs text-slate-500">Place of Supply: {invoice.place_of_supply_state}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Balance Due</p>
          <p className="text-lg font-bold text-rose-600 mt-1">
            ₹{Number(invoice.balance_amount || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Item Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Invoice Line Items</h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="py-2.5 px-4">Item & HSN</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Rate</th>
              <th className="py-2.5 px-4 text-right">Taxable</th>
              <th className="py-2.5 px-3 text-center">GST %</th>
              <th className="py-2.5 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-mono">
            {invoice.items?.map((it, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-sans">
                  <p className="font-semibold text-slate-900">{it.item_name}</p>
                  <p className="text-xs font-mono text-slate-500">HSN: {it.hsn_code || '8481'}</p>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">{it.quantity} {it.uom}</td>
                <td className="py-3 px-3 text-right">₹{it.rate}</td>
                <td className="py-3 px-4 text-right">₹{Number(it.taxable_amount || 0).toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-center font-bold text-indigo-700">{it.gst_rate}%</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">₹{Number(it.total_amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-200 flex justify-end">
          <div className="w-80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span className="font-mono">₹{Number(invoice.taxable_total || 0).toLocaleString('en-IN')}</span>
            </div>
            {invoice.cgst_total > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Central GST (CGST):</span>
                <span className="font-mono">₹{Number(invoice.cgst_total || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            {invoice.sgst_total > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>State GST (SGST):</span>
                <span className="font-mono">₹{Number(invoice.sgst_total || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            {invoice.igst_total > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono">₹{Number(invoice.igst_total || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Invoice Total:</span>
              <span className="font-mono text-indigo-600">₹{Number(invoice.grand_total || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700">
              <span>Amount Paid:</span>
              <span className="font-mono">₹{Number(invoice.paid_amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Invoice Payment" size="md">
          <form onSubmit={handleRecordPayment} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                min="1"
                max={invoice.balance_amount}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {actionLoading ? 'Recording...' : 'Confirm Receipt'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceDetailPage;
