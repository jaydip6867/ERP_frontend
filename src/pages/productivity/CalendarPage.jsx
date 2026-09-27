import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Users, Plus } from 'lucide-react';
import { productivityService } from '../../services/productivity.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await productivityService.getCalendarEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Calendar & Events"
        subtitle="Schedule customer visits, executive board meetings, supplier audits, and dispatch milestones."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Productivity' },
          { label: 'Calendar' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">September 2026</h3>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Days grid header */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 text-center text-xs font-bold text-slate-600 py-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Agenda Events List */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-bold text-slate-800">Scheduled Milestones & Events</h4>
          {loading ? (
            <div className="text-slate-400 text-sm py-4">Loading calendar events...</div>
          ) : events.length === 0 ? (
            <div className="text-slate-400 text-sm py-4">No events scheduled this month</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((ev) => (
                <div key={ev._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      {new Date(ev.start_time).toLocaleDateString()} at {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {ev.event_type || 'MEETING'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{ev.title}</h4>
                  <p className="text-xs text-slate-500">{ev.description || 'Enterprise Calendar Event'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
