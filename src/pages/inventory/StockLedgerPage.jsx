import React, { useState, useEffect } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, Filter, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { inventoryService } from '../../services/inventory.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { FilterBar } from '../../components/shell/FilterBar';

export const StockLedgerPage = () => {
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('product_id') || '';

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadLedger(pagination.page);
  }, [pagination.page, typeFilter, initialProductId]);

  const loadLedger = async (page = 1) => {
    try {
      setLoading(true);
      const res = await inventoryService.getStockLedger({
        page,
        limit: 15,
        transaction_type: typeFilter || undefined,
        product_id: initialProductId || undefined,
      });
      const ledgerEntries = Array.isArray(res.data) ? res.data : (res.data?.entries || []);
      setEntries(ledgerEntries);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load stock ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionBadge = (type) => {
    const isAdd = ['GRN', 'PRODUCTION_RECEIPT', 'RETURN', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'OPENING_STOCK'].includes(type);
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
          isAdd ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}
      >
        {isAdd ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
        {type}
      </span>
    );
  };

  const columns = [
    {
      header: 'Date & Time',
      key: 'transaction_date',
      render: (dt) => (dt ? new Date(dt).toLocaleString('en-IN') : '—'),
    },
    {
      header: 'Type',
      key: 'transaction_type',
      render: (t) => getTransactionBadge(t),
    },
    {
      header: 'Product',
      key: 'product_id',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900">{p?.product_name || 'N/A'}</p>
          <p className="text-xs font-mono text-slate-500">{p?.product_code || ''}</p>
        </div>
      ),
    },
    {
      header: 'Warehouse',
      key: 'warehouse_id',
      render: (w) => <span className="text-xs text-slate-600">{w?.warehouse_name || 'Central'}</span>,
    },
    {
      header: 'Batch #',
      key: 'batch_number',
      render: (bn) => (bn ? <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{bn}</span> : '-'),
    },
    {
      header: 'In (+)',
      key: 'qty_in',
      cellClassName: 'font-mono text-xs font-bold text-emerald-700 text-right',
      render: (val) => (val > 0 ? `+${val}` : '-'),
    },
    {
      header: 'Out (-)',
      key: 'qty_out',
      cellClassName: 'font-mono text-xs font-bold text-rose-700 text-right',
      render: (val) => (val > 0 ? `-${val}` : '-'),
    },
    {
      header: 'Balance',
      key: 'balance_qty',
      cellClassName: 'font-mono text-xs font-bold text-slate-900 text-right',
      render: (val) => val,
    },
    {
      header: 'Reference',
      key: 'reference_no',
      render: (refNo, row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold" title={row.reference_type}>
          {refNo}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Ledger (Source of Truth)"
        subtitle="Immutable ledger of all inventory transactions. Current balances are computed exclusively through ledger entries."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Ledger' },
        ]}
      />

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Filter transactions..."
        filters={[
          {
            label: 'Transaction Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Transactions', value: '' },
              { label: 'GRN (+)', value: 'GRN' },
              { label: 'Production Receipt (+)', value: 'PRODUCTION_RECEIPT' },
              { label: 'Material Issue (-)', value: 'MATERIAL_ISSUE' },
              { label: 'Dispatch (-)', value: 'DISPATCH' },
              { label: 'Return (+)', value: 'RETURN' },
              { label: 'Adjustment (+/-)', value: 'ADJUSTMENT_IN' },
              { label: 'Transfer', value: 'TRANSFER_IN' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />
    </div>
  );
};

export default StockLedgerPage;
