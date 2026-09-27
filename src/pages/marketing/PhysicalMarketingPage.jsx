import React, { useState, useEffect } from 'react';
import { Store, Plus, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const PhysicalMarketingPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    activity_name: '',
    activity_type: 'EXHIBITION',
    location: '',
    cost: 150000,
    start_date: '',
    end_date: '',
    expected_footfall: 5000,
    status: 'confirmed',
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getPhysical();
      setActivities(res.data?.activities || []);
    } catch (err) {
      toast.error('Failed to load physical events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createPhysical(formData);
      toast.success('Physical marketing activation scheduled');
      setShowModal(false);
      loadActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Physical Activations, Trade Fairs & Signages"
          subtitle="Textile expo stalls, outdoor hoardings, retail Point-of-Purchase (POP) displays, and dealer meet sponsorships."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Physical Marketing' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Schedule Activation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading physical activations...</div>
        ) : activities.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No physical marketing campaigns scheduled.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700">
                    {act.activity_type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 text-emerald-700">
                    {act.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{act.activity_name}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {act.location}</div>
                  <div>Budget / Cost: <b>₹{(act.cost || 0).toLocaleString('en-IN')}</b></div>
                  <div>Expected Footfall: <b>{(act.expected_footfall || 0).toLocaleString()} visitors</b></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Schedule Physical Activation</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Event / Activation Title *</label>
                <input
                  required
                  type="text"
                  value={formData.activity_name}
                  onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Gartex Texprocess India 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Type</label>
                  <select
                    value={formData.activity_type}
                    onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="EXHIBITION">Exhibition / Expo Stall</option>
                    <option value="OUTDOOR_HOARDING">Outdoor Hoarding</option>
                    <option value="RETAIL_SIGNAGE">Retail Signage</option>
                    <option value="POP_DISPLAY">Point of Purchase (POP)</option>
                    <option value="EVENT_SPONSORSHIP">Event Sponsorship</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Location / City *</label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
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
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalMarketingPage;
