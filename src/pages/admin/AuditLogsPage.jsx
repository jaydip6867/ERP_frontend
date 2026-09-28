import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, LogIn, Laptop, Eye } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';
import { FilterBar } from '../../components/shell/FilterBar';

export const AuditLogsPage = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Diff inspection modal
  const [inspectItem, setInspectItem] = useState(null);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    } else {
      loadLoginHistory();
    }
  }, [activeTab, search, moduleFilter, actionFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({
        search,
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
      });
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.logs || res.data?.data || []);
      setAuditLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLoginHistory({ search });
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.history || res.data?.data || []);
      setLoginHistory(list);
    } catch (err) {
      console.error('Failed to load login history:', err);
    } finally {
      setLoading(false);
    }
  };

  const auditColumns = [
    {
      header: 'Timestamp',
      key: 'createdAt',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      header: 'User',
      key: 'user_name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val || 'System'}</span>
          <span className="text-xs text-slate-400">{row.user_email}</span>
        </div>
      ),
    },
    {
      header: 'Module',
      key: 'module',
      render: (val) => (
        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Record Reference',
      key: 'record_ref',
      render: (val, row) => val || row.record_id || '—',
    },
    {
      header: 'IP Address',
      key: 'ip_address',
      cellClassName: 'font-mono text-xs text-slate-500',
    },
  ];

  const loginColumns = [
    {
      header: 'Timestamp',
      key: 'createdAt',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      header: 'User',
      key: 'user_id',
      render: (val) => val?.full_name || val?.email || '—',
    },
    {
      header: 'IP Address',
      key: 'ip_address',
      cellClassName: 'font-mono text-xs',
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            val === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {val?.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Device / User Agent',
      key: 'user_agent',
      render: (val) => <span className="text-xs text-slate-500 line-clamp-1">{val || '—'}</span>,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Audit Logs & Compliance"
        subtitle="Immutable forensic audit trail tracking all record changes, mutations, approvals, and user authentication events."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit Trail' }]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Mutation Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('logins')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'logins'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LogIn className="w-4 h-4" />
          User Login History ({loginHistory.length})
        </button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Filter logs by user, record reference, IP..."
        filters={
          activeTab === 'audit'
            ? [
                {
                  label: 'All Modules',
                  value: moduleFilter,
                  onChange: setModuleFilter,
                  options: [
                    { label: 'Products', value: 'product' },
                    { label: 'Customers', value: 'customer' },
                    { label: 'Leads', value: 'lead' },
                    { label: 'Quotations', value: 'quotation' },
                    { label: 'Users', value: 'user' },
                  ],
                },
                {
                  label: 'All Actions',
                  value: actionFilter,
                  onChange: setActionFilter,
                  options: [
                    { label: 'Create', value: 'CREATE' },
                    { label: 'Update', value: 'UPDATE' },
                    { label: 'Delete', value: 'DELETE' },
                    { label: 'Approve', value: 'APPROVE' },
                  ],
                },
              ]
            : []
        }
        onReset={() => {
          setSearch('');
          setModuleFilter('');
          setActionFilter('');
        }}
      />

      {activeTab === 'audit' ? (
        <DataTable
          columns={auditColumns}
          data={auditLogs}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => setInspectItem(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              title="Inspect Record Changes"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        />
      ) : (
        <DataTable columns={loginColumns} data={loginHistory} loading={loading} />
      )}

      {/* Audit Log Inspect Modal */}
      <Modal
        isOpen={Boolean(inspectItem)}
        onClose={() => setInspectItem(null)}
        title="Audit Mutation Record"
        maxWidth="max-w-3xl"
      >
        {inspectItem && (
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>User: <span className="font-bold text-slate-800">{inspectItem.user_name}</span></div>
                <div>Module: <span className="font-bold text-slate-800">{inspectItem.module}</span></div>
                <div>Action: <span className="font-bold text-slate-800">{inspectItem.action}</span></div>
                <div>Record ID: <span className="font-bold text-slate-800">{inspectItem.record_id}</span></div>
                <div>IP: <span className="font-bold text-slate-800">{inspectItem.ip_address || '—'}</span></div>
                <div>Date: <span className="font-bold text-slate-800">{new Date(inspectItem.createdAt).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-sans font-bold text-slate-700 text-sm mb-1.5">State Before</h4>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-64">
                  {inspectItem.before ? JSON.stringify(inspectItem.before, null, 2) : 'No prior state recorded'}
                </pre>
              </div>
              <div>
                <h4 className="font-sans font-bold text-slate-700 text-sm mb-1.5">State After</h4>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto max-h-64">
                  {inspectItem.after ? JSON.stringify(inspectItem.after, null, 2) : 'No mutation data'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AuditLogsPage;
