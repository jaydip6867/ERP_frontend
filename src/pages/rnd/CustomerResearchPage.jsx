import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageSquare, Tag, CheckCircle } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CustomerResearchPage = () => {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    research_topic: '',
    pain_points: '',
    feature_requests: '',
    willingness_to_pay: '',
  });

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    try {
      setLoading(true);
      const res = await rndService.getCustomerResearch();
      setResearch(res.data?.customerResearch || []);
    } catch (err) {
      toast.error('Failed to load customer research interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createCustomerResearch({
        ...formData,
        feature_requests: formData.feature_requests ? formData.feature_requests.split(',').map(s => s.trim()) : [],
      });
      toast.success('Customer interview notes saved');
      setShowModal(false);
      loadResearch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer research');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Customer Discovery & User Research"
          subtitle="Qualitative discovery interviews, unmet market needs, pricing sensitivity, and feature requests."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Customer Research' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Log Discovery Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading discovery logs...</div>
        ) : research.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No customer discovery interviews conducted yet.
          </div>
        ) : (
          research.map((item) => (
            <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                  {item.willingness_to_pay ? `WTP: ${item.willingness_to_pay}` : 'Discovery Study'}
                </span>
                <h3 className="font-semibold text-slate-900 text-base">{item.research_topic}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><b>Customer Pain Points:</b> {item.pain_points}</div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.feature_requests?.map((req, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      +{req}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                Date: {item.interview_date ? new Date(item.interview_date).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Log Discovery Interview</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Research Topic / Category *</label>
                <input
                  required
                  type="text"
                  value={formData.research_topic}
                  onChange={(e) => setFormData({ ...formData, research_topic: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Moisture-Wicking Fabrics for Sports Brands"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Identified Pain Points</label>
                <textarea
                  rows="2"
                  value={formData.pain_points}
                  onChange={(e) => setFormData({ ...formData, pain_points: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Feature Requests (comma separated)</label>
                <input
                  type="text"
                  value={formData.feature_requests}
                  onChange={(e) => setFormData({ ...formData, feature_requests: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="UV protection, 4-way stretch"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Price Expectation / Willingness to Pay</label>
                <input
                  type="text"
                  value={formData.willingness_to_pay}
                  onChange={(e) => setFormData({ ...formData, willingness_to_pay: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. ₹450-500 / meter"
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
                  Save Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerResearchPage;
