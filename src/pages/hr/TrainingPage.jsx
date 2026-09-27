import React, { useState, useEffect } from 'react';
import { Award, Plus, Calendar, Users, BookOpen, Clock } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const TrainingPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer_name: '',
    start_date: '',
    end_date: '',
    capacity: 20,
    status: 'upcoming',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await hrService.getTraining();
      setPrograms(res.data?.programs || []);
    } catch (err) {
      toast.error('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createTraining(formData);
      toast.success('Training workshop scheduled successfully');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        trainer_name: '',
        start_date: '',
        end_date: '',
        capacity: 20,
        status: 'upcoming',
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule program');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Learning, Training & Development"
          subtitle="Skill enhancement programs, compliance workshops, leadership training, and certifications."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Training' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Schedule Training
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No training programs scheduled.
          </div>
        ) : (
          programs.map((prog) => (
            <div key={prog._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    prog.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    prog.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {prog.status}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Max {prog.capacity || 20}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{prog.title}</h3>
                {prog.description && <p className="text-xs text-slate-600 line-clamp-2">{prog.description}</p>}
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <div><b>Trainer:</b> {prog.trainer_name || 'Internal Lead'}</div>
                  <div>
                    <b>Schedule:</b> {prog.start_date ? new Date(prog.start_date).toLocaleDateString() : 'TBD'} - {prog.end_date ? new Date(prog.end_date).toLocaleDateString() : 'TBD'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Schedule Training Program</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Course / Workshop Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. ERP Manufacturing Workflows"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Trainer / Instructor</label>
                  <input
                    type="text"
                    value={formData.trainer_name}
                    onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="Instructor Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Seat Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
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
              <div>
                <label className="text-xs font-semibold text-slate-600">Syllabus & Objectives</label>
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
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
