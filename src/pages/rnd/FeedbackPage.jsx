import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Star, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const FeedbackPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    source: 'customer_interview',
    sentiment: 'positive',
    summary: '',
    action_items: '',
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await rndService.getFeedback();
      setFeedback(res.data?.feedback || []);
    } catch (err) {
      toast.error('Failed to load feedback records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createFeedback({
        ...formData,
        action_items: formData.action_items ? formData.action_items.split(',').map(s => s.trim()) : [],
      });
      toast.success('Feedback intelligence recorded');
      setShowModal(false);
      loadFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Product Feedback & Voice-of-Customer (VoC)"
          subtitle="Customer sentiment, Net Promoter Score verbatim, sales objections, and product engineering action items."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'VoC Feedback' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Log Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading feedback stream...</div>
        ) : feedback.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No feedback entries logged yet.
          </div>
        ) : (
          feedback.map((f) => (
            <div key={f._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-slate-100 text-slate-700">
                    {f.source?.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${
                    f.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700' :
                    f.sentiment === 'negative' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {f.sentiment}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{f.summary}</h3>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-700">Action Items:</div>
                  {f.action_items?.map((act, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Record VoC Feedback</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Feedback Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="customer_interview">Customer Interview</option>
                    <option value="nps_survey">NPS Survey</option>
                    <option value="sales_feedback">Sales Team Feedback</option>
                    <option value="support_ticket">Support Ticket</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Sentiment</label>
                  <select
                    value={formData.sentiment}
                    onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Feedback Verbatim / Summary *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Action Items (comma separated)</label>
                <input
                  type="text"
                  value={formData.action_items}
                  onChange={(e) => setFormData({ ...formData, action_items: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="Update spec sheet, send replacement swatch"
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
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
