import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hammer, ArrowLeft, CheckCircle2, Layers, Clock, AlertTriangle, ShieldCheck, Package } from 'lucide-react';
import { productionService } from '../../services/production.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const WorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveData, setReceiveData] = useState({ qty: 10, batch_number: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/production/work-orders', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/production/work-orders', { replace: true });
      return;
    }
    loadWorkOrder();
  }, [id]);

  const loadWorkOrder = async () => {
    try {
      setLoading(true);
      const res = await productionService.getWorkOrderById(id);
      setWo(res.data);
      setReceiveData({ qty: res.data?.planned_qty || 10, batch_number: `BATCH-FG-${res.data?.wo_number?.slice(-4)}` });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveFinishedGoods = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await productionService.receiveFinishedGoods(id, receiveData);
      setShowReceiveModal(false);
      loadWorkOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Error receiving finished goods');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !wo) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`Work Order: ${wo.wo_number}`}
        subtitle={`Scheduled on ${new Date(wo.wo_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production', href: '/production' },
          { label: 'Work Orders', href: '/production/work-orders' },
          { label: wo.wo_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/production/work-orders')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {wo.status !== 'completed' && (
              <button
                onClick={() => setShowReceiveModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <Package className="w-4 h-4" />
                Receive Finished Goods (+Stock)
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Status</p>
          <div className="mt-1"><StatusBadge status={wo.status} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Target Finished Good</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{wo.product_id?.product_name}</p>
          <p className="text-xs text-slate-500 font-mono">{wo.product_id?.product_code}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">BOM Reference</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{wo.bom_id?.bom_name}</p>
          <p className="text-xs text-slate-500">{wo.bom_id?.bom_number} (v{wo.bom_id?.version})</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Production Progress</p>
          <p className="text-lg font-bold text-indigo-600 mt-1 font-mono">
            {wo.produced_qty || 0} / {wo.planned_qty} Units
          </p>
        </div>
      </div>

      {/* BOM Components explosion */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">BOM Required Raw Materials & Parts</h2>
          <span className="text-xs text-slate-500">Exploded for {wo.planned_qty} Target Units</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="py-2.5 px-4">Component</th>
              <th className="py-2.5 px-3 text-center">Unit Req.</th>
              <th className="py-2.5 px-3 text-center">Total Req. for Job</th>
              <th className="py-2.5 px-3 text-center">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-mono">
            {wo.bom_id?.items?.map((it, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-sans">
                  <p className="font-semibold text-slate-900">{it.product_id?.product_name || 'Component'}</p>
                  <p className="text-xs font-mono text-slate-500">{it.product_id?.product_code}</p>
                </td>
                <td className="py-3 px-3 text-center">{it.quantity}</td>
                <td className="py-3 px-3 text-center font-bold text-indigo-700">
                  {it.quantity * wo.planned_qty}
                </td>
                <td className="py-3 px-3 text-center font-bold text-emerald-700">
                  {it.product_id?.current_stock || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReceiveModal && (
        <Modal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          title="Receive Manufactured Finished Goods"
          size="md"
        >
          <form onSubmit={handleReceiveFinishedGoods} className="space-y-4 text-sm">
            <p className="text-xs text-slate-600">
              Posts completed units into warehouse inventory via <strong>StockTransactionService</strong> (PRODUCTION_RECEIPT) and updates work order status.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Produced Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={receiveData.qty}
                onChange={(e) => setReceiveData({ ...receiveData, qty: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Lot Number</label>
              <input
                type="text"
                value={receiveData.batch_number}
                onChange={(e) => setReceiveData({ ...receiveData, batch_number: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm uppercase"
                placeholder="e.g. BATCH-FG-2026-001"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {actionLoading ? 'Posting...' : 'Accept & Add to Stock'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default WorkOrderDetailPage;
