import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, Star, ArrowUpRight, TrendingUp } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    problem_statement: '',
    estimated_market_size: 1000000,
    expected_roi: 25,
    feasibility_score: 8,
    priority: 'high',
    status: 'idea',
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const res = await rndService.getOpportunities();
      setOpportunities(res.data?.opportunities || []);
    } catch (err) {
      toast.error('Failed to load innovation opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createOpportunity(formData);
      toast.success('Opportunity logged in pipeline');
      setShowModal(false);
      loadOpportunities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create opportunity');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="R&D Opportunity Assessment Pipeline"
          subtitle="Score feasibility, project ROI, validate market sizing, and transition ideas to active NPD projects."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Opportunities' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Propose Innovation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading opportunity radar...</div>
        ) : opportunities.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No opportunities logged yet.
          </div>
        ) : (
          opportunities.map((opp) => (
            <div key={opp._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    opp.priority === 'critical' ? 'bg-rose-50 text-rose-700' :
                    opp.priority === 'high' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {opp.priority} Priority
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 capitalize">
                    {opp.status?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{opp.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{opp.problem_statement}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div>Feasibility: <b>{opp.feasibility_score}/10</b></div>
                  <div>Exp. ROI: <b>{opp.expected_roi}%</b></div>
                  <div className="col-span-2">Market Size: <b>₹{(opp.estimated_market_size || 0).toLocaleString('en-IN')}</b></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Propose R&D Opportunity</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Opportunity Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. High-Tenacity Technical Yarn"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Problem Statement & Value Proposition *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Feasibility Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.feasibility_score}
                    onChange={(e) => setFormData({ ...formData, feasibility_score: parseInt(e.target.value) || 7 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Expected ROI (%)</label>
                  <input
                    type="number"
                    value={formData.expected_roi}
                    onChange={(e) => setFormData({ ...formData, expected_roi: parseFloat(e.target.value) || 20 })}
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
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
