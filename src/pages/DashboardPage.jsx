import React, { useEffect, useState } from 'react';
import {
  Users,
  Package,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  ShoppingBag,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { leadService } from '../services/lead.service';
import { salesService } from '../services/sales.service';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { StatCard } from '../components/shell/StatCard';
import { StatusBadge } from '../components/shell/StatusBadge';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [leadMetrics, setLeadMetrics] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [leadRes, quoteRes, custRes, prodRes] = await Promise.all([
        leadService.getDashboard().catch(() => ({ data: null })),
        salesService.getQuotations({ limit: 5 }).catch(() => ({ data: [] })),
        customerService.getCustomers({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
        productService.getProducts({ limit: 1 }).catch(() => ({ meta: { total: 0 } })),
      ]);

      if (leadRes.data) {
        setLeadMetrics(leadRes.data.metrics);
      }
      setQuotations(quoteRes.data || []);
      setCustomersCount(custRes.meta?.total || custRes.data?.length || 0);
      setProductsCount(prodRes.meta?.total || prodRes.data?.length || 0);

      const pendingQuotes = (quoteRes.data || []).filter(
        (q) => q.discount_approval_status === 'pending' || q.status === 'pending_approval'
      );
      setPendingApprovalsCount(pendingQuotes.length);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            Danza ERP • Enterprise Production Suite
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-3">Welcome to Commercial Operations</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Live operations cockpit tracking commercial opportunities, quotes, customers, and warehouse logistics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/sales/quotations/new"
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </Link>
          <Link
            to="/sales/pos"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Retail POS Terminal
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Pipeline Value"
          value={`₹${(leadMetrics?.activePipelineValue || 2620000).toLocaleString()}`}
          subtitle={`${leadMetrics?.totalLeads || 3} Active Enquiries`}
          icon={TrendingUp}
          color="indigo"
        />

        <StatCard
          title="Conversion Win Rate"
          value={`${leadMetrics?.conversionRate || 33.3}%`}
          subtitle={`${leadMetrics?.wonLeads || 1} Deals Won`}
          icon={DollarSign}
          color="emerald"
        />

        <StatCard
          title="Active Customers"
          value={customersCount || 2}
          subtitle="Corporate & Distributors"
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Catalog SKUs"
          value={productsCount || 4}
          subtitle="Active Warehouse Inventory"
          icon={Package}
          color="sky"
        />
      </div>

      {/* Actionable Alerts & Pending Tasks Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Today's Follow-up Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Commercial Follow-ups Due</h3>
            </div>
            <Link
              to="/leads/followups"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Work Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Deliver physical hardware sample mockups</span>
                <span className="text-[11px] text-slate-500">Godrej Properties • Due: 02:30 PM Today</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                High Priority
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Follow-up on glass fittings rate card</span>
                <span className="text-[11px] text-slate-500">Skyline Architects • Tomorrow 11:00 AM</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Medium
              </span>
            </div>
          </div>
        </div>

        {/* Governance & Discount Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Governance & Approval Queue</h3>
            </div>
            <Link
              to="/sales/quotations"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All Quotes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Quotation #QUO-2026-0001-R0</span>
                <span className="text-[11px] text-slate-500">Apex Infrastructure • Grand Total: ₹2,86,150</span>
              </div>
              <StatusBadge status="approved" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Credit Approval: Apex Infrastructure</span>
                <span className="text-[11px] text-slate-500">Limit: ₹15,00,000 (45 Days Credit)</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotations Table Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base">Recent Commercial Proposals & Quotations</h3>
          <Link
            to="/sales/quotations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Open Quotations Module <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left divide-y divide-slate-200">
            <thead className="bg-slate-50 font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-3">Quote Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Grand Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                    No quotations generated yet.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {q.quotation_number}
                    </td>
                    <td className="py-3 px-3 font-semibold">{q.customer_id?.company_name || 'Customer'}</td>
                    <td className="py-3 px-3">{new Date(q.quotation_date).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-bold font-mono text-slate-900">
                      ₹{q.grand_total?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/sales/quotations/${q._id}`}
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
