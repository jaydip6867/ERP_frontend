import React, { useState, useEffect } from 'react';
import { Scissors, Plus, CheckCircle, Clock } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const EmbroideryJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    job_code: '',
    embroidery_type: 'FLAT_THREAD',
    stitches_count: 7500,
    quantity: 150,
    status: 'queued',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getEmbroidery();
      setJobs(res.data?.embroideryJobs || []);
    } catch (err) {
      toast.error('Failed to load embroidery jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createEmbroidery(formData);
      toast.success('Embroidery job batch queued');
      setShowModal(false);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create embroidery job');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Embroidery Unit & Needlework Job Queue"
          subtitle="Multi-head computer embroidery, stitch count logs, 3D puff embroidery, and applique production."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Embroidery Jobs' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Queue Embroidery Job
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Job Code</th>
                <th className="px-5 py-3">Embroidery Type</th>
                <th className="px-5 py-3">Stitch Count</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading embroidery queue...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No embroidery jobs queued.</td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{j.job_code}</td>
                    <td className="px-5 py-3.5 font-medium capitalize text-slate-800">
                      {j.embroidery_type?.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5 font-mono">{(j.stitches_count || 0).toLocaleString()} stitches</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{j.completed_qty || 0} / {j.quantity} pcs</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${
                        j.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        j.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {j.status?.replace('_', ' ')}
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Queue Embroidery Batch</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Job Code *</label>
                  <input
                    required
                    type="text"
                    value={formData.job_code}
                    onChange={(e) => setFormData({ ...formData, job_code: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. EMB-2026-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Type</label>
                  <select
                    value={formData.embroidery_type}
                    onChange={(e) => setFormData({ ...formData, embroidery_type: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="FLAT_THREAD">Flat Thread</option>
                    <option value="3D_PUFF">3D Puff</option>
                    <option value="APPLIQUE">Applique</option>
                    <option value="SEQUIN">Sequin</option>
                    <option value="CHENILLE">Chenille</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Stitch Density / Count</label>
                  <input
                    type="number"
                    value={formData.stitches_count}
                    onChange={(e) => setFormData({ ...formData, stitches_count: parseInt(e.target.value) || 5000 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Batch Quantity (pcs) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
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
                  Queue Embroidery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbroideryJobsPage;
