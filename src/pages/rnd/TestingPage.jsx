import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Plus, Activity, Award } from 'lucide-react';
import { rndService } from '../../services/rnd.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const TestingPage = () => {
  const [tests, setTests] = useState([]);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sample_id: '',
    test_name: '',
    test_type: 'Physical & Tensile Stress',
    expected_benchmark: '',
    actual_result: '',
    passed: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes] = await Promise.all([
        rndService.getTests(),
        rndService.getSamples(),
      ]);
      setTests(tRes.data?.tests || []);
      setSamples(sRes.data?.samples || []);
    } catch (err) {
      toast.error('Failed to load lab testing trials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rndService.createTest(formData);
      toast.success('Lab test report logged successfully');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record test');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Product Lab Testing & Quality Certification"
          subtitle="Tensile strength, color fastness, shrinkage tolerance, toxicity standards, and compliance audits."
          breadcrumbs={[{ label: 'R&D / NPD' }, { label: 'Product Testing' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Log Lab Test
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Sample Code</th>
                <th className="px-5 py-3">Test Name & Type</th>
                <th className="px-5 py-3">Expected Benchmark</th>
                <th className="px-5 py-3">Actual Measured</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3">Test Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading lab test trials...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No lab test logs found.</td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{t.sample_id?.sample_code || 'Sample'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{t.test_name}</div>
                      <div className="text-xs text-slate-400">{t.test_type}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{t.expected_benchmark || 'Standard'}</td>
                    <td className="px-5 py-3.5 text-xs font-mono font-semibold text-slate-800">{t.actual_result || 'Pass'}</td>
                    <td className="px-5 py-3.5">
                      {t.passed ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-50 text-rose-700">
                          <XCircle className="w-3.5 h-3.5" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {t.test_date ? new Date(t.test_date).toLocaleDateString() : 'Recent'}
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
            <h2 className="text-lg font-bold text-slate-900">Record Lab Trial / Test</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Prototype Sample *</label>
                <select
                  required
                  value={formData.sample_id}
                  onChange={(e) => setFormData({ ...formData, sample_id: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="">Select Lab Sample</option>
                  {samples.map(s => (
                    <option key={s._id} value={s._id}>{s.sample_code} ({s.version})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Test Name *</label>
                <input
                  required
                  type="text"
                  value={formData.test_name}
                  onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Abrasion & Tear Resistance"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Expected Benchmark</label>
                  <input
                    type="text"
                    value={formData.expected_benchmark}
                    onChange={(e) => setFormData({ ...formData, expected_benchmark: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="> 50,000 rubs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Actual Result</label>
                  <input
                    type="text"
                    value={formData.actual_result}
                    onChange={(e) => setFormData({ ...formData, actual_result: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="58,200 rubs"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={formData.passed}
                    onChange={(e) => setFormData({ ...formData, passed: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  Test Passed Quality Standards
                </label>
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
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingPage;
