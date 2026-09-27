import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Calendar, Shield, Save, ArrowLeft } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { organizationService } from '../../services/organization.service';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new' && id !== 'create');

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    mobile: '',
    department_id: '',
    designation_id: '',
    reporting_manager_id: '',
    branch_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'full_time',
    date_of_birth: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: '',
    bank_account: '',
    ifsc: '',
    pan: '',
    uan: '',
    status: 'active',
  });

  useEffect(() => {
    loadLookups();
    if (isEdit) {
      loadEmployee(id);
    }
  }, [id, isEdit]);

  const loadLookups = async () => {
    try {
      const [deptRes, posRes, branchRes, empRes] = await Promise.all([
        organizationService.getDepartments(),
        organizationService.getPositions(),
        adminService.getBranches(),
        hrService.getEmployees({ limit: 100 }),
      ]);
      setDepartments(deptRes.data?.departments || []);
      setPositions(posRes.data?.positions || []);
      setBranches(branchRes.data?.branches || branchRes.data || []);
      setManagers(empRes.data?.employees || []);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  const loadEmployee = async (empId) => {
    try {
      setLoadingEmployee(true);
      const res = await hrService.getEmployeeById(empId);
      const emp = res.data?.employee;
      if (emp) {
        setFormData({
          employee_code: emp.employee_code || '',
          full_name: emp.full_name || '',
          email: emp.email || '',
          mobile: emp.mobile || '',
          department_id: emp.department_id?._id || emp.department_id || '',
          designation_id: emp.designation_id?._id || emp.designation_id || '',
          reporting_manager_id: emp.reporting_manager_id?._id || emp.reporting_manager_id || '',
          branch_id: emp.branch_id?._id || emp.branch_id || '',
          joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
          employment_type: emp.employment_type || 'full_time',
          date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
          street: emp.address?.street || '',
          city: emp.address?.city || '',
          state: emp.address?.state || '',
          pincode: emp.address?.pincode || '',
          emergency_name: emp.emergency_contact?.name || '',
          emergency_relation: emp.emergency_contact?.relation || '',
          emergency_phone: emp.emergency_contact?.phone || '',
          bank_account: emp.bank_account || '',
          ifsc: emp.ifsc || '',
          pan: emp.pan || '',
          uan: emp.uan || '',
          status: emp.status || 'active',
        });
      }
    } catch (err) {
      console.error('Failed to load employee for editing:', err);
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        emergency_contact: {
          name: formData.emergency_name,
          relation: formData.emergency_relation,
          phone: formData.emergency_phone,
        },
      };
      if (isEdit) {
        await hrService.updateEmployee(id, payload);
        navigate(`/hr/employees/${id}`);
      } else {
        const res = await hrService.createEmployee(payload);
        navigate(`/hr/employees/${res.data?.employee?._id || res.data?.employee?.id || ''}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save employee profile');
    } finally {
      setSaving(false);
    }
  };

  if (loadingEmployee) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading employee details...</div>;
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
          title={isEdit ? `Edit Profile: ${formData.full_name || 'Employee'}` : 'Onboard New Employee'}
          subtitle={isEdit ? 'Update employee identity, department assignments, and statutory records' : 'Register employee identity, department assignments, and statutory details'}
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Employees', href: '/hr/employees' }, { label: isEdit ? 'Edit Profile' : 'Onboard' }]}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Basic Personal & Employee Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code</label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
                placeholder="Auto-assigned if blank"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rahul@danzaerp.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contractor</option>
                <option value="intern">Intern</option>
                <option value="probation">Probationary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Department & Organization Assignment */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Organizational Allocation & Hierarchy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.department_name} ({d.department_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Designation *</label>
              <select
                required
                value={formData.designation_id}
                onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Select Designation --</option>
                {positions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.position_name} (L{p.level})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
              <select
                value={formData.reporting_manager_id}
                onChange={(e) => setFormData({ ...formData, reporting_manager_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Direct to Board/Founder --</option>
                {managers.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.full_name} ({m.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Branch Office</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Corporate HQ --</option>
                {branches.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="active">Active</option>
                <option value="probation">Probation</option>
                <option value="notice_period">Notice Period</option>
              </select>
            </div>
          </div>
        </div>

        {/* Confidential Banking & Tax */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Confidential Payroll & Statutory Details
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
              Encrypted & RBAC Protected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                placeholder="e.g. 5010023456789"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Card Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PF / UAN Number</label>
              <input
                type="text"
                value={formData.uan}
                onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                placeholder="e.g. 100912345678"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/hr/employees"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Employee Profile' : 'Save & Onboard Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFormPage;
