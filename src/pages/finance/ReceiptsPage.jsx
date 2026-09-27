import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, Plus, CheckCircle, Search, Calendar, Eye } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const res = await financeService.getReceipts();
      setReceipts(res.data || []);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Receipts"
        subtitle="Inward customer settlements, bank payment proofs, and automated invoice clearance."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Receipts' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Allocated Invoices</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading receipts...</td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No receipts found</td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr
                    key={r._id}
                    onClick={() => setSelectedReceipt(r)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{r.receipt_number}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {new Date(r.receipt_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {r.customer_id?.company_name || r.customer_id?.display_name || 'Direct Customer'}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">{r.payment_mode}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {(r.allocations || []).map((a) => a.invoice_id?.invoice_number || 'INV').join(', ') || 'Unallocated'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(r.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {r.status || 'Cleared'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedReceipt(r)}
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

      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Receipt Details: ${selectedReceipt.receipt_number}`}
          size="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 block">Customer</span>
                <span className="font-semibold text-slate-900">
                  {selectedReceipt.customer_id?.company_name || selectedReceipt.customer_id?.display_name || 'Direct Customer'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Receipt Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedReceipt.receipt_date).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Payment Method</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.payment_mode}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Reference #</span>
                <span className="font-mono text-slate-700">{selectedReceipt.reference_number || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Settled Amount:</span>
              <span className="font-mono font-bold text-emerald-700 text-lg">₹{Number(selectedReceipt.amount || 0).toLocaleString('en-IN')}</span>
            </div>

            {selectedReceipt.allocations && selectedReceipt.allocations.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Invoice Allocations</div>
                <div className="divide-y divide-slate-100">
                  {selectedReceipt.allocations.map((alloc, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-semibold text-indigo-700">{alloc.invoice_id?.invoice_number || 'Tax Invoice'}</span>
                        <p className="text-slate-400 text-[11px]">{new Date(alloc.invoice_id?.invoice_date || Date.now()).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{Number(alloc.allocated_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReceipt.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700 block mb-1">Notes:</span>
                {selectedReceipt.notes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
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

export default ReceiptsPage;
