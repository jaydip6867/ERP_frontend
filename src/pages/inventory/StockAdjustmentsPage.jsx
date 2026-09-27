import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { adminService } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const StockAdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    warehouse_id: '',
    reason_code: 'PHYSICAL_COUNT',
    remarks: '',
    items: [{ product_id: '', adjusted_qty: 0, reason: '' }],
  });

  useEffect(() => {
    loadAdjustments(pagination.page);
    loadPrerequisites();
  }, [pagination.page]);

  const loadPrerequisites = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        adminService.getWarehouses(),
        productService.getProducts({ limit: 100 }),
      ]);
      const whs = whRes.data || [];
      const prods = prodRes.data?.products || prodRes.data || [];
      setWarehouses(whs);
      setProducts(prods);
      if (whs.length > 0) {
        setFormData((prev) => ({
          ...prev,
          warehouse_id: whs[0]._id,
          items: [{ product_id: prods[0]?._id || '', adjusted_qty: 0, reason: '' }],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdjustments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await inventoryService.getAdjustments({ page, limit: 10 });
      setAdjustments(res.data?.adjustments || []);
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

  const handleApprove = async (id) => {
    try {
      await inventoryService.approveAdjustment(id);
      loadAdjustments(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving adjustment');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createAdjustment(formData);
      setShowModal(false);
      loadAdjustments(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating adjustment');
    }
  };

  const columns = [
    {
      header: 'Adjustment #',
      key: 'adjustment_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'adjustment_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="font-semibold text-slate-800">{w?.warehouse_name}</span>,
    },
    {
      header: 'Reason',
      key: 'reason_code',
      render: (rc) => <span className="text-xs font-mono font-medium text-slate-700">{rc}</span>,
    },
    {
      header: 'Items',
      key: 'items',
      render: (items) => (
        <span className="text-xs text-slate-600 font-medium">{items?.length || 0} items adjusted</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        subtitle="Write-offs, count discrepancy corrections, and approved inventory modifications."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Adjustments' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={adjustments}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        actions={(row) => (
          <div className="flex items-center gap-2">
            {row.status === 'draft' && (
              <button
                onClick={() => handleApprove(row._id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve & Post
              </button>
            )}
          </div>
        )}
      />

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Stock Adjustment Memo"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason Code *</label>
              <select
                value={formData.reason_code}
                onChange={(e) => setFormData({ ...formData, reason_code: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              >
                <option value="PHYSICAL_COUNT">Physical Count Discrepancy</option>
                <option value="DAMAGE">Damaged / Broken in Transit</option>
                <option value="EXPIRY">Expired Shelf Life</option>
                <option value="FOUND_STOCK">Found Extra Unrecorded Stock</option>
                <option value="SCRAP">Manufacturing Scrap Rejection</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product & Adjustment Qty (+ for addition, - for deduction)
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.items[0]?.product_id}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[0].product_id = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="flex-1 border border-slate-300 rounded-lg p-2 text-sm"
                  required
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.product_name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="e.g. -5 or 10"
                  value={formData.items[0]?.adjusted_qty}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[0].adjusted_qty = Number(e.target.value);
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="w-28 border border-slate-300 rounded-lg p-2 text-sm font-mono text-right"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows="2"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Reason details for auditing..."
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
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
                Submit Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StockAdjustmentsPage;
