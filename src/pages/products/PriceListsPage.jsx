import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const PriceListsPage = () => {
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    loadPriceLists();
  }, []);

  const loadPriceLists = async () => {
    try {
      setLoading(true);
      const res = await productService.getPriceLists();
      setPriceLists(res.data || []);
      if (res.data?.length > 0 && !selectedList) {
        setSelectedList(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load price lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Code', key: 'price_list_code', cellClassName: 'font-mono font-bold text-slate-800' },
    {
      header: 'Price List Name',
      key: 'price_list_name',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{val}</span>
          {row.is_default && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              Default
            </span>
          )}
        </div>
      ),
    },
    { header: 'Type', key: 'type', render: (val) => <span className="capitalize">{val}</span> },
    { header: 'Currency', key: 'currency' },
    { header: 'Items Count', key: 'items', render: (val) => `${val?.length || 0} Products` },
    { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Price Lists & Tiered Pricing"
        subtitle="Manage custom price catalogs, distributor matrices, dealer discounts, and customer-specific rate sheets."
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Price Lists' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={priceLists}
            loading={loading}
            onRowClick={(row) => setSelectedList(row)}
          />
        </div>

        {/* Selected Price List Items Inspector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 h-fit">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            {selectedList ? selectedList.price_list_name : 'Price List Details'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {selectedList ? `Code: ${selectedList.price_list_code} • Type: ${selectedList.type}` : 'Select a price list to inspect item tiers'}
          </p>

          {selectedList?.items?.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {selectedList.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {item.product_id?.product_name || 'Product'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      Min Qty: {item.min_quantity} | Discount: {item.discount_percent}%
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">₹{item.rate?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              No product items configured in this price list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PriceListsPage;
