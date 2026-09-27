import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, CheckCircle2, Clock, Truck, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { salesOrderService } from '../../../services/salesOrder.service';
import { PageHeader } from '../../../components/shell/PageHeader';
import { StatCard } from '../../../components/shell/StatCard';

export const OrderProcessingPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    draft: 0,
    pending_approval: 0,
    approved: 0,
    processing: 0,
    dispatched: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await salesOrderService.getProcessingMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load processing metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { title: 'Draft Orders', count: metrics.draft, color: 'border-slate-300 bg-slate-50', icon: Layers, status: 'draft' },
    { title: 'Pending Approval', count: metrics.pending_approval, color: 'border-amber-300 bg-amber-50', icon: Clock, status: 'pending_approval' },
    { title: 'Approved / Ready to Allocate', count: metrics.approved, color: 'border-blue-300 bg-blue-50', icon: CheckCircle2, status: 'approved' },
    { title: 'In Processing / Reserved', count: metrics.processing, color: 'border-indigo-300 bg-indigo-50', icon: ShoppingBag, status: 'processing' },
    { title: 'Dispatched & Delivered', count: metrics.dispatched, color: 'border-emerald-300 bg-emerald-50', icon: Truck, status: 'dispatched' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Processing Pipeline"
        subtitle="Visual end-to-end status of sales orders from drafting to final delivery."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/sales/orders' },
          { label: 'Processing Pipeline' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border ${st.color} shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => navigate(`/sales/orders?status=${st.status}`)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{st.title}</span>
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{st.count}</span>
                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2">Order Reservation & Fulfillment Flow</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          1. <strong>Quotation Approved</strong> &rarr; Converted to Sales Order.<br />
          2. <strong>Inventory Check</strong> &rarr; Available stock is atomically reserved via StockTransactionService.<br />
          3. <strong>Shortage Handling</strong> &rarr; Deficits automatically link to Purchase Requisition (Module 08) or Work Order (Module 09).<br />
          4. <strong>Dispatch Order</strong> &rarr; Stock is reduced, E-Way Bill and Tracking generated (Module 10).<br />
          5. <strong>GST Invoice</strong> &rarr; Immutable Tax Invoice booked with CGST/SGST/IGST breakdown (Module 12 & 13).
        </p>
      </div>
    </div>
  );
};

export default OrderProcessingPage;
