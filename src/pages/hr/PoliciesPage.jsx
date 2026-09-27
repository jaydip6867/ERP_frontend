import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, BookOpen, ShieldCheck } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General Conduct',
    version: 'v1.0',
    content: '',
    status: 'active',
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await hrService.getPolicies();
      setPolicies(res.data?.policies || []);
    } catch (err) {
      toast.error('Failed to load corporate policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createPolicy(formData);
      toast.success('Policy handbook updated and published');
      setShowModal(false);
      loadPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish policy');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Corporate Policies & Compliance Handbook"
          subtitle="Official company guidelines, code of conduct, leave regulations, IT safety, and compliance documents."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Policies' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Publish Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading company policies...</div>
        ) : policies.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No policies published yet.
          </div>
        ) : (
          policies.map((pol) => (
            <div
              key={pol._id}
              onClick={() => setActivePolicy(pol)}
              className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {pol.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-indigo-600">{pol.version || 'v1.0'}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{pol.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3">{pol.content}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Effective: {pol.effective_date ? new Date(pol.effective_date).toLocaleDateString() : 'Active'}</span>
                <span className="text-indigo-600 font-medium hover:underline">Read Policy →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                  {activePolicy.category} • {activePolicy.version}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{activePolicy.title}</h2>
              </div>
              <button
                onClick={() => setActivePolicy(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-4">
              {activePolicy.content}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Publish New Policy Document</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Policy Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Code of Business Conduct & Ethics"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="General Conduct">General Conduct</option>
                    <option value="Leave & Attendance">Leave & Attendance</option>
                    <option value="Compensation & Benefits">Compensation & Benefits</option>
                    <option value="Workplace Safety">Workplace Safety</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="POSH">POSH</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Policy Body & Clauses *</label>
                <textarea
                  rows="6"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="Detailed guidelines, rules, conditions, and consequences..."
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
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliciesPage;
