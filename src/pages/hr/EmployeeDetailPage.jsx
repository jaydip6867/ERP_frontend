import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Building2, Calendar, Shield, Clock, Award, FileText, ArrowLeft, CheckCircle2, Edit2 } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/hr/employees/create', { replace: true });
      return;
    }
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const res = await hrService.getEmployeeById(id);
      setEmployee(res.data?.employee || null);
    } catch (err) {
      console.error('Failed to load employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading employee profile...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-rose-500">Employee record not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/hr/employees"
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <PageHeader
          title={employee.full_name}
          subtitle={`Employee Code: ${employee.employee_code} • Department: ${employee.department_id?.department_name || 'General'}`}
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Employees', href: '/hr/employees' }, { label: employee.full_name }]}
        />
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
            {employee.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{employee.full_name}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  employee.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {employee.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {employee.designation_id?.position_name || 'Designation Pending'} • Level {employee.designation_id?.level || 1}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              {employee.mobile && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.mobile}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          to={`/hr/employees/${employee._id}/edit`}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-semibold">
        {[
          { key: 'profile', label: 'Overview Profile' },
          { key: 'statutory', label: 'Payroll & Statutory' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Particulars</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Employment Type</span>
                <span className="font-medium text-slate-800 capitalize">{employee.employment_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Date of Joining</span>
                <span className="font-medium text-slate-800">
                  {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Assigned Branch</span>
                <span className="font-medium text-slate-800">{employee.branch_id?.branch_name || 'Corporate HQ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-medium text-slate-800">
                  {employee.reporting_manager_id?.full_name || 'Direct / Founder'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Contact Person</span>
                <span className="font-medium text-slate-800">{employee.emergency_contact?.name || 'Not specified'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Relationship</span>
                <span className="font-medium text-slate-800">{employee.emergency_contact?.relation || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Phone</span>
                <span className="font-medium text-slate-800">{employee.emergency_contact?.phone || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'statutory' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Confidential Statutory Records
            </h4>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">Restricted Visibility</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Bank Account Number</span>
              <span className="font-mono font-bold text-slate-800">
                {employee.bank_account || '•••••••••••• (Hidden or Not Provided)'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Bank IFSC Code</span>
              <span className="font-mono font-bold text-slate-800">
                {employee.ifsc || '••••••••'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">PAN Card Number</span>
              <span className="font-mono font-bold text-slate-800">
                {employee.pan || '••••••••'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">UAN / PF Identifier</span>
              <span className="font-mono font-bold text-slate-800">
                {employee.uan || '••••••••••••'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
