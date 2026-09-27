import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PackageCheck, ArrowLeft, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';

export const GrnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/purchase/grn', { replace: true });
      return;
    }
    loadGrn();
  }, [id]);

  const loadGrn = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getGrnById(id);
      setGrn(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostToStock = async () => {
    try {
      setActionLoading(true);
      await purchaseService.postGrnToStock(id);
      loadGrn();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting GRN to inventory');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !grn) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`GRN: ${grn.grn_number}`}
        subtitle={`Received on ${new Date(grn.grn_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'GRN', href: '/purchase/grn' },
          { label: grn.grn_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/purchase/grn')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {!grn.stock_posted && (
              <button
                disabled={actionLoading}
                onClick={handlePostToStock}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading ? 'Posting...' : 'Accept & Post to Inventory'}
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">GRN Status</p>
          <div className="mt-1"><StatusBadge status={grn.status} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Supplier</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{grn.supplier_id?.supplier_name}</p>
          <p className="text-xs text-slate-500">PO: {grn.po_id?.po_number || 'Direct'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Challan & Vehicle</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{grn.vendor_challan_no || 'N/A'}</p>
          <p className="text-xs text-slate-500 font-mono">{grn.vehicle_number || ''}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Stock Integration</p>
          <p className="text-sm font-bold mt-1 text-slate-800">
            {grn.stock_posted ? '✅ Atomic Ledger Posted' : '⏳ Awaiting Stock Inward'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Received Line Items & Lots</h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="py-2.5 px-4">Item</th>
              <th className="py-2.5 px-3 text-center">Received Qty</th>
              <th className="py-2.5 px-3 text-center">Accepted Qty</th>
              <th className="py-2.5 px-3">Batch Number</th>
              <th className="py-2.5 px-3">QC Status</th>
              <th className="py-2.5 px-4 text-right">Unit Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {grn.items?.map((it, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{it.product_id?.product_name}</p>
                  <p className="text-xs font-mono text-slate-500">{it.product_id?.product_code}</p>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">{it.received_qty}</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-700">{it.accepted_qty || it.received_qty}</td>
                <td className="py-3 px-3 font-mono text-indigo-700 font-medium">{it.batch_number || 'Auto-lot'}</td>
                <td className="py-3 px-3 capitalize">{it.qc_status}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold">₹{it.unit_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GrnDetailPage;
