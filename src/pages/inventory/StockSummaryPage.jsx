import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Eye, ArrowUpDown, History } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { inventoryService } from '../../services/inventory.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { FilterBar } from '../../components/shell/FilterBar';

export const StockSummaryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState('');

  useEffect(() => {
    loadSummary(pagination.page);
  }, [pagination.page, search, lowStockFilter]);

  const loadSummary = async (page = 1) => {
    try {
      setLoading(true);
      const res = await inventoryService.getStockSummary({
        page,
        limit: 10,
        search,
        low_stock: lowStockFilter || undefined,
      });
      setItems(res.data?.items || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load stock summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Product Details',
      key: 'product_name',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <p className="text-xs font-mono text-slate-500">
            {row.product_code} &bull; SKU: {row.sku}
          </p>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category_id',
      render: (cat) => <span className="text-xs text-slate-600">{cat?.category_name || 'General'}</span>,
    },
    {
      header: 'Physical Stock',
      key: 'current_stock',
      cellClassName: 'font-mono font-bold text-slate-900',
      render: (val, row) => `${val} ${row.uom_id?.abbreviation || ''}`,
    },
    {
      header: 'Reserved',
      key: 'reserved_stock',
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
          {val || 0}
        </span>
      ),
    },
    {
      header: 'Available for Sale',
      key: 'available_stock',
      cellClassName: 'font-mono font-bold text-emerald-700',
      render: (val, row) => `${val || 0} ${row.uom_id?.abbreviation || ''}`,
    },
    {
      header: 'Reorder Level',
      key: 'reorder_level',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span>{val}</span>
          {row.is_low_stock && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
              <AlertTriangle className="w-3 h-3" /> Low
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Summary"
        subtitle="Current physical balances and sales allocations calculated atomically from the Stock Ledger."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Stock Summary' },
        ]}
        actions={
          <Link
            to="/inventory/ledger"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <History className="w-4 h-4" />
            Audit Ledger
          </Link>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product, code, SKU..."
        filters={[
          {
            label: 'Stock Level',
            value: lowStockFilter,
            onChange: setLowStockFilter,
            options: [
              { label: 'All Items', value: '' },
              { label: 'Low Stock Only', value: 'true' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        actions={(row) => (
          <button
            onClick={() => navigate(`/inventory/ledger?product_id=${row._id}`)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
            title="View Product Ledger"
          >
            <History className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};

export default StockSummaryPage;
