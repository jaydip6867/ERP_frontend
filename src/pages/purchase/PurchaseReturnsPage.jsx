import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, Eye, AlertCircle } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const PurchaseReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    loadReturns(pagination.page);
  }, [pagination.page]);

  const loadReturns = async (page = 1) => {
    try {
      setLoading(true);
      const res = await purchaseService.getReturns({ page, limit: 10 });
      setReturns(res.data?.returns || []);
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

  const columns = [
    {
      header: 'Return #',
      key: 'return_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Date',
      key: 'return_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Supplier',
      key: 'supplier_id',
      render: (s) => <span className="font-semibold text-slate-900">{s?.supplier_name || 'Vendor'}</span>,
    },
    {
      header: 'Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-600">{w?.warehouse_name || 'Central'}</span>,
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-bold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
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
        title="Purchase Returns & Rejections"
        subtitle="Manage materials returned to vendors with automatic stock deduction."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Returns' },
        ]}
      />

      <DataTable
        columns={columns}
        data={returns}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => setSelectedReturn(row)}
        actions={(row) => (
          <button
            onClick={() => setSelectedReturn(row)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="View Return Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {selectedReturn && (
        <Modal
          isOpen={!!selectedReturn}
          onClose={() => setSelectedReturn(null)}
          title={`Purchase Return: ${selectedReturn.return_number || 'Details'}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Supplier</span>
                <span className="font-semibold text-slate-900">{selectedReturn.supplier_id?.supplier_name || 'Vendor'}</span>
                <p className="text-xs text-slate-500">{selectedReturn.supplier_id?.email || selectedReturn.supplier_id?.phone}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Return Date & Status</span>
                <span className="font-medium text-slate-800 block">
                  {new Date(selectedReturn.return_date || Date.now()).toLocaleDateString('en-IN')}
                </span>
                <div className="mt-1"><StatusBadge status={selectedReturn.status} /></div>
              </div>
            </div>

            {selectedReturn.reason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-xs font-semibold text-rose-900 block mb-0.5">Return Reason:</span>
                <p className="text-xs text-rose-800">{selectedReturn.reason}</p>
              </div>
            )}

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Returned Line Items</div>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {selectedReturn.items && selectedReturn.items.length > 0 ? (
                  selectedReturn.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{item.product_id?.product_name || item.description || 'Product'}</p>
                        <p className="text-slate-500">Qty: {item.quantity} {item.unit || 'units'} @ ₹{item.unit_price?.toLocaleString('en-IN')}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-800">₹{(item.total || item.quantity * item.unit_price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-xs text-slate-400 italic">No line items recorded.</p>
                )}
              </div>
              <div className="p-3 bg-slate-50 flex justify-between items-center border-t border-slate-200">
                <span className="font-bold text-xs text-slate-700">Total Return Value:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">₹{Number(selectedReturn.grand_total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
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

export default PurchaseReturnsPage;
