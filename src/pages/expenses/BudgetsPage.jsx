import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { expenseOwnerService } from '../../services/expenseOwner.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const res = await expenseOwnerService.getBudgetReport();
      setBudgets(res.data || []);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

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
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4">Fiscal Period</th>
                <th className="py-3 px-4 text-right">Budget Allocated (₹)</th>
                <th className="py-3 px-4 text-right">Actual Spent (₹)</th>
                <th className="py-3 px-4 text-right">Remaining Variance (₹)</th>
                <th className="py-3 px-4 text-center">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Loading budget records...</td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No active budget allocations found</td>
                </tr>
              ) : (
                budgets.map((b, idx) => {
                  const pct = b.budget_allocated > 0 ? Math.round((b.actual_spent / b.budget_allocated) * 100) : 0;
                  const isOver = pct > 100;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{b.category_name}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{b.period || 'Current Quarter'}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        ₹{(b.budget_allocated || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                        ₹{(b.actual_spent || 0).toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${b.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{(b.variance || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          isOver ? 'bg-rose-100 text-rose-800' : pct > 80 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {pct}%
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
    </div>
  );
};

export default BudgetsPage;
