import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, CheckCircle, XCircle, Search, Tag, Eye } from 'lucide-react';
import { expenseOwnerService } from '../../services/expenseOwner.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseOwnerService.getExpenses();
      setExpenses(res.data || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operating Expenses"
        subtitle="Operational disbursements, administrative costs, marketing spends, and compliance approvals."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Expenses' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Expense No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Title / Purpose</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Approval</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No expenses recorded</td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr
                    key={e._id}
                    onClick={() => setSelectedExpense(e)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{e.expense_number}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(e.expense_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{e.title}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {e.category_id?.category_name || 'Administrative'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{e.payment_mode}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{(e.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                        {e.approval_status || 'Approved'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(ev) => ev.stopPropagation()}>
                      <button
                        onClick={() => setSelectedExpense(e)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedExpense && (
        <Modal
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          title={`Expense Voucher: ${selectedExpense.expense_number}`}
          size="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500 block">Expense Date</span>
                <span className="font-semibold text-slate-900">
                  {new Date(selectedExpense.expense_date).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Category</span>
                <span className="font-medium text-indigo-700">
                  {selectedExpense.category_id?.category_name || 'Operational Expense'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Payment Mode</span>
                <span className="font-semibold text-slate-800">{selectedExpense.payment_mode || 'Cash/Bank'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Approval Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                  {selectedExpense.approval_status || 'Approved'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Expense Title & Purpose:</span>
              <p className="font-semibold text-slate-900 mb-1">{selectedExpense.title}</p>
              {selectedExpense.description && (
                <p className="text-xs text-slate-600">{selectedExpense.description}</p>
              )}
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Total Expense Amount:</span>
              <span className="font-mono font-bold text-indigo-700 text-xl">₹{Number(selectedExpense.amount || 0).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExpensesPage;
