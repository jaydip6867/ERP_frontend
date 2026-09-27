import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, CheckCircle2, XCircle, RotateCcw, AlertOctagon, Filter, Eye } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { qcService } from '../../services/qc.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';

export const QcInspectionsListPage = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    inspection_type: 'incoming',
    source_document_type: 'GRN',
    source_document_no: '',
    source_document_id: '674488291029182910293817', // mock fallback ID
    product_id: '',
    batch_no: '',
    sample_size: 5,
    total_qty: 100,
    accepted_qty: 100,
    rejected_qty: 0,
    rework_qty: 0,
    outcome: 'PASS',
    remarks: 'Complies with specification checklist',
    results: [
      { parameter_name: 'Dimension Check', standard_spec: '50mm +/- 0.15', observed_value: '50.02mm', result: 'PASS' },
    ],
  });

  useEffect(() => {
    loadInspections(pagination.page);
    loadProducts();
  }, [pagination.page, typeFilter, outcomeFilter]);

  const loadProducts = async () => {
    try {
      const res = await productService.getProducts({ limit: 100 });
      const prods = res.data?.products || res.data || [];
      setProducts(prods);
      if (prods.length > 0) {
        setFormData((prev) => ({ ...prev, product_id: prods[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadInspections = async (page = 1) => {
    try {
      setLoading(true);
      const res = await qcService.getInspections({
        page,
        limit: 10,
        inspection_type: typeFilter || undefined,
        outcome: outcomeFilter || undefined,
      });
      setInspections(res.data?.inspections || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await qcService.createInspection(formData);
      setShowModal(false);
      loadInspections(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording inspection');
    }
  };

  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case 'PASS':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">PASS</span>;
      case 'FAIL':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">FAIL</span>;
      case 'REWORK':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">REWORK</span>;
      case 'SCRAP':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-900">SCRAP</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">{outcome}</span>;
    }
  };

  const columns = [
    {
      header: 'QC #',
      key: 'inspection_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Gate Type',
      key: 'inspection_type',
      render: (t) => <span className="capitalize text-xs font-semibold text-slate-700">{t?.replace('_', ' ')}</span>,
    },
    {
      header: 'Source Doc',
      key: 'source_document_no',
      render: (sdn, row) => (
        <span className="font-mono text-xs text-indigo-700 font-medium">
          {row.source_document_type}: {sdn || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Product',
      key: 'product_id',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900">{p?.product_name || 'N/A'}</p>
          <p className="text-xs font-mono text-slate-500">{p?.product_code}</p>
        </div>
      ),
    },
    {
      header: 'Sample / Total',
      key: 'sample_size',
      render: (sz, row) => (
        <span className="font-mono text-xs">
          {sz} / {row.total_qty} units
        </span>
      ),
    },
    {
      header: 'Accepted / Rejected',
      key: 'accepted_qty',
      render: (acc, row) => (
        <span className="font-mono text-xs">
          <span className="text-emerald-700 font-bold">{acc || 0}</span> /{' '}
          <span className="text-rose-600 font-bold">{row.rejected_qty || 0}</span>
        </span>
      ),
    },
    {
      header: 'Outcome',
      key: 'outcome',
      render: (oc) => getOutcomeBadge(oc),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="QC Inspection Register"
        subtitle="Full audit trail of quality inspections across incoming receipts, in-process jobs, and final goods."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quality Control', href: '/qc' },
          { label: 'Inspections' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Inspection
          </button>
        }
      />

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Filter inspections..."
        filters={[
          {
            label: 'Inspection Gate',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Gates', value: '' },
              { label: 'Incoming QC', value: 'incoming' },
              { label: 'In-Process QC', value: 'in_process' },
              { label: 'Final QC', value: 'final' },
              { label: 'Dispatch QC', value: 'dispatch' },
            ],
          },
          {
            label: 'Outcome',
            value: outcomeFilter,
            onChange: setOutcomeFilter,
            options: [
              { label: 'All Outcomes', value: '' },
              { label: 'PASS', value: 'PASS' },
              { label: 'FAIL', value: 'FAIL' },
              { label: 'REWORK', value: 'REWORK' },
              { label: 'SCRAP', value: 'SCRAP' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={inspections}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => setSelectedInspection(row)}
        actions={(row) => (
          <button
            onClick={() => setSelectedInspection(row)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Quality Inspection" size="md">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Gate *</label>
                <select
                  value={formData.inspection_type}
                  onChange={(e) => setFormData({ ...formData, inspection_type: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="incoming">Incoming QC (GRN)</option>
                  <option value="in_process">In-Process QC (Work Order)</option>
                  <option value="final">Final QC (Finished Goods)</option>
                  <option value="dispatch">Dispatch QC (Shipment)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outcome *</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-bold"
                >
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                  <option value="REWORK">REWORK</option>
                  <option value="SCRAP">SCRAP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product *</label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.product_name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Doc # (e.g. GRN / WO)</label>
                <input
                  type="text"
                  placeholder="e.g. GRN-2026-00001"
                  value={formData.source_document_no}
                  onChange={(e) => setFormData({ ...formData, source_document_no: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Lot Number</label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-001"
                  value={formData.batch_no}
                  onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sample Size</label>
                <input
                  type="number"
                  min="1"
                  value={formData.sample_size}
                  onChange={(e) => setFormData({ ...formData, sample_size: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accepted Qty</label>
                <input
                  type="number"
                  min="0"
                  value={formData.accepted_qty}
                  onChange={(e) => setFormData({ ...formData, accepted_qty: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejected / Rework</label>
                <input
                  type="number"
                  min="0"
                  value={formData.rejected_qty}
                  onChange={(e) => setFormData({ ...formData, rejected_qty: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows="2"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
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
                Save Inspection
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedInspection && (
        <Modal
          isOpen={!!selectedInspection}
          onClose={() => setSelectedInspection(null)}
          title={`Quality Inspection Details: ${selectedInspection.inspection_number || 'QC'}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Inspection Gate</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {selectedInspection.inspection_type?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Source Document</span>
                <span className="font-mono font-semibold text-indigo-700">
                  {selectedInspection.source_document_type}: {selectedInspection.source_document_no || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Inspection Date</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedInspection.created_at || selectedInspection.createdAt || Date.now()).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Outcome</span>
                {getOutcomeBadge(selectedInspection.outcome)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-lg p-3">
              <div>
                <span className="text-xs text-slate-500">Inspected Product</span>
                <p className="font-semibold text-slate-900">{selectedInspection.product_id?.product_name || 'N/A'}</p>
                <p className="text-xs font-mono text-slate-500">{selectedInspection.product_id?.product_code || ''}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Batch / Lot Number</span>
                <p className="font-mono font-semibold text-slate-800">{selectedInspection.batch_no || 'Standard Run'}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg text-center">
              <div>
                <span className="text-xs text-slate-500 block">Total Qty</span>
                <span className="font-mono font-bold text-slate-800">{selectedInspection.total_qty || 0}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Sample Checked</span>
                <span className="font-mono font-bold text-indigo-600">{selectedInspection.sample_size || 0}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Accepted</span>
                <span className="font-mono font-bold text-emerald-600">{selectedInspection.accepted_qty || 0}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Rejected</span>
                <span className="font-mono font-bold text-rose-600">{selectedInspection.rejected_qty || 0}</span>
              </div>
            </div>

            {selectedInspection.remarks && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xs font-semibold text-amber-900 block mb-1">Quality Inspector Remarks:</span>
                <p className="text-xs text-amber-800 whitespace-pre-wrap">{selectedInspection.remarks}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QcInspectionsListPage;
