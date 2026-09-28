import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, CheckCircle2, ShieldCheck, MapPin, FileCheck, Package } from 'lucide-react';
import { dispatchService } from '../../services/dispatch.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const DispatchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPodModal, setShowPodModal] = useState(false);
  const [podData, setPodData] = useState({ received_by_name: '', received_by_phone: '', pod_remarks: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/dispatch', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/dispatch', { replace: true });
      return;
    }
    loadDispatch();
  }, [id]);

  const loadDispatch = async () => {
    try {
      setLoading(true);
      const res = await dispatchService.getDispatchById(id);
      setDispatch(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async () => {
    try {
      setActionLoading(true);
      await dispatchService.shipDispatch(id);
      loadDispatch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPod = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await dispatchService.recordPod(id, podData);
      setShowPodModal(false);
      loadDispatch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording POD');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !dispatch) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`Dispatch: ${dispatch.dispatch_number}`}
        subtitle={`Scheduled on ${new Date(dispatch.dispatch_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders & Delivery', href: '/dispatch' },
          { label: dispatch.dispatch_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dispatch')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!dispatch.stock_deducted && (
              <button
                disabled={actionLoading}
                onClick={handleShip}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                {actionLoading ? 'Deducting Stock...' : 'Confirm Shipment & Deduct Stock'}
              </button>
            )}

            {dispatch.status !== 'delivered' && (
              <button
                onClick={() => setShowPodModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <FileCheck className="w-4 h-4" />
                Record POD
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Status</p>
          <div className="mt-1"><StatusBadge status={dispatch.status} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Customer</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{dispatch.customer_id?.display_name || dispatch.customer_id?.company_name}</p>
          <p className="text-xs text-slate-500">Order: {dispatch.sales_order_id?.order_number}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Transporter & LR</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{dispatch.transporter_id?.transporter_name || 'Direct Delivery'}</p>
          <p className="text-xs text-slate-500 font-mono">LR: {dispatch.lr_number || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Stock Deduction</p>
          <p className="text-sm font-bold mt-1 text-slate-800">
            {dispatch.stock_deducted ? '✅ Deducted from Warehouse' : '⏳ Awaiting Dispatch Action'}
          </p>
        </div>
      </div>

      {/* Dispatched Line Items */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Shipment Items & Batches</h2>
          <span className="text-xs text-slate-500">{dispatch.items?.length || 0} line items</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="py-2.5 px-4">Item Details</th>
              <th className="py-2.5 px-3 text-center">Dispatch Qty</th>
              <th className="py-2.5 px-3">Batch Number</th>
              <th className="py-2.5 px-4 text-right">Unit Rate</th>
              <th className="py-2.5 px-4 text-right">Taxable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {dispatch.items?.map((it, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{it.product_id?.product_name}</p>
                  <p className="text-xs font-mono text-slate-500">{it.product_id?.product_code}</p>
                </td>
                <td className="py-3 px-3 text-center font-bold font-mono text-slate-900">{it.dispatch_qty}</td>
                <td className="py-3 px-3 font-mono text-indigo-700 font-semibold">{it.batch_number || 'Default Lot'}</td>
                <td className="py-3 px-4 text-right font-mono">₹{it.unit_rate}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                  ₹{Number(it.taxable_amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delivery Tracking Checkpoints */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Delivery Tracking Timeline
        </h2>
        <div className="space-y-4">
          {dispatch.tracking_history?.map((cp, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">{cp.status}</span>
                <span className="text-slate-500 ml-2 font-mono">
                  {new Date(cp.timestamp).toLocaleString('en-IN')}
                </span>
                <p className="text-slate-600 mt-0.5">{cp.location} &bull; {cp.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof of Delivery (POD) Details */}
      {dispatch.proof_of_delivery?.received_by_name && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Proof of Delivery (POD)
          </h3>
          <p className="text-xs text-emerald-800">
            Received by: <strong>{dispatch.proof_of_delivery.received_by_name}</strong> (Ph: {dispatch.proof_of_delivery.received_by_phone}) on {new Date(dispatch.proof_of_delivery.received_date).toLocaleDateString('en-IN')}.
          </p>
          <p className="text-xs text-emerald-700 mt-1">Remarks: {dispatch.proof_of_delivery.pod_remarks || 'Delivered in full & good order.'}</p>
        </div>
      )}

      {showPodModal && (
        <Modal isOpen={showPodModal} onClose={() => setShowPodModal(false)} title="Record Proof of Delivery (POD)" size="md">
          <form onSubmit={handleRecordPod} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receiver Name *</label>
              <input
                type="text"
                required
                placeholder="Name of customer storekeeper / manager"
                value={podData.received_by_name}
                onChange={(e) => setPodData({ ...podData, received_by_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receiver Phone</label>
              <input
                type="text"
                placeholder="e.g. +91 98250 11223"
                value={podData.received_by_phone}
                onChange={(e) => setPodData({ ...podData, received_by_phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Acknowledgement</label>
              <textarea
                rows="2"
                placeholder="e.g. Received 15 units intact with security seal verified"
                value={podData.pod_remarks}
                onChange={(e) => setPodData({ ...podData, pod_remarks: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowPodModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Confirm Delivery (POD)
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DispatchDetailPage;
