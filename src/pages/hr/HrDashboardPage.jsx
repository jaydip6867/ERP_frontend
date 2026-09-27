import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, Clock, Calendar, DollarSign, Award, ChevronRight } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Link } from 'react-router-dom';

export const HrDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await hrService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {};
  const deptBreakdown = data?.departmentBreakdown || [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Human Resources Dashboard"
          subtitle="Enterprise workforce metrics, recruitment pipeline, attendance overview, and payroll management."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Dashboard' }]}
        />
        <div className="flex items-center gap-2">
          <Link
            to="/hr/employees/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            + Onboard Employee
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Headcount</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalEmployees || 0}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {metrics.activeEmployees || 0} active ({metrics.probationEmployees || 0} on probation)
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Positions</span>
            <Briefcase className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.openPositions || 0}</div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.activeCandidates || 0} candidate applicants in review
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Present Today</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.todayAttendance || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Daily clock-in recorded</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Leaves</span>
            <Calendar className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.pendingLeaves || 0}</div>
          <Link to="/hr/leave" className="text-xs text-indigo-600 hover:underline font-medium mt-1 block">
            Review Leave Requests &rarr;
          </Link>
        </div>
      </div>

      {/* Department Breakdown & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
            <span>Workforce Distribution by Department</span>
            <span className="text-xs font-normal text-slate-500">{deptBreakdown.length} Active Depts</span>
          </h3>

          <div className="space-y-3">
            {deptBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">No departmental records found.</p>
            ) : (
              deptBreakdown.map((dept, idx) => {
                const total = metrics.totalEmployees || 1;
                const pct = Math.round((dept.headcount / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>{dept.department_name}</span>
                      <span className="text-slate-500">
                        {dept.headcount} employee{dept.headcount === 1 ? '' : 's'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">HR Quick Operations</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Employee Directory', path: '/hr/employees', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Recruitment & Openings', path: '/hr/recruitment', icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
              { label: 'Attendance Roster', path: '/hr/attendance', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Payroll & Compensation', path: '/hr/payroll', icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
              { label: 'Performance Reviews', path: '/hr/performance', icon: Award, color: 'text-purple-600 bg-purple-50' },
              { label: 'Company Policies', path: '/hr/policies', icon: Calendar, color: 'text-rose-600 bg-rose-50' },
            ].map((nav, i) => (
              <Link
                key={i}
                to={nav.path}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${nav.color}`}>
                    <nav.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{nav.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrDashboardPage;
