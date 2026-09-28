import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  Bookmark,
  FileText,
  Clock,
  Building2,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react';
import { salesOrderService } from '../../../services/salesOrder.service';
import { PageHeader } from '../../../components/shell/PageHeader';
import { StatusBadge } from '../../../components/shell/StatusBadge';
import { Modal } from '../../../components/shell/Modal';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveQty, setReserveQty] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id === 'create' || id === 'new') {
      navigate('/sales/orders/create', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/sales/orders', { replace: true });
      return;
    }
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await salesOrderService.getOrderById(id);
      setOrder(res.data);
      // Initialize reserve inputs
      const initReserve = {};
      res.data?.items?.forEach((it) => {
        const canReserve = Math.max(0, it.ordered_qty - (it.reserved_qty || 0));
        initReserve[it._id] = canReserve;
      });
      setReserveQty(initReserve);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approve) => {
    try {
      setActionLoading(true);
      await salesOrderService.approveOrder(id, {
        approve,
        remarks: approve ? 'Order approved by manager' : 'Order rejected',
      });
      loadOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReserveStock = async () => {
    try {
      setActionLoading(true);
      const reservations = Object.entries(reserveQty)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([itemId, qty]) => ({
          item_id: itemId,
          qty: Number(qty),
          warehouse_id: order.warehouse_id?._id || order.warehouse_id,
        }));

      if (reservations.length === 0) {
        alert('Please specify quantity to reserve');
        return;
      }

      await salesOrderService.reserveStock(id, { reservations });
      setShowReserveModal(false);
      loadOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Error reserving stock');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title={`Sales Order: ${order.order_number}`}
        subtitle={`Created on ${new Date(order.order_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/sales/orders' },
          { label: order.order_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/orders')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {order.approval?.status === 'pending' && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => handleApprove(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleApprove(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Order
                </button>
              </>
            )}

            <button
              onClick={() => setShowReserveModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            >
              <Bookmark className="w-4 h-4" />
              Allocate / Reserve Stock
            </button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Order Status</p>
          <div className="mt-1">
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Customer</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {order.customer_id?.display_name || order.customer_id?.company_name}
          </p>
          <p className="text-xs text-slate-500 font-mono">{order.customer_id?.gstin || ''}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Warehouse & Branch</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {order.warehouse_id?.warehouse_name || 'Central Warehouse'}
          </p>
          <p className="text-xs text-slate-500">{order.branch_id?.branch_name}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Grand Total</p>
          <p className="text-lg font-bold text-indigo-600 mt-1">
            ₹{Number(order.grand_total || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Item Quantities Lifecycle Progress Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Order Items & Quantity Lifecycle Tracking
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Multi-stage fulfillment tracker
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-3 text-center">Ordered</th>
                <th className="py-3 px-3 text-center">Reserved</th>
                <th className="py-3 px-3 text-center">Ready</th>
                <th className="py-3 px-3 text-center">Dispatched</th>
                <th className="py-3 px-3 text-center">Invoiced</th>
                <th className="py-3 px-3 text-center">Pending</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {order.items?.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-sans">
                    <p className="font-semibold text-slate-900 text-sm">
                      {it.product_id?.product_name || it.description}
                    </p>
                    <p className="text-xs font-mono text-slate-500">
                      {it.product_id?.product_code || ''}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {it.ordered_qty}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                      {it.reserved_qty || 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
                      {it.ready_qty || 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      {it.dispatched_qty || 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                      {it.invoiced_qty || 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-rose-600">
                    {it.pending_qty !== undefined ? it.pending_qty : Math.max(0, it.ordered_qty - (it.dispatched_qty || 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    ₹{Number(it.taxable_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{Number(it.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail & Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Order Audit Trail & Status History
        </h2>
        <div className="space-y-3">
          {order.audit_trail?.map((entry, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-slate-800">{entry.action}</span>
                <span className="text-slate-500 ml-2">
                  {new Date(entry.performed_at).toLocaleString('en-IN')}
                </span>
                <p className="text-slate-600 mt-0.5">{entry.remarks || 'Status update logged'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Reservation Modal */}
      {showReserveModal && (
        <Modal
          isOpen={showReserveModal}
          onClose={() => setShowReserveModal(false)}
          title="Reserve Warehouse Stock for Order"
          size="md"
        >
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 text-xs">
              Allocating inventory stock locks units in warehouse to prevent overcommitting to other orders.
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {order.items?.map((it) => (
                <div key={it._id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {it.product_id?.product_name || it.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      Ordered: {it.ordered_qty} | Already reserved: {it.reserved_qty || 0}
                    </p>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      max={it.ordered_qty - (it.reserved_qty || 0)}
                      value={reserveQty[it._id] || 0}
                      onChange={(e) =>
                        setReserveQty({ ...reserveQty, [it._id]: e.target.value })
                      }
                      className="w-full text-sm font-mono border border-slate-300 rounded p-1.5 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReserveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReserveStock}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {actionLoading ? 'Allocating...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderDetailPage;
