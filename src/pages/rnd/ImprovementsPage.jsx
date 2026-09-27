import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const ImprovementsPage = () => {
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    issue_description: '',
    proposed_solution: '',
    impact_rating: 'High',
    status: 'reported',
  });

  useEffect(() => {
    loadImprovements();
  }, []);

  const loadImprovements = async () => {
    try {
      setLoading(true);
      const res = await rndService.getImprovements();
      setImprovements(res.data?.improvements || []);
    } catch (err) {
      toast.error('Failed to load product improvements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createImprovement(formData);
      toast.success('Product enhancement initiative logged');
      setShowModal(false);
      loadImprovements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record improvement');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Product Engineering Improvements (CIP / Kaizen)"
          subtitle="Continuous improvement projects, seam strength optimizations, fabric durability, and cost optimizations."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Improvements' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Propose Improvement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading improvement initiatives...</div>
        ) : improvements.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No continuous improvement initiatives logged yet.
          </div>
        ) : (
          improvements.map((imp) => (
            <div key={imp._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    imp.impact_rating === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {imp.impact_rating} Impact
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 capitalize">
                    {imp.status?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{imp.issue_description}</h3>
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Proposed Engineering Fix:</span>
                  <div className="mt-1">{imp.proposed_solution || 'Investigation in progress'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Propose Kaizen / CIP Improvement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Issue / Improvement Opportunity *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Button stitch loose on garment batch B4"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Proposed Solution</label>
                <textarea
                  rows="2"
                  value={formData.proposed_solution}
                  onChange={(e) => setFormData({ ...formData, proposed_solution: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Switch to reinforced lockstitch threading"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Impact Rating</label>
                <select
                  value={formData.impact_rating}
                  onChange={(e) => setFormData({ ...formData, impact_rating: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
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
                  Save Kaizen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovementsPage;
