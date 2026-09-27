import React, { useState, useEffect } from 'react';
import { Layers, Plus, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const SupplyChainPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    plan_name: '',
    month_year: '2026-10',
    projected_demand_qty: 15000,
    procurement_budget: 2500000,
    lead_time_days_average: 14,
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getSupplyChain();
      setPlans(res.data?.plans || []);
    } catch (err) {
      toast.error('Failed to load supply chain plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createSupplyChain(formData);
      toast.success('Supply chain master plan logged');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Supply Chain & Production Planning (S&OP)"
          subtitle="Sales & operations planning, projected material demand, lead-time safety buffers, and procurement ceilings."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Supply Chain' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create S&OP Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading supply chain schedules...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No supply chain plans created yet.
          </div>
        ) : (
          plans.map((p) => (
            <div key={p._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Cycle: {p.month_year}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 text-emerald-700">
                    {p.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{p.plan_name}</h3>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600 border-t border-slate-100">
                  <div>Projected Demand: <b>{(p.projected_demand_qty || 0).toLocaleString()} units</b></div>
                  <div>Avg Lead Time: <b>{p.lead_time_days_average || 14} days</b></div>
                  <div className="col-span-2">
                    Procurement Cap: <b className="text-slate-900">₹{(p.procurement_budget || 0).toLocaleString('en-IN')}</b>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create S&OP Master Plan</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Plan Title *</label>
                <input
                  required
                  type="text"
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Q4 Festive Peak Run"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Cycle (YYYY-MM)</label>
                  <input
                    type="text"
                    value={formData.month_year}
                    onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Projected Units</label>
                  <input
                    type="number"
                    value={formData.projected_demand_qty}
                    onChange={(e) => setFormData({ ...formData, projected_demand_qty: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Procurement Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.procurement_budget}
                    onChange={(e) => setFormData({ ...formData, procurement_budget: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Avg Lead Time (Days)</label>
                  <input
                    type="number"
                    value={formData.lead_time_days_average}
                    onChange={(e) => setFormData({ ...formData, lead_time_days_average: parseInt(e.target.value) || 14 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                >
                  Save S&OP Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChainPage;
