import React, { useState, useEffect } from 'react';
import { Hash, Edit2, CheckCircle2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const NumberSeriesPage = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    suffix: '',
    padding_digits: 4,
    current_number: 0,
    include_year: true,
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getNumberSeries();
      const raw = res.data?.series ?? res.data?.numberSeries ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.series) ? raw.series : []);
      setSeries(list);
    } catch (err) {
      console.error('Failed to load number series:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load number series configurations');
    } finally {
      setLoading(false);
    }
  };

  const calculatePreview = ({
    prefix = '',
    include_year = true,
    padding_digits = 4,
    current_number = 0,
    suffix = '',
  }) => {
    const cleanPrefix = (prefix || '').replace(/[-_]+$/, '');
    const yearStr = include_year ? `${new Date().getFullYear()}-` : '';
    const numStr = (Number(current_number) + 1).toString().padStart(Number(padding_digits) || 4, '0');
    const cleanSuffix = (suffix || '').replace(/^[-_]+/, '');
    const suffixStr = cleanSuffix ? `-${cleanSuffix}` : '';
    return `${cleanPrefix}-${yearStr}${numStr}${suffixStr}`;
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || `${item.module} Series`,
      prefix: item.prefix || '',
      suffix: item.suffix || '',
      padding_digits: item.padding_digits !== undefined ? item.padding_digits : 4,
      current_number: item.current_number !== undefined ? item.current_number : 0,
      include_year: item.include_year !== undefined ? item.include_year : true,
      status: item.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setSaving(true);
      const targetId = editingItem._id || editingItem.id;
      await adminService.updateNumberSeries(targetId, formData);
      setIsModalOpen(false);
      setEditingItem(null);
      await loadSeries();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update number series');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Module Code',
      key: 'module',
      cellClassName: 'font-mono font-bold text-slate-800',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-xs font-bold">
            {row.module}
          </span>
        </div>
      ),
    },
    {
      header: 'Series Name',
      key: 'name',
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          {row.name || `${row.module} Auto Numbering`}
        </span>
      ),
    },
    {
      header: 'Prefix Format',
      key: 'prefix',
      cellClassName: 'font-mono text-indigo-600 font-semibold',
    },
    {
      header: 'Suffix',
      key: 'suffix',
      render: (val) => (
        <span className="font-mono text-xs text-slate-500">
          {val ? val : <span className="text-slate-300 italic">None</span>}
        </span>
      ),
    },
    {
      header: 'Padding',
      key: 'padding_digits',
      render: (val) => (
        <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
          {val || 4} digits
        </span>
      ),
    },
    {
      header: 'Include Year',
      key: 'include_year',
      render: (val) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            val ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {val ? 'Yes (YYYY)' : 'No'}
        </span>
      ),
    },
    {
      header: 'Current Value',
      key: 'current_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Next Code Preview',
      key: 'preview',
      render: (_, row) => {
        const preview = calculatePreview({
          prefix: row.prefix,
          include_year: row.include_year,
          padding_digits: row.padding_digits,
          current_number: row.current_number,
          suffix: row.suffix,
        });
        return (
          <span className="px-2.5 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800 border border-slate-200">
            {preview}
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            val === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${val === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {val === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Number Series & Autonumbering"
          subtitle="Configure automated sequential document identifiers for quotes, invoices, orders, products, and customers."
          breadcrumbs={[{ label: 'Administration' }, { label: 'Number Series' }]}
        />
        <div>
          <button
            onClick={loadSeries}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={loadSeries}
            className="text-xs font-semibold underline hover:no-underline text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={series}
        loading={loading}
        rowKey="_id"
        actions={(row) => (
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit Series"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Number Series: ${editingItem?.module}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Preview Box */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-slate-50 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Code Preview</span>
              </div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 tracking-wide">
                {calculatePreview(formData)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Sequence Start</span>
              <span className="font-mono text-xs font-semibold text-slate-700">
                #{Number(formData.current_number) + 1}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Series Description Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Sales Quotation Sequence"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prefix String *</label>
              <input
                type="text"
                required
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. QUO, INV, PRD"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Suffix (Optional)</label>
              <input
                type="text"
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. REV, A, 2026"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Digit Padding (1-8) *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.padding_digits}
                onChange={(e) => setFormData({ ...formData, padding_digits: Math.max(1, Math.min(8, Number(e.target.value))) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">e.g. 4 produces 0001</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Sequence Counter *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.current_number}
                onChange={(e) => setFormData({ ...formData, current_number: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Next item will be {Number(formData.current_number) + 1}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="include_year"
                checked={formData.include_year}
                onChange={(e) => setFormData({ ...formData, include_year: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="include_year" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Include Current Year ({new Date().getFullYear()})
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Series'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NumberSeriesPage;
