import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, FileText, CheckCircle2, Plus } from 'lucide-react';
import { productivityService } from '../../services/productivity.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await productivityService.getMeetings();
      setMeetings(res.data || []);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings & Minutes of Meeting (MOM)"
        subtitle="Schedule strategic discussions, log meeting minutes, and auto-dispatch action items into Kanban tasks."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Productivity' },
          { label: 'Meetings' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Title / Purpose</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Organizer</th>
                <th className="py-3 px-4">Action Items</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">Loading meetings...</td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No meetings recorded</td>
                </tr>
              ) : (
                meetings.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{m.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{m.agenda}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(m.start_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {m.organizer_id?.full_name || 'Admin'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-semibold text-indigo-600">
                        {(m.action_items || []).length} assigned tasks
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {m.status || 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
