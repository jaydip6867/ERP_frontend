import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Plus, Search, Calendar, Eye } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await financeService.getPayments();
      setPayments(Array.isArray(res?.data) ? res.data : (res?.data?.payments || []));
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Payments"
        subtitle="Outward disbursements against supplier invoices, PO bills, and bank wire transactions."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Payments' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Payment No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Allocated Bills</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading payments...</td>
                </tr>
              ) : (Array.isArray(payments) ? payments : []).length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No payments found</td>
                </tr>
              ) : (
                (Array.isArray(payments) ? payments : []).map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{p.payment_number}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {p.supplier_id?.supplier_name || 'Vendor'}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">{p.payment_mode}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {(p.allocations || []).map((a) => a.purchase_invoice_id?.invoice_number || 'BILL').join(', ') || 'General'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {p.status || 'Cleared'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Payment Details: ${selectedPayment.payment_number}`}
          size="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 block">Supplier</span>
                <span className="font-semibold text-slate-900">
                  {selectedPayment.supplier_id?.supplier_name || 'Vendor'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Payment Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedPayment.payment_date).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Payment Mode</span>
                <span className="font-semibold text-slate-800">{selectedPayment.payment_mode}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Reference / UTR #</span>
                <span className="font-mono text-slate-700">{selectedPayment.reference_number || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Disbursed Amount:</span>
              <span className="font-mono font-bold text-indigo-700 text-lg">₹{Number(selectedPayment.amount || 0).toLocaleString('en-IN')}</span>
            </div>

            {selectedPayment.allocations && selectedPayment.allocations.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Settled Purchase Invoices</div>
                <div className="divide-y divide-slate-100">
                  {selectedPayment.allocations.map((alloc, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-semibold text-indigo-700">{alloc.purchase_invoice_id?.invoice_number || 'Vendor Bill'}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{Number(alloc.allocated_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPayment.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700 block mb-1">Notes:</span>
                {selectedPayment.notes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsPage;
