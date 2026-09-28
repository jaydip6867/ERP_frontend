import React, { useState, useEffect } from 'react';
import { Microscope, Plus, CheckCircle, Clock, Tag } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const SamplesPage = () => {
  const [samples, setSamples] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    sample_code: '',
    version: 'v1.0',
    cost: 1500,
    status: 'requested',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes] = await Promise.all([
        rndService.getSamples(),
        rndService.getProductDevelopment(),
      ]);
      setSamples(sRes.data?.samples || (Array.isArray(sRes.data) ? sRes.data : []));
      setProjects(pRes.data?.projects || (Array.isArray(pRes.data) ? pRes.data : []));
    } catch (err) {
      toast.error('Failed to load prototype samples');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createSample(formData);
      toast.success('Product prototype sample created');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sample');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Product Prototyping & Lab Samples"
          subtitle="Sample generation, version tracking, recipe materials, and evaluation status."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Samples' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Sample
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Sample Code</th>
                <th className="px-5 py-3">NPD Project</th>
                <th className="px-5 py-3">Iteration Version</th>
                <th className="px-5 py-3">Sample Cost</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading prototype samples...</td>
                </tr>
              ) : (Array.isArray(samples) ? samples : []).length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No prototype samples logged.</td>
                </tr>
              ) : (
                (Array.isArray(samples) ? samples : []).map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{s.sample_code}</td>
                    <td className="px-5 py-3.5 font-medium">{s.project_id?.project_name || 'Project'}</td>
                    <td className="px-5 py-3.5 font-mono text-indigo-600 font-semibold">{s.version}</td>
                    <td className="px-5 py-3.5 font-mono">₹{(s.cost || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-blue-50 text-blue-700">
                        {s.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create Lab Sample</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Select Project *</label>
                <select
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="">Select NPD Project</option>
                  {(Array.isArray(projects) ? projects : []).map(p => (
                    <option key={p._id} value={p._id}>{p.project_name} ({p.project_code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Sample Code *</label>
                  <input
                    required
                    type="text"
                    value={formData.sample_code}
                    onChange={(e) => setFormData({ ...formData, sample_code: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. SMP-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Iteration Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Prototype Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
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
                  Register Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamplesPage;
