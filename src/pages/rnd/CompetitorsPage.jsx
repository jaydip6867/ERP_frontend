import React, { useState, useEffect } from 'react';
import { Shield, Plus, Target, CheckCircle2, TrendingUp, Search } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CompetitorsPage = () => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    competitor_name: '',
    products_offered: '',
    price_positioning: 'Mid-market',
    market_share_estimate: '5-10%',
    strengths: '',
    weaknesses: '',
    strategies: '',
  });

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      setLoading(true);
      const res = await rndService.getCompetitors();
      setCompetitors(res.data?.competitors || []);
    } catch (err) {
      toast.error('Failed to load competitor records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createCompetitor({
        ...formData,
        products_offered: formData.products_offered ? formData.products_offered.split(',').map(s => s.trim()) : [],
      });
      toast.success('Competitor intelligence file created');
      setShowModal(false);
      loadCompetitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save competitor record');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Competitor Intelligence & Product Benchmarking"
          subtitle="Direct and indirect competitor profiles, price positioning, feature parity, and market vulnerabilities."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Competitors' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Competitor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading competitor dossiers...</div>
        ) : competitors.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No competitor records logged yet.
          </div>
        ) : (
          competitors.map((comp) => (
            <div key={comp._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                    {comp.price_positioning}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">Share: {comp.market_share_estimate}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{comp.competitor_name}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><b>Strengths:</b> {comp.strengths || 'N/A'}</div>
                  <div><b>Weaknesses:</b> {comp.weaknesses || 'N/A'}</div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {comp.products_offered?.map((p, idx) => (
                    <span key={idx} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                      {p}
                    </span>
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
            <h2 className="text-lg font-bold text-slate-900">Add Competitor Intelligence Dossier</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Competitor Name *</label>
                <input
                  required
                  type="text"
                  value={formData.competitor_name}
                  onChange={(e) => setFormData({ ...formData, competitor_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Acme Textiles Group"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Price Positioning</label>
                  <select
                    value={formData.price_positioning}
                    onChange={(e) => setFormData({ ...formData, price_positioning: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="Premium">Premium</option>
                    <option value="Mid-market">Mid-market</option>
                    <option value="Economy">Economy</option>
                    <option value="Budget">Budget</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Market Share Estimate</label>
                  <input
                    type="text"
                    value={formData.market_share_estimate}
                    onChange={(e) => setFormData({ ...formData, market_share_estimate: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. 15-20%"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Offered Product Lines (comma separated)</label>
                <input
                  type="text"
                  value={formData.products_offered}
                  onChange={(e) => setFormData({ ...formData, products_offered: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="Denims, Sportswear, Activewear"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Key Strengths</label>
                  <textarea
                    rows="2"
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Identified Vulnerabilities</label>
                  <textarea
                    rows="2"
                    value={formData.weaknesses}
                    onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
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
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorsPage;
