import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { adminService } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const StockTransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    vehicle_no: '',
    driver_name: '',
    items: [{ product_id: '', transfer_qty: 1, batch_number: '' }],
  });

  useEffect(() => {
    loadTransfers(pagination.page);
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
      if (whs.length >= 2) {
        setFormData((prev) => ({
          ...prev,
          from_warehouse_id: whs[0]._id,
          to_warehouse_id: whs[1]._id,
          items: [{ product_id: prods[0]?._id || '', transfer_qty: 1, batch_number: '' }],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransfers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await inventoryService.getTransfers({ page, limit: 10 });
      setTransfers(res.data?.transfers || []);
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

  const handleComplete = async (id) => {
    try {
      await inventoryService.completeTransfer(id);
      loadTransfers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing transfer');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      alert('Source and destination warehouses must be different');
      return;
    }

    try {
      await inventoryService.createTransfer(formData);
      setShowCreateModal(false);
      loadTransfers(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating transfer');
    }
  };

  const columns = [
    {
      header: 'Transfer #',
      key: 'transfer_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'transfer_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'From Warehouse',
      key: 'from_warehouse_id',
      render: (w) => <span className="font-semibold text-slate-800">{w?.warehouse_name}</span>,
    },
    {
      header: 'To Warehouse',
      key: 'to_warehouse_id',
      render: (w) => <span className="font-semibold text-indigo-700">{w?.warehouse_name}</span>,
    },
    {
      header: 'Items',
      key: 'items',
      render: (items) => (
        <span className="text-xs text-slate-600 font-medium">
          {items?.length || 0} item lines
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
        title="Stock Transfers"
        subtitle="Manage inter-warehouse inventory shipments and receiving."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Transfers' },
        ]}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Transfer
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={transfers}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        actions={(row) => (
          <div className="flex items-center gap-2">
            {row.status !== 'completed' && (
              <button
                onClick={() => handleComplete(row._id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Receive & Post
              </button>
            )}
          </div>
        )}
      />

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Inter-Warehouse Stock Transfer"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">From Warehouse *</label>
                <select
                  value={formData.from_warehouse_id}
                  onChange={(e) => setFormData({ ...formData, from_warehouse_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  required
                >
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>{w.warehouse_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To Warehouse *</label>
                <select
                  value={formData.to_warehouse_id}
                  onChange={(e) => setFormData({ ...formData, to_warehouse_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  required
                >
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>{w.warehouse_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle No</label>
                <input
                  type="text"
                  placeholder="e.g. GJ-05-AB-1234"
                  value={formData.vehicle_no}
                  onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  placeholder="Driver name"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product & Quantity</label>
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
                  value={formData.items[0]?.transfer_qty}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[0].transfer_qty = Number(e.target.value);
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
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StockTransfersPage;
