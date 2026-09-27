import React, { useState, useEffect } from 'react';
import { Calculator, Plus, DollarSign, TrendingDown, Layers, Search } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CostingPage = () => {
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    allocated_budget: 1000000,
    actual_spent: 0,
  });

  useEffect(() => {
    loadCostCenters();
  }, []);

  const loadCostCenters = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getCostCenters();
      setCostCenters(res.data?.costCenters || []);
    } catch (err) {
      toast.error('Failed to load cost centers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createCostCenter(formData);
      toast.success('Cost center created successfully');
      setShowModal(false);
      loadCostCenters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create cost center');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Product Costing & Activity-Based Cost Centers"
          subtitle="Direct yarn costs, knitting/weaving charges, processing overheads, CM (cut-and-make) rates, and profit margins."
          breadcrumbs={[{ label: 'Finance' }, { label: 'Product Costing' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Cost Center
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Cost Center Code</th>
                <th className="px-5 py-3">Department / Activity</th>
                <th className="px-5 py-3">Allocated Budget</th>
                <th className="px-5 py-3">Actual Absorbed Spent</th>
                <th className="px-5 py-3">Variance</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading cost centers...</td>
                </tr>
              ) : costCenters.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No cost centers established yet.</td>
                </tr>
              ) : (
                costCenters.map((cc) => {
                  const variance = (cc.allocated_budget || 0) - (cc.actual_spent || 0);
                  return (
                    <tr key={cc._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{cc.code}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{cc.name}</td>
                      <td className="px-5 py-3.5 font-mono">₹{(cc.allocated_budget || 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                        ₹{(cc.actual_spent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className={`px-5 py-3.5 font-mono font-semibold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {variance >= 0 ? '+' : ''}₹{variance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                          {cc.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create Cost Center</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Code *</label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="CC-DYEING-01"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Cost Center Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="Dyeing & Bleaching Lab"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Allocated Budget (₹) *</label>
                <input
                  required
                  type="number"
                  value={formData.allocated_budget}
                  onChange={(e) => setFormData({ ...formData, allocated_budget: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
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
                  Save Cost Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostingPage;
