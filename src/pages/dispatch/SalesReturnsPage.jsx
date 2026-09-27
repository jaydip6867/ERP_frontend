import React, { useState, useEffect } from 'react';
import { RotateCcw, Plus, CheckCircle2, Eye } from 'lucide-react';
import { dispatchService } from '../../services/dispatch.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const SalesReturnsPage = () => {
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
      const res = await dispatchService.getReturns({ page, limit: 10 });
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

  const handleRestock = async (id) => {
    try {
      await dispatchService.restockReturn(id);
      loadReturns(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error restocking return');
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
      header: 'Customer',
      key: 'customer_id',
      render: (c) => <span className="font-semibold text-slate-900">{c?.display_name || c?.company_name}</span>,
    },
    {
      header: 'Return Type',
      key: 'return_type',
      render: (rt) => (
        <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {rt?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
    {
      header: 'Stock Restocked',
      key: 'stock_restocked',
      render: (sr) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            sr ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {sr ? 'RESTOCKED' : 'PENDING'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Returns & RTO"
        subtitle="Manage customer returns, transit damage, and Return-to-Origin shipments with restock integration."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders & Delivery', href: '/dispatch' },
          { label: 'Returns & RTO' },
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedReturn(row)}
              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
              title="View Return Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!row.stock_restocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestock(row._id);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Restock Items
              </button>
            )}
          </div>
        )}
      />

      {selectedReturn && (
        <Modal
          isOpen={!!selectedReturn}
          onClose={() => setSelectedReturn(null)}
          title={`Sales Return: ${selectedReturn.return_number || 'Details'}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Customer</span>
                <span className="font-semibold text-slate-900">{selectedReturn.customer_id?.display_name || selectedReturn.customer_id?.company_name || 'Customer'}</span>
                <p className="text-xs text-slate-500">{selectedReturn.customer_id?.email || selectedReturn.customer_id?.phone}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Return Type & Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedReturn.return_type?.replace('_', ' ')}
                  </span>
                  <StatusBadge status={selectedReturn.status} />
                </div>
              </div>
            </div>

            {selectedReturn.reason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-xs font-semibold text-amber-900 block mb-0.5">Return Reason / Notes:</span>
                <p className="text-xs text-amber-800">{selectedReturn.reason}</p>
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
                <span className="font-bold text-xs text-slate-700">Restock Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedReturn.stock_restocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {selectedReturn.stock_restocked ? 'RESTOCKED TO WAREHOUSE' : 'PENDING RESTOCK'}
                </span>
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

export default SalesReturnsPage;
