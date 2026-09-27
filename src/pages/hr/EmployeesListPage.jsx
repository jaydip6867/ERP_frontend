import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Edit2, Eye, Shield, Trash2 } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { organizationService } from '../../services/organization.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Link, useNavigate } from 'react-router-dom';

export const EmployeesListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, [search, deptFilter, statusFilter]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await hrService.getEmployees({
        search,
        department_id: deptFilter || undefined,
        status: statusFilter || undefined,
      });
      setEmployees(res.data?.employees || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await organizationService.getDepartments();
      setDepartments(res.data?.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate and archive employee ${name}?`)) return;
    try {
      await hrService.deleteEmployee(id);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive employee');
    }
  };

  const columns = [
    {
      header: 'Code',
      key: 'employee_code',
      cellClassName: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Employee Name',
      key: 'full_name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {row.full_name ? row.full_name.slice(0, 2).toUpperCase() : 'EM'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.full_name}</div>
            <div className="text-xs text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department_id',
      render: (val) => (
        <span className="font-medium text-slate-700">
          {val?.department_name || '-'}
        </span>
      ),
    },
    {
      header: 'Designation',
      key: 'designation_id',
      render: (val) => (
        <span className="text-xs text-slate-600">
          {val?.position_name || '-'}
        </span>
      ),
    },
    {
      header: 'Employment Type',
      key: 'employment_type',
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium uppercase">
          {val?.replace('_', ' ') || 'FULL TIME'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            val === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : val === 'probation'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Employees Directory"
          subtitle="Manage active staff, contractor records, profiles, designations, and departmental allocations."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Employees' }]}
        />
        <Link
          to="/hr/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Onboard New Employee
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none bg-transparent"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.department_name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="notice_period">Notice Period</option>
          <option value="resigned">Resigned</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        rowKey="_id"
        onRowClick={(row) => navigate(`/hr/employees/${row._id}`)}
        actions={(row) => (
          <div className="flex items-center gap-1.5">
            <Link
              to={`/hr/employees/${row._id}`}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              title="View Profile"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row._id, row.full_name);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Deactivate / Archive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default EmployeesListPage;
