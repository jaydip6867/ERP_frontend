import React, { useState, useEffect } from 'react';
import { Clock, Plus, AlertOctagon, CheckCircle2, UserCheck } from 'lucide-react';
import { productionService } from '../../services/production.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const ProductionLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);

  const [formData, setFormData] = useState({
    work_order_id: '',
    shift: 'Shift A (Morning)',
    machine_name: 'CNC Milling Cell #1',
    operator_name: '',
    quantity_produced: 25,
    scrap_quantity: 0,
    downtime_minutes: 0,
    downtime_reason: '',
    remarks: '',
  });

  useEffect(() => {
    loadLogs(pagination.page);
    loadWorkOrders();
  }, [pagination.page]);

  const loadWorkOrders = async () => {
    try {
      const res = await productionService.getWorkOrders({ limit: 50 });
      const wos = res.data?.orders || [];
      setWorkOrders(wos);
      if (wos.length > 0) {
        setFormData((prev) => ({ ...prev, work_order_id: wos[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await productionService.getProductionLogs({ page, limit: 10 });
      setLogs(res.data?.logs || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await productionService.createProductionLog(formData);
      setShowModal(false);
      loadLogs(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording log');
    }
  };

  const columns = [
    {
      header: 'Log #',
      key: 'log_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date & Shift',
      key: 'log_date',
      render: (dt, row) => (
        <div>
          <p className="text-xs font-semibold text-slate-900">{new Date(dt).toLocaleDateString('en-IN')}</p>
          <p className="text-[11px] text-slate-500">{row.shift}</p>
        </div>
      ),
    },
    {
      header: 'Work Order #',
      key: 'work_order_id',
      render: (wo) => <span className="font-mono text-xs text-indigo-700 font-semibold">{wo?.wo_number}</span>,
    },
    {
      header: 'Machine / Cell',
      key: 'machine_name',
      render: (m) => <span className="text-xs text-slate-700">{m || 'Assembly Line'}</span>,
    },
    {
      header: 'Produced Qty',
      key: 'quantity_produced',
      cellClassName: 'font-mono font-bold text-emerald-700 text-center',
    },
    {
      header: 'Scrap Qty',
      key: 'scrap_quantity',
      cellClassName: 'font-mono font-bold text-rose-600 text-center',
      render: (val) => val || 0,
    },
    {
      header: 'Downtime (min)',
      key: 'downtime_minutes',
      cellClassName: 'font-mono text-slate-700 text-center',
      render: (val, row) => (val > 0 ? `${val}m (${row.downtime_reason || 'General'})` : '0m'),
    },
    {
      header: 'Operator',
      key: 'operator_name',
      render: (op) => <span className="text-xs text-slate-600">{op || 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Shift Logs"
        subtitle="Hourly and shift output tracking, downtime recording, and machine telemetry."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production', href: '/production' },
          { label: 'Logs' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Record Shift Log
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Production Shift Log" size="md">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Order *</label>
              <select
                value={formData.work_order_id}
                onChange={(e) => setFormData({ ...formData, work_order_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              >
                {workOrders.map((wo) => (
                  <option key={wo._id} value={wo._id}>{wo.wo_number}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="Shift A (Morning)">Shift A (Morning 07:00 - 15:30)</option>
                  <option value="Shift B (Evening)">Shift B (Evening 15:30 - 00:00)</option>
                  <option value="Shift C (Night)">Shift C (Night 00:00 - 07:00)</option>
                  <option value="General">General (09:00 - 18:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Machine / Workstation</label>
                <input
                  type="text"
                  value={formData.machine_name}
                  onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Produced Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity_produced}
                  onChange={(e) => setFormData({ ...formData, quantity_produced: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scrap / Rejection Qty</label>
                <input
                  type="number"
                  min="0"
                  value={formData.scrap_quantity}
                  onChange={(e) => setFormData({ ...formData, scrap_quantity: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Downtime Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={formData.downtime_minutes}
                  onChange={(e) => setFormData({ ...formData, downtime_minutes: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Downtime Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Blade change, power trip"
                  value={formData.downtime_reason}
                  onChange={(e) => setFormData({ ...formData, downtime_reason: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Name</label>
              <input
                type="text"
                placeholder="Operator on duty"
                value={formData.operator_name}
                onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Record Log
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProductionLogsPage;
