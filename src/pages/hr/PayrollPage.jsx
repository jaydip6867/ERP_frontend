import React, { useState, useEffect } from 'react';
import { DollarSign, Play, Calendar, Download, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const PayrollPage = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    loadPayroll();
  }, [month, year]);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const res = await hrService.getPayroll({ month, year });
      setPayroll(res.data?.payroll || []);
    } catch (err) {
      toast.error('Failed to load payroll records or permission denied');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    if (!window.confirm(`Are you sure you want to execute payroll batch for Month ${month}, Year ${year}?`)) {
      return;
    }
    try {
      setRunning(true);
      const res = await hrService.runPayroll({ month, year });
      toast.success(res.message || 'Payroll batch executed successfully');
      loadPayroll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute payroll run');
    } finally {
      setRunning(false);
    }
  };

  const safePayroll = Array.isArray(payroll)
    ? payroll
    : (Array.isArray(payroll?.payroll) ? payroll.payroll : []);
  const totalDisbursed = safePayroll.reduce((acc, p) => acc + (p.net_salary || 0), 0);
  const totalEmployees = safePayroll.length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Payroll Processing & Disbursal"
          subtitle="Execute automated monthly salary calculations, statutory deductions, tax withholdings, and pay slips."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Payroll' }]}
        />
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={handleRunPayroll}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Play className="w-4 h-4 fill-white" />
            {running ? 'Processing...' : 'Run Payroll'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Disbursal Amount</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">₹{totalDisbursed.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 mt-1">Net salary for cycle {month}/{year}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employees Processed</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalEmployees}</div>
          <div className="text-xs text-slate-400 mt-1">Active staff on payroll</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payroll Status</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            {totalEmployees > 0 ? 'Calculated' : 'Not Run'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Bank file generation ready</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Pay Days</th>
                <th className="px-5 py-3">Gross Salary</th>
                <th className="px-5 py-3">Deductions</th>
                <th className="px-5 py-3">Net Salary</th>
                <th className="px-5 py-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading payroll ledger...</td>
                </tr>
              ) : safePayroll.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No payroll generated for this period. Click 'Run Payroll' to calculate.
                  </td>
                </tr>
              ) : (
                safePayroll.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {pay.employee_id?.full_name || 'Staff Member'}
                      <div className="text-xs text-slate-400 font-normal">{pay.employee_id?.employee_code}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{pay.paid_days || 30} days</td>
                    <td className="px-5 py-3.5 font-mono text-slate-800">₹{(pay.gross_salary || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-mono text-rose-600">-₹{(pay.total_deductions || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">₹{(pay.net_salary || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                        pay.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {pay.status || 'draft'}
                      </span>
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

export default PayrollPage;
