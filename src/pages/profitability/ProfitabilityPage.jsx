import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Percent, Layers, PieChart, RefreshCw } from 'lucide-react';
import { profitabilityService } from '../../services/profitability.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const ProfitabilityPage = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stmtRes, prodRes] = await Promise.all([
        profitabilityService.getStatement(),
        profitabilityService.getProducts(),
      ]);
      setData(stmtRes.data);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Failed to load profitability:', err);
    } finally {
      setLoading(false);
    }
  };

  const deductions = data?.deductions || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comprehensive Profitability Engine"
        subtitle="9-Component Gross & Net Profitability waterfall analyzing real ERP revenue vs all operating cost components."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Profitability' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Recalculate
          </button>
        }
      />

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Net ERP Sales"
          value={`₹${(data?.net_sales || 0).toLocaleString()}`}
          subtitle="Total recognized orders"
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Total Operating Costs"
          value={`₹${(data?.total_costs || 0).toLocaleString()}`}
          subtitle="9-Factor comprehensive deductions"
          icon={Layers}
          variant="danger"
        />
        <StatCard
          title="Net Corporate Profit"
          value={`₹${(data?.net_profit || 0).toLocaleString()}`}
          subtitle="True bottom line profit"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Net Margin %"
          value={`${data?.net_margin_percentage || 0}%`}
          subtitle="Net Profit / Net Sales"
          icon={Percent}
          variant="warning"
        />
      </div>

      {/* 9-Component Waterfall Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Blueprint 9-Component Net Profitability Waterfall
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between py-2.5 bg-indigo-50/70 border border-indigo-100 px-4 rounded-lg font-bold text-sm">
            <span className="text-indigo-900 font-bold">1. Net Sales (Realized Sales Orders)</span>
            <span className="font-mono text-indigo-700 text-base">
              ₹{(data?.net_sales || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">2. Less: Raw Material & Component Costs</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.material_cost || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">3. Less: Production & Machining Costs</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.production_cost || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">4. Less: Outward Freight & Logistics</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.freight_charges || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">5. Less: Sales Commission & Channel Fees</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.sales_commission || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">6. Less: Direct Marketing & Campaign Spends</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.marketing_spend || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">7. Less: Defect, Warranty & Complaint Costs</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.complaint_warranty_cost || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span className="text-slate-700 pl-4">8. Less: Administrative & Facility Overheads</span>
            <span className="font-mono text-rose-600 font-medium">
              - ₹{(deductions.overhead_and_admin || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-3.5 bg-emerald-50 border border-emerald-200 px-4 rounded-lg font-bold text-base">
            <span className="text-emerald-900">9. Net Corporate Profit</span>
            <span className="font-mono text-emerald-700 text-lg">
              = ₹{(data?.net_profit || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Product-level Margins */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Product Line Margins & Unit Economics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-right">Selling Rate (₹)</th>
                <th className="py-3 px-4 text-right">Material Cost (₹)</th>
                <th className="py-3 px-4 text-right">Unit Margin (₹)</th>
                <th className="py-3 px-4 text-center">Gross Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">Loading product margins...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No product margin data available</td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.product_name}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">₹{(p.selling_price || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">₹{(p.cost_price || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ₹{((p.selling_price || 0) - (p.cost_price || 0)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">{p.margin_percentage || 0}%</td>
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

export default ProfitabilityPage;
