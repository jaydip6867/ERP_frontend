import React, { useState, useEffect } from 'react';
import { UserCheck, CheckSquare, Clock, Plus, AlertCircle } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const OnboardingPage = () => {
  const [onboardings, setOnboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    start_date: new Date().toISOString().split('T')[0],
    target_completion_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oRes, eRes] = await Promise.all([
        hrService.getOnboarding(),
        hrService.getEmployees(),
      ]);
      setOnboardings(oRes.data?.onboarding || []);
      setEmployees(eRes.data?.employees || []);
    } catch (err) {
      toast.error('Failed to load onboarding workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createOnboarding({
        ...formData,
        checklist: [
          { task: 'ID & Email Provisioning', category: 'IT Support' },
          { task: 'Document Verification & KYC', category: 'HR Compliance' },
          { task: 'ERP Access & Role Assignment', category: 'System Admin' },
          { task: 'Company Culture & Policy Briefing', category: 'People Operations' },
        ],
      });
      toast.success('Onboarding checklist created');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate onboarding');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Employee Onboarding & Induction"
          subtitle="Manage digital checklists, equipment provisioning, KYC compliance, and new hire readiness."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Recruitment', link: '/hr/recruitment' }, { label: 'Onboarding' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Initiate Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading onboarding records...</div>
        ) : onboardings.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No active onboarding processes right now.
          </div>
        ) : (
          onboardings.map((ob) => {
            const completedCount = ob.checklist?.filter(c => c.completed).length || 0;
            const totalCount = ob.checklist?.length || 1;
            const pct = Math.round((completedCount / totalCount) * 100);

            return (
              <div key={ob._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {ob.employee_id?.employee_code || 'EMP'}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                      ob.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {ob.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">
                      {ob.employee_id?.full_name || 'New Hire'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {ob.employee_id?.department_id?.name || 'Department'} • {ob.employee_id?.position_id?.title || 'Role'}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Tasks Completed</span>
                      <span>{completedCount}/{totalCount} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    {ob.checklist?.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckSquare className={`w-3.5 h-3.5 ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={task.completed ? 'line-through text-slate-400' : ''}>{task.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Started: {ob.start_date ? new Date(ob.start_date).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Initiate Onboarding Checklist</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Select Employee *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="">Select Employee</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.full_name} ({e.employee_code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Date</label>
                  <input
                    type="date"
                    value={formData.target_completion_date}
                    onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Notes / Setup Brief</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Start Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
