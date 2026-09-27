import React, { useState, useEffect } from 'react';
import { Heart, Plus, Calendar, Smile, Users, Star } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const EngagementPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'event',
    description: '',
    date: new Date().toISOString().split('T')[0],
    participants_count: 0,
    feedback_score: 90,
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await hrService.getEngagement();
      setActivities(res.data?.engagement || []);
    } catch (err) {
      toast.error('Failed to load engagement activities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createEngagement(formData);
      toast.success('Engagement event scheduled successfully');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Culture, Engagement & Wellness"
          subtitle="Team building, company-wide townhalls, wellness drives, employee surveys, and recognitions."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Culture & Engagement' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Event / Survey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No active engagement campaigns or events.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-rose-50 text-rose-700">
                    {act.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {act.date ? new Date(act.date).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{act.title}</h3>
                {act.description && <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {act.participants_count || 0} Participants</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600"><Star className="w-3.5 h-3.5 fill-emerald-500" /> {act.feedback_score || 0}% Satisfaction</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Schedule Engagement Activity</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Event / Initiative Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Annual Sports & Wellness Week"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="event">Event</option>
                    <option value="survey">Pulse Survey</option>
                    <option value="announcement">Announcement</option>
                    <option value="recognition">Recognition</option>
                    <option value="wellness">Wellness Program</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Event Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  rows="3"
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
                  Publish Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementPage;
