import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, TrendingUp, AlertTriangle, Plus, Edit2, PieChart, CheckCircle2, RefreshCw } from 'lucide-react';
import { expenseOwnerService } from '../../services/expenseOwner.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    variance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    code: '',
    monthly_budget: '',
    description: '',
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const res = await expenseOwnerService.getBudgetReport();
      const raw = res?.data?.data || res?.data || {};
      
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.categories)
        ? raw.categories
        : [];

      const totalBudget = raw.total_monthly_budget ?? list.reduce((acc, item) => acc + (item.monthly_budget || item.budget_allocated || 0), 0);
      const totalSpent = raw.total_actual_spent ?? list.reduce((acc, item) => acc + (item.spent_this_month || item.actual_spent || 0), 0);
      const variance = raw.variance ?? (totalBudget - totalSpent);

      setBudgets(list);
      setSummary({ totalBudget, totalSpent, variance });
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      category_name: '',
      code: '',
      monthly_budget: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category_name: budget.category_name || '',
      code: budget.code || '',
      monthly_budget: budget.monthly_budget || budget.budget_allocated || 0,
      description: budget.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        category_name: formData.category_name.trim(),
        code: formData.code.trim().toUpperCase(),
        monthly_budget: Number(formData.monthly_budget) || 0,
        description: formData.description,
      };

      if (editingBudget && (editingBudget.category_id || editingBudget._id)) {
        const id = editingBudget.category_id || editingBudget._id;
        await expenseOwnerService.updateCategory(id, payload);
      } else {
        await expenseOwnerService.createCategory(payload);
      }

      setModalOpen(false);
      await loadBudgets();
    } catch (err) {
      console.error('Failed to save budget:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save budget category');
    } finally {
      setSubmitting(false);
    }
  };

  const overallUtilization = summary.totalBudget > 0
    ? Math.round((summary.totalSpent / summary.totalBudget) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departmental Budgets & Variance Analysis"
        subtitle="Track allocated operating budgets against actual expenses to prevent cost overruns."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Expenses', href: '/expenses' },
          { label: 'Budgets' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadBudgets}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Refresh Budgets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Allocate Budget Category
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Budget</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ₹{(summary.totalBudget || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Sum of all category limits</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual Spent (MTD)</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ₹{(summary.totalSpent || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Approved monthly spend</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Remaining Variance</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${summary.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{(summary.variance || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {summary.variance >= 0 ? 'Within allocated threshold' : 'Exceeding budget threshold'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.variance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {summary.variance >= 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="w-full mr-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Utilization</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">{overallUtilization}%</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                overallUtilization > 100 ? 'bg-rose-100 text-rose-700' : overallUtilization > 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {overallUtilization > 100 ? 'Over' : overallUtilization > 80 ? 'Warning' : 'Healthy'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  overallUtilization > 100 ? 'bg-rose-500' : overallUtilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, overallUtilization)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Budget Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Departmental & Category Allocations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly allocation vs live actual expenses</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4 text-right">Monthly Budget (₹)</th>
                <th className="py-3 px-4 text-right">Actual Spent (₹)</th>
                <th className="py-3 px-4 text-right">Remaining Variance (₹)</th>
                <th className="py-3 px-4 text-center">Utilization</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading budget records...</span>
                    </div>
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <Target className="w-12 h-12 text-slate-300 mb-2" />
                      <p className="text-base font-semibold text-slate-800">No Budget Categories Found</p>
                      <p className="text-xs text-slate-500 text-center mt-1">
                        Allocate monthly budgets for operational expense categories to monitor costs and prevent overruns.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Allocate First Budget
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                budgets.map((b, idx) => {
                  const budgetVal = b.monthly_budget ?? b.budget_allocated ?? 0;
                  const spentVal = b.spent_this_month ?? b.actual_spent ?? 0;
                  const varianceVal = b.variance ?? (budgetVal - spentVal);
                  const pct = b.utilization_percentage ?? (budgetVal > 0 ? Math.round((spentVal / budgetVal) * 100) : 0);
                  const isOver = pct > 100;
                  const isNear = pct >= 80 && pct <= 100;

                  return (
                    <tr key={b.category_id || b._id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {b.category_name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold border border-slate-200">
                          {b.code || 'EXP'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                        ₹{(budgetVal).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        ₹{(spentVal).toLocaleString('en-IN')}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${varianceVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {varianceVal >= 0 ? '+' : ''}₹{(varianceVal).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            isOver ? 'bg-rose-100 text-rose-800' : isNear ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {pct}% {isOver ? 'Over' : ''}
                          </span>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          Edit Budget
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBudget ? 'Update Budget Allocation' : 'Allocate New Category Budget'}
        subtitle={editingBudget ? `Adjust monthly ceiling for ${editingBudget.category_name}` : 'Define monthly operating allowance for an expense category'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Factory Electricity & Power"
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UTIL_ELEC"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Budget Ceiling (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="100"
              required
              placeholder="e.g. 85000"
              value={formData.monthly_budget}
              onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="3"
              placeholder="Describe what expenses fall under this category allocation..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Allocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
