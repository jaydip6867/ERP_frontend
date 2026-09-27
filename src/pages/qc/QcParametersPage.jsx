import React, { useState, useEffect } from 'react';
import { Sliders, Plus, CheckCircle2 } from 'lucide-react';
import { qcService } from '../../services/qc.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const QcParametersPage = () => {
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    param_name: '',
    category: 'dimensional',
    standard_value: '',
    min_tolerance: 0,
    max_tolerance: 0,
    unit_of_measure: 'mm',
  });

  useEffect(() => {
    loadParams();
  }, []);

  const loadParams = async () => {
    try {
      setLoading(true);
      const res = await qcService.getParameters();
      setParams(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await qcService.createParameter(formData);
      setShowModal(false);
      loadParams();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating parameter');
    }
  };

  const columns = [
    {
      header: 'Parameter Code',
      key: 'param_code',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Parameter Name',
      key: 'param_name',
      render: (val) => <span className="font-semibold text-slate-900">{val}</span>,
    },
    {
      header: 'Category',
      key: 'category',
      render: (cat) => <span className="capitalize text-xs font-medium text-slate-700">{cat}</span>,
    },
    {
      header: 'Standard Spec',
      key: 'standard_value',
      render: (val) => <span className="font-mono text-xs text-indigo-700 font-semibold">{val}</span>,
    },
    {
      header: 'Tolerance Range',
      key: 'min_tolerance',
      render: (min, row) => (
        <span className="font-mono text-xs text-slate-600">
          {min} - {row.max_tolerance} {row.unit_of_measure}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
          {st?.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Parameters Master"
        subtitle="Standard testing checkpoints, dimensional tolerances, and visual criteria."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quality Control', href: '/qc' },
          { label: 'Parameters' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Parameter
          </button>
        }
      />

      <DataTable columns={columns} data={params} loading={loading} />

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New QC Parameter" size="md">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parameter Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Outer Diameter, Tensile Strength"
                value={formData.param_name}
                onChange={(e) => setFormData({ ...formData, param_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="dimensional">Dimensional</option>
                  <option value="visual">Visual</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="chemical">Chemical</option>
                  <option value="electrical">Electrical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  placeholder="mm, bar, Ra"
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Target Value</label>
              <input
                type="text"
                placeholder="e.g. 50.00 mm"
                value={formData.standard_value}
                onChange={(e) => setFormData({ ...formData, standard_value: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Tolerance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_tolerance}
                  onChange={(e) => setFormData({ ...formData, min_tolerance: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Tolerance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_tolerance}
                  onChange={(e) => setFormData({ ...formData, max_tolerance: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Parameter
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default QcParametersPage;
