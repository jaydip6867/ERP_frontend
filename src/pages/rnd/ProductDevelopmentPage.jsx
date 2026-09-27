import React, { useState, useEffect } from 'react';
import { Beaker, Plus, Calendar, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const ProductDevelopmentPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    project_code: '',
    current_stage: 'ideation',
    budget: 500000,
    target_launch_date: '',
    status: 'active',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await rndService.getProductDevelopment();
      setProjects(res.data?.projects || []);
    } catch (err) {
      toast.error('Failed to load NPD projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createProductDevelopment(formData);
      toast.success('New product development project launched');
      setShowModal(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const stages = ['ideation', 'design', 'prototyping', 'testing', 'commercialization', 'completed'];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="New Product Development (NPD) Projects"
          subtitle="Gate reviews, stage-gate design cycles, rapid prototyping, and commercial launch roadmaps."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'NPD Projects' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create NPD Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading NPD project portfolio...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No active NPD projects found.
          </div>
        ) : (
          projects.map((proj) => {
            const currentStageIdx = stages.indexOf(proj.current_stage);

            return (
              <div key={proj._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {proj.project_code}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 text-emerald-700">
                      {proj.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">{proj.project_name}</h3>
                  <div className="text-xs text-slate-500">
                    Budget: <b className="text-slate-800">₹{(proj.budget || 0).toLocaleString('en-IN')}</b>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1 capitalize">
                      <span>Gate Stage</span>
                      <span className="text-indigo-600">{proj.current_stage}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentStageIdx + 1) / stages.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                  Target Launch: {proj.target_launch_date ? new Date(proj.target_launch_date).toLocaleDateString() : 'TBD'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Initiate NPD Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Project Name *</label>
                <input
                  required
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. EcoFlex 4-Way Stretch Fabric"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Project Code *</label>
                  <input
                    required
                    type="text"
                    value={formData.project_code}
                    onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. NPD-2026-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Current Stage</label>
                  <select
                    value={formData.current_stage}
                    onChange={(e) => setFormData({ ...formData, current_stage: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg capitalize"
                  >
                    {stages.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">R&D Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Launch</label>
                  <input
                    type="date"
                    value={formData.target_launch_date}
                    onChange={(e) => setFormData({ ...formData, target_launch_date: e.target.value })}
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
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDevelopmentPage;
