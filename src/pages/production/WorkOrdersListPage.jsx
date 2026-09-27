import React, { useState, useEffect } from 'react';
import { Hammer, Plus, Eye, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productionService } from '../../services/production.service';
import { productService } from '../../services/product.service';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const WorkOrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [boms, setBoms] = useState([]);

  const [formData, setFormData] = useState({
    product_id: '',
    bom_id: '',
    warehouse_id: '',
    raw_material_warehouse_id: '',
    planned_qty: 10,
    priority: 'medium',
  });

  useEffect(() => {
    loadOrders(pagination.page);
    loadPrerequisites();
  }, [pagination.page]);

  const loadPrerequisites = async () => {
    try {
      const [prodRes, whRes, bomRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        adminService.getWarehouses(),
        productService.getBoms({ limit: 100 }),
      ]);

      const prods = (prodRes.data?.products || prodRes.data || []).filter(
        (p) => p.product_type === 'finished_good' || p.product_type === 'semi_finished'
      );
      const whs = whRes.data || [];
      const bList = bomRes.data || [];

      setProducts(prods);
      setWarehouses(whs);
      setBoms(bList);

      if (prods.length > 0 && whs.length > 0 && bList.length > 0) {
        setFormData({
          product_id: prods[0]._id,
          bom_id: bList[0]._id,
          warehouse_id: whs[0]._id,
          raw_material_warehouse_id: whs[0]._id,
          planned_qty: 10,
          priority: 'medium',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await productionService.getWorkOrders({ page, limit: 10 });
      setOrders(res.data?.orders || []);
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
      await productionService.createWorkOrder(formData);
      setShowModal(false);
      loadOrders(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating work order');
    }
  };

  const columns = [
    {
      header: 'WO #',
      key: 'wo_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'wo_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Finished Product',
      key: 'product_id',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900">{p?.product_name || 'N/A'}</p>
          <p className="text-xs font-mono text-slate-500">{p?.product_code}</p>
        </div>
      ),
    },
    {
      header: 'BOM Version',
      key: 'bom_id',
      render: (b) => <span className="font-mono text-xs text-indigo-700">{b?.bom_number} (v{b?.version || '1.0'})</span>,
    },
    {
      header: 'Planned',
      key: 'planned_qty',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Produced',
      key: 'produced_qty',
      render: (val, row) => (
        <span className="font-mono font-bold text-emerald-700">
          {val || 0} / {row.planned_qty}
        </span>
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
        title="Work Orders (Shop Floor)"
        subtitle="Manage manufacturing jobs, BOM explosion, material checks, and progress."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production', href: '/production' },
          { label: 'Work Orders' },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Work Order
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => navigate(`/production/work-orders/${row._id}`)}
        actions={(row) => (
          <button
            onClick={() => navigate(`/production/work-orders/${row._id}`)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Manufacturing Work Order" size="md">
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Finished Product *</label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.product_name} ({p.product_code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bill of Materials (BOM) *</label>
              <select
                value={formData.bom_id}
                onChange={(e) => setFormData({ ...formData, bom_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              >
                {boms.map((b) => (
                  <option key={b._id} value={b._id}>{b.bom_name} ({b.bom_number})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.planned_qty}
                  onChange={(e) => setFormData({ ...formData, planned_qty: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono"
                  required
                />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination FG Warehouse</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Raw Material Source</label>
                <select
                  value={formData.raw_material_warehouse_id}
                  onChange={(e) => setFormData({ ...formData, raw_material_warehouse_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  required
                >
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>{w.warehouse_name}</option>
                  ))}
                </select>
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
                Create Work Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default WorkOrdersListPage;
