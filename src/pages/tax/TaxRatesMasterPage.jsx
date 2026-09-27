import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  X
} from 'lucide-react';
import { taxService } from '../../services/tax.service';

export const TaxRatesMasterPage = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    tax_name: '',
    tax_code: '',
    total_rate: 18,
    cgst_rate: 9,
    sgst_rate: 9,
    igst_rate: 18,
    cess_rate: 0,
    is_default: false,
    description: '',
  });

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await taxService.getTaxRates();
      setRates(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load tax rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleTotalRateChange = (val) => {
    const rate = parseFloat(val) || 0;
    setFormData((prev) => ({
      ...prev,
      total_rate: rate,
      cgst_rate: rate / 2,
      sgst_rate: rate / 2,
      igst_rate: rate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      await taxService.createTaxRate(formData);
      setShowModal(false);
      setFormData({
        tax_name: '',
        tax_code: '',
        total_rate: 18,
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 18,
        cess_rate: 0,
        is_default: false,
        description: '',
      });
      fetchRates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tax rate');
    } finally {
      setSaving(false);
    }
  };

  const filteredRates = rates.filter(
    (r) =>
      r.tax_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.tax_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tax Rates Master</h1>
              <p className="text-sm text-gray-500">Configure GST tax slabs, CGST/SGST intra-state split & IGST inter-state rates</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRates}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Tax Rate
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tax name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tax Rates Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <th className="p-4">Tax Name / Code</th>
                <th className="p-4 text-right">Total GST Rate</th>
                <th className="p-4 text-right">CGST %</th>
                <th className="p-4 text-right">SGST %</th>
                <th className="p-4 text-right">IGST %</th>
                <th className="p-4 text-right">CESS %</th>
                <th className="p-4 text-center">Default</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">Loading tax rates...</td>
                </tr>
              ) : filteredRates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">No tax rates defined.</td>
                </tr>
              ) : (
                filteredRates.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{r.tax_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{r.tax_code}</div>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900 font-mono text-base">
                      {r.total_rate}%
                    </td>
                    <td className="p-4 text-right text-blue-600 font-mono font-medium">
                      {r.cgst_rate}%
                    </td>
                    <td className="p-4 text-right text-purple-600 font-mono font-medium">
                      {r.sgst_rate}%
                    </td>
                    <td className="p-4 text-right text-amber-600 font-mono font-medium">
                      {r.igst_rate}%
                    </td>
                    <td className="p-4 text-right text-gray-500 font-mono">
                      {r.cess_rate || 0}%
                    </td>
                    <td className="p-4 text-center">
                      {r.is_default ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        r.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tax Rate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Tax Rate</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tax Slab Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST 18%"
                  value={formData.tax_name}
                  onChange={(e) => setFormData({ ...formData, tax_name: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tax Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST_18"
                  value={formData.tax_code}
                  onChange={(e) => setFormData({ ...formData, tax_code: e.target.value.toUpperCase() })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Total Rate (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.total_rate}
                  onChange={(e) => handleTotalRateChange(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CGST %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cgst_rate}
                    onChange={(e) => setFormData({ ...formData, cgst_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">SGST %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sgst_rate}
                    onChange={(e) => setFormData({ ...formData, sgst_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">IGST %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.igst_rate}
                    onChange={(e) => setFormData({ ...formData, igst_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Cess % (Optional)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.cess_rate}
                  onChange={(e) => setFormData({ ...formData, cess_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_default" className="text-sm text-gray-700 font-medium cursor-pointer">
                  Set as default GST tax rate
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxRatesMasterPage;
