import React, { useState, useEffect } from 'react';
import { Printer, Plus, CheckCircle, Clock, Play } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const PrintingJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    job_code: '',
    design_name: '',
    print_technique: 'SCREEN_PRINTING',
    colors_count: 2,
    quantity: 100,
    status: 'queued',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getPrinting();
      setJobs(res.data?.printingJobs || []);
    } catch (err) {
      toast.error('Failed to load printing jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createPrinting(formData);
      toast.success('Printing job batch queued');
      setShowModal(false);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create printing job');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Textile & Apparel Printing Operations"
          subtitle="Screen printing, DTG digital printing, heat transfer, color separations, and batch progress."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Printing Jobs' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Queue Print Job
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Job Code</th>
                <th className="px-5 py-3">Artwork / Design Name</th>
                <th className="px-5 py-3">Technique</th>
                <th className="px-5 py-3">Colors</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading print queue...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No printing jobs queued.</td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{j.job_code}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{j.design_name}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-indigo-700 bg-indigo-50/50 rounded inline-block my-2 px-2 py-0.5">
                      {j.print_technique?.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5">{j.colors_count} Colors</td>
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
            <h2 className="text-lg font-bold text-slate-900">Queue Printing Job</h2>
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
                    placeholder="e.g. PRN-2026-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Technique</label>
                  <select
                    value={formData.print_technique}
                    onChange={(e) => setFormData({ ...formData, print_technique: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="SCREEN_PRINTING">Screen Printing</option>
                    <option value="DIGITAL_DTG">Digital DTG</option>
                    <option value="SUBLIMATION">Sublimation</option>
                    <option value="HEAT_TRANSFER">Heat Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Design / Graphic Name *</label>
                <input
                  required
                  type="text"
                  value={formData.design_name}
                  onChange={(e) => setFormData({ ...formData, design_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Front Chest Minimalist Crest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">No. of Colors</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.colors_count}
                    onChange={(e) => setFormData({ ...formData, colors_count: parseInt(e.target.value) || 1 })}
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
                  Add to Print Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintingJobsPage;
