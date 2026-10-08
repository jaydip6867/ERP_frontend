import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, PackageCheck, Building2, Calendar, FileText } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { ConvertToGrnModal } from '../../components/purchase/ConvertToGrnModal';

export const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGrnModal, setShowGrnModal] = useState(false);

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/purchase/orders', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/purchase/orders', { replace: true });
      return;
    }
    loadPo();
  }, [id]);

  const loadPo = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getOrderById(id);
      setPo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !po) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`Purchase Order: ${po.po_number}`}
        subtitle={`Issued on ${new Date(po.po_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Orders', href: '/purchase/orders' },
          { label: po.po_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/purchase/orders')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {po.status !== 'cancelled' && (
              <button
                onClick={() => setShowGrnModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-brand hover:opacity-90 text-white shadow-sm transition cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                Convert to GRN
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Status</p>
          <div className="mt-1"><StatusBadge status={po.status} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Supplier</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{po.supplier_id?.supplier_name}</p>
          <p className="text-xs text-slate-500 font-mono">{po.supplier_id?.gstin || ''}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Delivery Warehouse</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{po.warehouse_id?.warehouse_name}</p>
          <p className="text-xs text-slate-500">{po.payment_terms}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">PO Grand Total</p>
          <p className="text-lg font-bold text-indigo-600 mt-1">₹{Number(po.grand_total || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">PO Line Items & Receipt Progress</h2>
          <span className="text-xs text-slate-500">Supports Partial GRN Inward Receipts</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="py-2.5 px-4">Item</th>
              <th className="py-2.5 px-3 text-center">Ordered</th>
              <th className="py-2.5 px-3 text-center">Received</th>
              <th className="py-2.5 px-3 text-center">Pending</th>
              <th className="py-2.5 px-3 text-right">Unit Rate</th>
              <th className="py-2.5 px-4 text-right">Taxable</th>
              <th className="py-2.5 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {po.items?.map((it, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-sans">
                  <p className="font-semibold text-slate-900">{it.product_id?.product_name || it.description}</p>
                  <p className="text-xs font-mono text-slate-500">{it.product_id?.product_code}</p>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">{it.ordered_qty}</td>
                <td className="py-3 px-3 text-center text-emerald-700 font-bold">{it.received_qty || 0}</td>
                <td className="py-3 px-3 text-center text-rose-600 font-bold">{it.pending_qty || 0}</td>
                <td className="py-3 px-3 text-right font-mono">₹{it.rate}</td>
                <td className="py-3 px-4 text-right">₹{Number(it.taxable_amount || 0).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">₹{Number(it.total_amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGrnModal && (
        <ConvertToGrnModal
          isOpen={showGrnModal}
          onClose={() => setShowGrnModal(false)}
          purchaseOrder={po}
          onSuccess={() => {
            loadPo();
          }}
        />
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
