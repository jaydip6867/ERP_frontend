import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, ExternalLink, Globe } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const MarketResearchPage = () => {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target_market: '',
    industry: 'Industrial & Consumer Goods',
    trends: '',
    findings: '',
  });

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    try {
      setLoading(true);
      const res = await rndService.getMarketResearch();
      setResearch(res.data?.marketResearch || []);
    } catch (err) {
      toast.error('Failed to load market research studies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createMarketResearch({
        ...formData,
        trends: formData.trends ? formData.trends.split(',').map(s => s.trim()) : [],
      });
      toast.success('Market research study published');
      setShowModal(false);
      loadResearch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish research');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Market Research & Industry Benchmarks"
          subtitle="Consumer demand trends, material breakthroughs, export opportunities, and category intelligence."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Market Research' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Publish Study
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading research database...</div>
        ) : research.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No research reports recorded yet.
          </div>
        ) : (
          research.map((item) => (
            <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {item.industry}
                  </span>
                  <span className="text-xs text-slate-400">{item.target_market}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.findings}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.trends?.map((t, idx) => (
                    <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                Published: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Publish Market Research Study</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Study Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Sustainable Organic Fabrics Market in EU"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Segment</label>
                  <input
                    type="text"
                    value={formData.target_market}
                    onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. Export B2B"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Identified Trends (comma separated)</label>
                  <input
                    type="text"
                    value={formData.trends}
                    onChange={(e) => setFormData({ ...formData, trends: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="Recycled yarns, Anti-microbial"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Key Research Findings & Insights</label>
                <textarea
                  rows="4"
                  required
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
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
                  Save Study
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketResearchPage;
