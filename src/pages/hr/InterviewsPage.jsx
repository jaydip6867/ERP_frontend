import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, UserCheck, Star, Search } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    candidate_id: '',
    job_opening_id: '',
    interview_round: 'Round 1 - Technical Assessment',
    scheduled_at: '',
    feedback: '',
    rating: 3,
    status: 'scheduled',
    result: 'pending',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [iRes, cRes, oRes] = await Promise.all([
        hrService.getInterviews(),
        hrService.getCandidates(),
        hrService.getJobOpenings(),
      ]);
      setInterviews(iRes.data?.interviews || []);
      setCandidates(cRes.data?.candidates || []);
      setOpenings(oRes.data?.jobOpenings || []);
    } catch (err) {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createInterview(formData);
      toast.success('Interview scheduled successfully');
      setShowModal(false);
      setFormData({
        candidate_id: '',
        job_opening_id: '',
        interview_round: 'Round 1 - Technical Assessment',
        scheduled_at: '',
        feedback: '',
        rating: 3,
        status: 'scheduled',
        result: 'pending',
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Interview Scheduling & Feedback"
          subtitle="Manage interview rounds, evaluators, candidate scoring, and hiring decisions."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Recruitment', link: '/hr/recruitment' }, { label: 'Interviews' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Job Role</th>
                <th className="px-5 py-3">Round</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Rating & Feedback</th>
                <th className="px-5 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading interview schedule...</td>
                </tr>
              ) : interviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No interviews scheduled yet.</td>
                </tr>
              ) : (
                interviews.map((iv) => (
                  <tr key={iv._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {iv.candidate_id?.candidate_name || 'Candidate'}
                    </td>
                    <td className="px-5 py-3.5">{iv.job_opening_id?.title || 'Open Position'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{iv.interview_round}</td>
                    <td className="px-5 py-3.5 text-xs">
                      {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : 'TBD'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${
                        iv.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        iv.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {iv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">★ {iv.rating}/5</div>
                      <div className="text-slate-500 truncate max-w-xs">{iv.feedback || 'No remarks'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold capitalize ${
                        iv.result === 'recommended' ? 'bg-emerald-100 text-emerald-800' :
                        iv.result === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {iv.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Schedule Interview</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Candidate *</label>
                <select
                  required
                  value={formData.candidate_id}
                  onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="">Select Candidate</option>
                  {candidates.map(c => (
                    <option key={c._id} value={c._id}>{c.candidate_name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Job Position *</label>
                <select
                  required
                  value={formData.job_opening_id}
                  onChange={(e) => setFormData({ ...formData, job_opening_id: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="">Select Job Opening</option>
                  {openings.map(o => (
                    <option key={o._id} value={o._id}>{o.title} ({o.department})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Round Title</label>
                  <input
                    type="text"
                    value={formData.interview_round}
                    onChange={(e) => setFormData({ ...formData, interview_round: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Scheduled Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
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
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;
