import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, AlertTriangle, Users, FileText } from 'lucide-react';
import { executiveService } from '../../services/executive.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const AssistantAgendaPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getAssistantAgenda();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load assistant agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  const schedule = data?.today_schedule || [
    { time: '10:00 AM', title: 'Daily Plant Production Standup', location: 'Boardroom A / Zoom' },
    { time: '12:30 PM', title: 'High-Value Vendor Payment Approval with MD', location: 'Executive Office' },
    { time: '03:00 PM', title: 'Quarterly Sales Target Review with Sales Manager', location: 'Conference Room 2' },
  ];

  const checklist = data?.checklist || [
    { text: 'Verify bank balances before NEFT outward payment cycle', done: true },
    { text: 'Ensure inspection report completed for DN50 Valve incoming lot', done: true },
    { text: 'Review customer ticket escalation for Valve trim leakage', done: false },
    { text: 'Prepare weekly GST output tax liability forecast for CFO', done: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Assistant Daily Cockpit & Agenda"
        subtitle="Manage the executive calendar, prioritized daily checklists, and follow-ups on behalf of leadership."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Executive', href: '/executive/ceo' },
          { label: 'Assistant Agenda' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            Today's Executive Schedule
          </h3>
          <div className="space-y-3">
            {schedule.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-indigo-600 px-2 py-1 bg-white border border-slate-200 rounded">
                  {s.time}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{s.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{s.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            Executive Daily Checklist
          </h3>
          <div className="space-y-2.5">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked={item.done}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <span className={`text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantAgendaPage;
