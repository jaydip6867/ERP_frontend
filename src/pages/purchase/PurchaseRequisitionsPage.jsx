import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { adminService } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const PurchaseRequisitionsPage = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    department: 'Production',
    priority: 'medium',
    warehouse_id: '',
    reason_for_request: 'min_reorder_level',
    items: [{ product_id: '', requested_qty: 10, estimated_rate: 0 }],
  });

  useEffect(() => {
    loadRequisitions(pagination.page);
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
          items: [{ product_id: prods[0]?._id || '', requested_qty: 10, estimated_rate: 0 }],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRequisitions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getRequisitions({ page, limit: 10 });
      setRequisitions(res.data?.requisitions || []);
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

  const handleApprove = async (id, approve) => {
    try {
      await purchaseService.approveRequisition(id, { approve });
      loadRequisitions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating approval');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await purchaseService.createRequisition(formData);
      setShowModal(false);
      loadRequisitions(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting PR');
    }
  };

  const columns = [
    {
      header: 'PR #',
      key: 'pr_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'pr_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Department',
      key: 'department',
      render: (d) => <span className="text-xs font-semibold text-slate-700">{d}</span>,
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            p === 'urgent'
              ? 'bg-rose-100 text-rose-800'
              : p === 'high'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {p}
        </span>
      ),
    },
    {
      header: 'Requested By',
      key: 'requested_by',
      render: (u) => <span className="text-xs text-slate-700">{u?.full_name || 'N/A'}</span>,
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
        title="Purchase Requisitions (PR)"
        subtitle="Manage shortage demands and internal requisition approvals before PO creation."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Requisitions' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Requisition
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={requisitions}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        actions={(row) => (
          <div className="flex items-center gap-2">
            {row.status === 'pending_approval' && (
              <>
                <button
                  onClick={() => handleApprove(row._id, true)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleApprove(row._id, false)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        )}
      />

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Purchase Requisition (PR)" size="md">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="Production">Production</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Warehouse">Warehouse Logistics</option>
                  <option value="General Admin">General Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse *</label>
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

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item & Quantity</label>
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
                  min="1"
                  value={formData.items[0]?.requested_qty}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[0].requested_qty = Number(e.target.value);
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="w-24 border border-slate-300 rounded-lg p-2 text-sm font-mono text-right"
                  required
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
                Submit Requisition
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseRequisitionsPage;
