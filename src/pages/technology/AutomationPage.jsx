import React, { useState, useEffect } from 'react';
import { Zap, Plus, Play, CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { technologyService } from '../../services/technology.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const AutomationPage = () => {
  const [rules, setRules] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    trigger_event: 'SALES_ORDER_APPROVED',
    description: '',
    action_type: 'SEND_WHATSAPP',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, runRes] = await Promise.all([
        technologyService.getAutomationRules(),
        technologyService.getAutomationRuns(),
      ]);
      setRules(rRes.data?.rules || []);
      setRuns(runRes.data?.runs || []);
    } catch (err) {
      toast.error('Failed to load automation workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule) => {
    try {
      await technologyService.updateAutomationRule(rule._id, { is_active: !rule.is_active });
      toast.success(`Rule ${!rule.is_active ? 'enabled' : 'disabled'}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleRunNow = async (id) => {
    try {
      setRunningId(id);
      const res = await technologyService.runAutomationRule(id);
      toast.success(res.message || 'Workflow executed successfully');
      loadData();
    } catch (err) {
      toast.error('Execution failed');
    } finally {
      setRunningId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await technologyService.createAutomationRule({
        rule_name: formData.rule_name,
        trigger_event: formData.trigger_event,
        description: formData.description,
        actions: [{ type: formData.action_type, recipient: 'customer', template: 'STANDARD_ALERT' }],
        conditions: [],
        is_active: true,
      });
      toast.success('Automation rule created');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rule');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Automation Engine & Event Triggers"
          subtitle="Configure business process automations, webhook alerts, and instant multi-channel notifications."
          breadcrumbs={[{ label: 'Technology' }, { label: 'Automation Rules' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Automation Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading automation rules...</div>
        ) : rules.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No automation rules configured yet.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-indigo-50 text-indigo-700">
                    {rule.trigger_event}
                  </span>
                  <button
                    onClick={() => handleToggle(rule)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {rule.is_active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{rule.rule_name}</h3>
                {rule.description && <p className="text-xs text-slate-600">{rule.description}</p>}
                <div className="text-xs text-slate-500 pt-1">
                  Actions: <b>{rule.actions?.map(a => a.type).join(', ') || 'Notification'}</b>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Runs: {rule.total_runs || 0}</span>
                <button
                  onClick={() => handleRunNow(rule._id)}
                  disabled={runningId === rule._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                >
                  <Play className={`w-3.5 h-3.5 fill-indigo-600 ${runningId === rule._id ? 'animate-spin' : ''}`} />
                  Trigger Run
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Recent Execution Audit Trail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Rule / Event</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Executed At</th>
                <th className="px-4 py-2.5">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-400 text-xs">No execution history recorded yet.</td>
                </tr>
              ) : (
                runs.slice(0, 5).map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.rule_name || 'System Event'}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        {r.status || 'success'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(r.createdAt || Date.now()).toLocaleTimeString()}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{r.execution_time_ms || 42}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Define Automation Rule</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Rule Name *</label>
                <input
                  required
                  type="text"
                  value={formData.rule_name}
                  onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Notify Dispatch on Order Approval"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Trigger Event *</label>
                <select
                  value={formData.trigger_event}
                  onChange={(e) => setFormData({ ...formData, trigger_event: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="SALES_ORDER_APPROVED">Sales Order Approved</option>
                  <option value="ORDER_DISPATCHED">Order Dispatched</option>
                  <option value="INVOICE_GENERATED">Invoice Generated</option>
                  <option value="PAYMENT_RECEIVED">Payment Received</option>
                  <option value="STOCK_BELOW_REORDER">Stock Below Reorder Level</option>
                  <option value="LEAD_CREATED">New Lead Created</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Automated Action</label>
                <select
                  value={formData.action_type}
                  onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="SEND_WHATSAPP">Send WhatsApp Template Message</option>
                  <option value="SEND_EMAIL">Send Automated Email Notification</option>
                  <option value="SEND_SMS">Dispatch SMS Alert</option>
                  <option value="WEBHOOK_POST">Fire Outbound Webhook HTTP POST</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationPage;
