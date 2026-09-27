import React, { useState, useEffect } from 'react';
import { GitBranch, Building2, User, ChevronRight, Layers, Users } from 'lucide-react';
import { organizationService } from '../../services/organization.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const OrganizationTreePage = () => {
  const [treeData, setTreeData] = useState([]);
  const [stats, setStats] = useState({ totalDepartments: 0, totalPositions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getTree();
      setTreeData(res.data?.tree || []);
      setStats({
        totalDepartments: res.data?.totalDepartments || 0,
        totalPositions: res.data?.totalPositions || 0,
      });
    } catch (err) {
      console.error('Failed to load organization tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDepartmentNode = (dept, depth = 0) => (
    <div key={dept._id || dept.id} className="relative pl-6 pb-6">
      {depth > 0 && (
        <div className="absolute left-0 top-6 w-6 h-0.5 bg-slate-300" />
      )}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 hover:shadow-md transition-shadow duration-200 max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 text-base">{dept.department_name}</h4>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-semibold text-slate-600 border border-slate-200">
                  {dept.department_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{dept.description || 'Core Department'}</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              dept.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {dept.status || 'active'}
          </span>
        </div>

        {dept.head_user_id && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <User className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-slate-800">Department Head:</span>
            <span>{dept.head_user_id.full_name}</span>
            <span className="text-slate-400">({dept.head_user_id.email})</span>
          </div>
        )}

        {dept.positions && dept.positions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Positions ({dept.positions.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {dept.positions.map((pos) => (
                <span
                  key={pos._id || pos.id}
                  className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {pos.position_name}
                  <span className="text-[10px] font-mono text-slate-400">L{pos.level || 1}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {dept.children && dept.children.length > 0 && (
        <div className="relative pl-6 ml-3 mt-4 border-l-2 border-slate-200 space-y-4">
          {dept.children.map((child) => renderDepartmentNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Organization Tree & Hierarchy"
        subtitle="Visual structure of enterprise departments, reporting relationships, and job designations."
        breadcrumbs={[{ label: 'Organization' }, { label: 'Hierarchy Tree' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalDepartments}</div>
            <div className="text-xs text-slate-500 font-medium">Departments</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalPositions}</div>
            <div className="text-xs text-slate-500 font-medium">Defined Positions</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Multi-Tier</div>
            <div className="text-xs text-slate-500 font-medium">Branch Structure</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-600" />
          Departmental Reporting Chart
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading organization hierarchy...</div>
        ) : treeData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No departments defined yet. Navigate to Departments to create the first root department.
          </div>
        ) : (
          <div className="space-y-4">
            {treeData.map((rootDept) => renderDepartmentNode(rootDept, 0))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationTreePage;
