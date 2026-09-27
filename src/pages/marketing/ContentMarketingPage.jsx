import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Tag, CheckCircle } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const ContentMarketingPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    channel: 'BLOG',
    content_text: '',
    status: 'draft',
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getContent();
      setContent(res.data?.content || []);
    } catch (err) {
      toast.error('Failed to load content calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createContent(formData);
      toast.success('Content piece drafted successfully');
      setShowModal(false);
      loadContent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create content');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Content Marketing & Editorial Calendar"
          subtitle="B2B thought leadership articles, fashion trend blogs, buyer case studies, and email newsletters."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Content Marketing' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Article / Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading editorial calendar...</div>
        ) : content.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No articles or copy drafted yet.
          </div>
        ) : (
          content.map((c) => (
            <div key={c._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700">
                    {c.channel}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-emerald-50 text-emerald-700">
                    {c.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{c.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3">{c.content_text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Draft Content Piece</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Headline / Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. 2026 Textile Sustainability Trends"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="BLOG">Corporate Blog</option>
                  <option value="LINKEDIN">LinkedIn Article</option>
                  <option value="EMAIL">Email Newsletter</option>
                  <option value="PRINT">Trade Magazine</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Body Content *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.content_text}
                  onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
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
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentMarketingPage;
