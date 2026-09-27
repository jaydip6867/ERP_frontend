import React, { useState, useEffect } from 'react';
import { ShoppingCart, Users, FileSpreadsheet, PackageCheck, Receipt, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const PurchaseDashboardPage = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ suppliers: 0, prs: 0, pos: 0, grns: 0, invoices: 0 });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [supRes, prRes, poRes, grnRes, invRes] = await Promise.all([
        purchaseService.getSuppliers({ limit: 1 }),
        purchaseService.getRequisitions({ limit: 1 }),
        purchaseService.getOrders({ limit: 1 }),
        purchaseService.getGrns({ limit: 1 }),
        purchaseService.getInvoices({ limit: 1 }),
      ]);
      setCounts({
        suppliers: supRes.meta?.total || 0,
        prs: prRes.meta?.total || 0,
        pos: poRes.meta?.total || 0,
        grns: grnRes.meta?.total || 0,
        invoices: invRes.meta?.total || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement & Purchase Management"
        subtitle="Manage supplier relations, requisitions, purchase orders, partial GRNs, and vendor bills."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase' },
        ]}
        actions={
          <Link
            to="/purchase/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Purchase Orders
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Suppliers" value={counts.suppliers} icon={Users} description="Approved vendors" />
        <StatCard title="Requisitions (PR)" value={counts.prs} icon={FileSpreadsheet} description="Demand requests" />
        <StatCard title="Purchase Orders" value={counts.pos} icon={ShoppingCart} description="Commercial commitments" />
        <StatCard title="Goods Receipts (GRN)" value={counts.grns} icon={PackageCheck} description="Inward material challans" />
      </div>

      {/* Procurement Process Stages */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Complete Procurement Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div
            onClick={() => navigate('/purchase/requisitions')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
          >
            <span className="text-xs font-bold text-indigo-600 uppercase">Step 1</span>
            <p className="font-bold text-slate-900 mt-1">Requisition (PR)</p>
            <p className="text-xs text-slate-500 mt-1">Shortage / reorder demand</p>
          </div>

          <div
            onClick={() => navigate('/purchase/orders')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
          >
            <span className="text-xs font-bold text-indigo-600 uppercase">Step 2</span>
            <p className="font-bold text-slate-900 mt-1">Purchase Order</p>
            <p className="text-xs text-slate-500 mt-1">PO sent to vendor</p>
          </div>

          <div
            onClick={() => navigate('/purchase/grn')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
          >
            <span className="text-xs font-bold text-indigo-600 uppercase">Step 3</span>
            <p className="font-bold text-slate-900 mt-1">GRN Receiving</p>
            <p className="text-xs text-slate-500 mt-1">Partial or full delivery</p>
          </div>

          <div
            onClick={() => navigate('/qc/incoming')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
          >
            <span className="text-xs font-bold text-indigo-600 uppercase">Step 4</span>
            <p className="font-bold text-slate-900 mt-1">Incoming QC</p>
            <p className="text-xs text-slate-500 mt-1">Inspection & lot approval</p>
          </div>

          <div
            onClick={() => navigate('/purchase/invoices')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors"
          >
            <span className="text-xs font-bold text-indigo-600 uppercase">Step 5</span>
            <p className="font-bold text-slate-900 mt-1">Bill & Stock Post</p>
            <p className="text-xs text-slate-500 mt-1">ITC booking & ledger entry</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDashboardPage;
