import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Mail, Phone, ExternalLink } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    candidate_name: '',
    email: '',
    phone: '',
    applied_position: '',
    stage: 'sourced',
    rating: 3,
    expected_salary: '',
    experience_years: 2,
    resume_url: '',
    notes: '',
  });

  useEffect(() => {
    loadCandidates();
  }, [stageFilter]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const res = await hrService.getCandidates({ stage: stageFilter || undefined });
      setCandidates(res.data?.candidates || []);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createCandidate(formData);
      toast.success('Candidate profile added successfully');
      setShowModal(false);
      setFormData({
        candidate_name: '',
        email: '',
        phone: '',
        applied_position: '',
        stage: 'sourced',
        rating: 3,
        expected_salary: '',
        experience_years: 2,
        resume_url: '',
        notes: '',
      });
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleStageChange = async (id, newStage) => {
    try {
      await hrService.updateCandidate(id, { stage: newStage });
      toast.success('Candidate stage updated');
      loadCandidates();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const filtered = candidates.filter(c => 
    c.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.applied_position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Candidate Database & Pipeline"
          subtitle="Review candidate profiles, stage progressions, interview feedback, and talent pool."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Recruitment', link: '/hr/recruitment' }, { label: 'Candidates' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Pipeline Stages</option>
            <option value="sourced">Sourced</option>
            <option value="screened">Screened</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Applied Position</th>
                <th className="px-5 py-3">Experience</th>
                <th className="px-5 py-3">Pipeline Stage</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading candidates...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No candidates found.</td>
                </tr>
              ) : (
                filtered.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {cand.candidate_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {cand.email}</div>
                      {cand.phone && <div className="flex items-center gap-1 mt-0.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {cand.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5">{cand.applied_position || 'General'}</td>
                    <td className="px-5 py-3.5">{cand.experience_years ? `${cand.experience_years} yrs` : 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={cand.stage}
                        onChange={(e) => handleStageChange(cand._id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-indigo-500 ${
                          cand.stage === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                          cand.stage === 'interviewing' ? 'bg-indigo-100 text-indigo-800' :
                          cand.stage === 'offered' ? 'bg-blue-100 text-blue-800' :
                          cand.stage === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <option value="sourced">Sourced</option>
                        <option value="screened">Screened</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">★ {cand.rating || 0}/5</td>
                    <td className="px-5 py-3.5 text-right">
                      {cand.resume_url && (
                        <a
                          href={cand.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                        >
                          Resume <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
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
            <h2 className="text-lg font-bold text-slate-900">Add New Candidate</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Candidate Full Name *</label>
                <input
                  required
                  type="text"
                  value={formData.candidate_name}
                  onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Applied Position</label>
                  <input
                    type="text"
                    value={formData.applied_position}
                    onChange={(e) => setFormData({ ...formData, applied_position: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Resume Link / URL</label>
                <input
                  type="url"
                  value={formData.resume_url}
                  onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="https://..."
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
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
