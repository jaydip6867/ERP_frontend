import React, { useState, useEffect } from 'react';
import { Award, Plus, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const PerformancePage = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    review_period: 'Q3-2026',
    rating: 4,
    strengths: '',
    improvement_areas: '',
    comments: '',
    status: 'submitted',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, eRes] = await Promise.all([
        hrService.getPerformance(),
        hrService.getEmployees(),
      ]);
      setReviews(rRes.data?.reviews || []);
      setEmployees(eRes.data?.employees || []);
    } catch (err) {
      toast.error('Failed to load performance evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createPerformance(formData);
      toast.success('Performance review recorded successfully');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Performance Management & Appraisals"
          subtitle="Quarterly reviews, manager ratings, KPI evaluations, and career growth discussions."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Performance' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Conduct Review
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Review Period</th>
                <th className="px-5 py-3">Score / Rating</th>
                <th className="px-5 py-3">Key Strengths</th>
                <th className="px-5 py-3">Areas for Growth</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading appraisal history...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No appraisal records found.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {rev.employee_id?.full_name || 'Staff Member'}
                      <div className="text-xs text-slate-400 font-normal">{rev.employee_id?.employee_code}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{rev.review_period}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{rev.rating} / 5</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">{rev.strengths || '-'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">{rev.improvement_areas || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize bg-emerald-50 text-emerald-700">
                        {rev.status || 'completed'}
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
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Conduct Performance Appraisal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Employee *</label>
                  <select
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e._id} value={e._id}>{e.full_name} ({e.employee_code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Review Period *</label>
                  <input
                    type="text"
                    required
                    value={formData.review_period}
                    onChange={(e) => setFormData({ ...formData, review_period: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. Q3-2026"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Overall Rating (1 to 5) *</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 3 })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Key Strengths & Achievements</label>
                <textarea
                  rows="2"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Areas for Improvement</label>
                <textarea
                  rows="2"
                  value={formData.improvement_areas}
                  onChange={(e) => setFormData({ ...formData, improvement_areas: e.target.value })}
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
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
