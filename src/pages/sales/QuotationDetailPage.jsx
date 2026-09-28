import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  RotateCw,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesService } from '../../services/sales.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Approval Modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/sales/quotations/new', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/sales/quotations', { replace: true });
      return;
    }
    loadQuotation();
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      const res = await salesService.getQuotationById(id);
      setQuotation(res.data);
    } catch (err) {
      console.error('Failed to load quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateRevision = async () => {
    if (!window.confirm('Create a revised version of this quotation?')) return;
    try {
      const res = await salesService.createRevision(id, {});
      alert(`Revision #${res.data?.quotation_number} generated successfully!`);
      navigate(`/sales/quotations/${res.data?._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create revision');
    }
  };

  const handleConvertToOrder = async () => {
    if (!window.confirm('Convert this quotation to an active Sales Order?')) return;
    try {
      await salesService.convertToOrder(id);
      alert('Quotation converted to Sales Order!');
      loadQuotation();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert');
    }
  };

  const handleDiscountApproval = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await salesService.approveDiscount(id, {
        action: approvalAction,
        remarks: approvalRemarks,
      });
      setIsApprovalModalOpen(false);
      loadQuotation();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading quotation details...</div>;
  }

  if (!quotation) {
    return <div className="p-12 text-center text-slate-500">Quotation not found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="print:hidden">
        <PageHeader
          title={`Quotation #${quotation.quotation_number}`}
          subtitle={`Base ID: ${quotation.base_number} • Revision: ${quotation.revision_number}`}
          breadcrumbs={[
            { label: 'Commercial' },
            { label: 'Quotations', path: '/sales/quotations' },
            { label: quotation.quotation_number },
          ]}
          actions={
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Export PDF
              </button>

              {quotation.discount_approval_status === 'pending' && (
                <button
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Review Discount
                </button>
              )}

              <button
                onClick={handleCreateRevision}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                New Revision
              </button>

              {quotation.status !== 'converted_to_order' && (
                <button
                  onClick={handleConvertToOrder}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Convert to Order
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Formal Printable Document Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <span className="text-xl font-black text-indigo-600 tracking-wider font-mono">DANZA ERP</span>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Architectural Hardware & Engineering Systems</p>
            <p className="text-xs text-slate-400">GSTIN: 27AABCD1234E1Z5 • Email: sales@danzaerp.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">SALES QUOTATION</h2>
            <p className="text-sm font-bold font-mono text-indigo-600 mt-1">#{quotation.quotation_number}</p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <StatusBadge status={quotation.status} />
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold">{quotation.revision_number}</span>
            </div>
          </div>
        </div>

        {/* Customer & Quote Meta */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Quotation Prepared For:</p>
            <h4 className="font-bold text-sm text-slate-900">{quotation.customer_id?.company_name}</h4>
            <p className="text-slate-600 mt-0.5">Code: {quotation.customer_id?.customer_code}</p>
            {quotation.customer_id?.gstin && (
              <p className="font-mono text-slate-600 mt-0.5">GSTIN: {quotation.customer_id.gstin}</p>
            )}
            <p className="text-slate-600 mt-0.5">{quotation.customer_id?.email} • {quotation.customer_id?.phone}</p>
          </div>

          <div className="space-y-1 text-right">
            <p><span className="text-slate-400">Date:</span> <span className="font-semibold text-slate-800">{new Date(quotation.quotation_date).toLocaleDateString()}</span></p>
            <p><span className="text-slate-400">Validity:</span> <span className="font-semibold text-slate-800">{new Date(quotation.valid_until).toLocaleDateString()}</span></p>
            <p><span className="text-slate-400">Branch:</span> <span className="font-semibold text-slate-800">{quotation.branch_id?.branch_name || 'Central'}</span></p>
            <p><span className="text-slate-400">Sales Representative:</span> <span className="font-semibold text-slate-800">{quotation.sales_person_id?.full_name}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="min-w-full text-xs text-left divide-y divide-slate-200">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Rate (₹)</th>
                <th className="py-3 px-3 text-right">Disc %</th>
                <th className="py-3 px-3 text-right">Taxable (₹)</th>
                <th className="py-3 px-3 text-right">GST</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {quotation.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{item.product_id?.product_name || item.description}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.product_id?.sku}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">{item.quantity} {item.uom_id?.uom_code || 'PCS'}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{item.rate?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono">{item.discount_percent}%</td>
                  <td className="py-3 px-3 text-right font-mono">₹{item.taxable_amount?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono">{item.gst_rate}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{item.total_amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <div className="w-72 text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Gross Subtotal:</span>
              <span className="font-mono">₹{quotation.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Total Discounts:</span>
              <span className="font-mono">-₹{quotation.discount_total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
              <span>Taxable Value:</span>
              <span className="font-mono">₹{quotation.taxable_total?.toLocaleString()}</span>
            </div>
            {!quotation.is_interstate ? (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>CGST:</span>
                  <span className="font-mono">₹{quotation.cgst_total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST:</span>
                  <span className="font-mono">₹{quotation.sgst_total?.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-500">
                <span>IGST:</span>
                <span className="font-mono">₹{quotation.igst_total?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Round Off:</span>
              <span className="font-mono">₹{quotation.round_off}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t-2 border-slate-300">
              <span>Net Grand Total:</span>
              <span className="font-mono text-indigo-600">₹{quotation.grand_total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {quotation.terms_and_conditions && (
          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <h5 className="font-bold text-slate-700 uppercase tracking-wider mb-2">Terms & Conditions</h5>
            <pre className="font-sans whitespace-pre-line leading-relaxed">{quotation.terms_and_conditions}</pre>
          </div>
        )}
      </div>

      {/* Review Discount Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Review Quotation Special Discount"
      >
        <form onSubmit={handleDiscountApproval} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Decision *</label>
            <select
              value={approvalAction}
              onChange={(e) => setApprovalAction(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="approve">Approve Special Pricing</option>
              <option value="reject">Reject & Demand Revision</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Manager Remarks / Justification</label>
            <textarea
              rows={3}
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApprovalModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Processing...' : 'Submit Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default QuotationDetailPage;
