import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react';
import { leadService } from '../../services/lead.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const FollowupsPage = () => {
  const [filterType, setFilterType] = useState('today');
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complete Followup Modal
  const [completingItem, setCompletingItem] = useState(null);
  const [completeForm, setCompleteForm] = useState({ outcome: '', next_followup_date: '', next_agenda: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFollowups();
  }, [filterType]);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const res = await leadService.getFollowups({ filter_type: filterType });
      setFollowups(res.data || []);
    } catch (err) {
      console.error('Failed to load followups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await leadService.completeFollowup(completingItem._id, completeForm);
      setCompletingItem(null);
      loadFollowups();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete follow-up');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Scheduled Date & Time',
      key: 'followup_date',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{new Date(val).toLocaleDateString()}</span>
          <span className="text-xs text-slate-400">{row.followup_time}</span>
        </div>
      ),
    },
    {
      header: 'Lead / Prospect',
      key: 'lead_id',
      render: (val) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val?.contact_name || 'Prospect'}</span>
          <span className="text-xs text-slate-500">{val?.company_name} • {val?.mobile}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'followup_type',
      render: (val) => <span className="capitalize text-xs px-2 py-0.5 rounded bg-slate-100">{val}</span>,
    },
    {
      header: 'Agenda / Subject',
      key: 'agenda',
      render: (val) => <span className="text-xs font-medium text-slate-800 line-clamp-1">{val}</span>,
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
            val === 'urgent' || val === 'high'
              ? 'bg-rose-50 text-rose-700'
              : val === 'medium'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Sales Follow-ups & Task Queue"
        subtitle="Manage daily prospect calls, physical client meetings, sample dispatch reviews, and overdue outreach reminders."
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Follow-ups' }]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setFilterType('today')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            filterType === 'today'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Scheduled for Today
        </button>
        <button
          onClick={() => setFilterType('overdue')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            filterType === 'overdue'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Overdue Follow-ups
        </button>
        <button
          onClick={() => setFilterType('upcoming')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            filterType === 'upcoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming Agenda
        </button>
      </div>

      <DataTable
        columns={columns}
        data={followups}
        loading={loading}
        actions={(row) =>
          row.status === 'pending' ? (
            <button
              onClick={() => {
                setCompletingItem(row);
                setCompleteForm({ outcome: '', next_followup_date: '', next_agenda: '' });
              }}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Completed
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Completed</span>
          )
        }
      />

      {/* Complete Modal */}
      <Modal
        isOpen={Boolean(completingItem)}
        onClose={() => setCompletingItem(null)}
        title="Complete Follow-up & Record Outcome"
      >
        {completingItem && (
          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Call / Meeting Outcome *</label>
              <textarea
                rows={3}
                required
                placeholder="What was discussed? Client feedback, next steps agreed..."
                value={completeForm.outcome}
                onChange={(e) => setCompleteForm({ ...completeForm, outcome: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-semibold text-xs text-slate-700 block">Schedule Next Follow-up (Optional)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Next Date</label>
                  <input
                    type="date"
                    value={completeForm.next_followup_date}
                    onChange={(e) => setCompleteForm({ ...completeForm, next_followup_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Next Agenda</label>
                  <input
                    type="text"
                    placeholder="e.g. Send rate card, review sample"
                    value={completeForm.next_agenda}
                    onChange={(e) => setCompleteForm({ ...completeForm, next_agenda: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompletingItem(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                {saving ? 'Completing...' : 'Save & Mark Completed'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default FollowupsPage;
