import React, { useState, useEffect } from 'react';
import { Compass, Plus, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const ProblemSolvingPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    methodology: '8D',
    root_cause: '',
    corrective_actions: '',
    preventive_actions: '',
    status: 'open',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await rndService.getProblemSolving();
      const list = res.data?.projects || res.data?.problemSolving || (Array.isArray(res.data) ? res.data : []);
      setProjects(list);
    } catch (err) {
      toast.error('Failed to load problem solving projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createProblemSolving({
        ...formData,
        corrective_actions: formData.corrective_actions ? formData.corrective_actions.split(',').map(s => s.trim()) : [],
        preventive_actions: formData.preventive_actions ? formData.preventive_actions.split(',').map(s => s.trim()) : [],
      });
      toast.success('Root-cause problem solving project logged');
      setShowModal(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create problem solving project');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Root Cause Analysis & 8D Problem Solving"
          subtitle="Structured problem solving methodologies (8D, 5-Why, Ishikawa Fishbone, DMAIC) for quality defects."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: '8D Problem Solving' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Initiate 8D Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading problem solving projects...</div>
        ) : (Array.isArray(projects) ? projects : []).length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No active 8D root cause cases open.
          </div>
        ) : (
          (Array.isArray(projects) ? projects : []).map((proj) => (
            <div key={proj._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-slate-100 text-slate-700">
                    {proj.methodology}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    proj.status === 'closed' ? 'bg-emerald-50 text-emerald-700' :
                    proj.status === 'verified' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{proj.title}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><b>Root Cause:</b> {proj.root_cause || 'Investigation underway'}</div>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-xs font-semibold text-slate-700">Preventive Actions:</span>
                  {proj.preventive_actions?.map((act, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Initiate 8D / RCA Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Issue / Defect Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Color bleeding in wash cycle for navy dye lot"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Methodology Framework</label>
                <select
                  value={formData.methodology}
                  onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="8D">8 Disciplines (8D)</option>
                  <option value="5_WHY">5-Why Analysis</option>
                  <option value="FISHBONE">Ishikawa Fishbone Diagram</option>
                  <option value="DMAIC">Six Sigma DMAIC</option>
                  <option value="PDCA">Plan-Do-Check-Act (PDCA)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Identified Root Cause</label>
                <textarea
                  rows="2"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Corrective Actions (Immediate)</label>
                <input
                  type="text"
                  value={formData.corrective_actions}
                  onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="Quarantine lot #489, add fixer wash"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Preventive Actions (Long term)</label>
                <input
                  type="text"
                  value={formData.preventive_actions}
                  onChange={(e) => setFormData({ ...formData, preventive_actions: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="Calibrate dye dosing meters every shift"
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
                  Log RCA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemSolvingPage;
