import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Calculator, CheckCircle2 } from 'lucide-react';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';

export const BomPage = () => {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBom, setSelectedBom] = useState(null);

  useEffect(() => {
    loadBoms();
  }, []);

  const loadBoms = async () => {
    try {
      setLoading(true);
      const res = await productService.getBoms();
      setBoms(res.data || []);
      if (res.data?.length > 0 && !selectedBom) {
        setSelectedBom(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load BOMs:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'BOM Number', key: 'bom_number', cellClassName: 'font-mono font-bold text-slate-800' },
    {
      header: 'Finished Product',
      key: 'product_id',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val?.product_name || '—'}</span>
          <span className="text-xs text-slate-400 font-mono">{val?.product_code} • {row.bom_name}</span>
        </div>
      ),
    },
    { header: 'Revision', key: 'revision', cellClassName: 'font-mono' },
    { header: 'Batch Size', key: 'batch_size', render: (val, row) => `${val} ${row.uom_id?.uom_code || 'Units'}` },
    {
      header: 'Est. Total Cost',
      key: 'total_estimated_cost',
      render: (val) => <span className="font-bold text-slate-900">₹{val?.toLocaleString()}</span>,
    },
    {
      header: 'Status',
      key: 'is_active',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Bill of Materials (BOM) & Recipes"
        subtitle="Manage engineering assembly trees, raw material components, batch quantities, and production overhead estimates."
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'BOM' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={boms}
            loading={loading}
            onRowClick={(row) => setSelectedBom(row)}
          />
        </div>

        {/* Selected BOM Line Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 h-fit">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            {selectedBom ? selectedBom.bom_name : 'BOM Recipe Breakdown'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {selectedBom ? `BOM #${selectedBom.bom_number} • Rev: ${selectedBom.revision}` : 'Select a BOM to inspect formula'}
          </p>

          {selectedBom?.items?.length > 0 ? (
            <div className="space-y-4">
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {selectedBom.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {item.item_product_id?.product_name || 'Raw Material'}
                      </span>
                      <span className="text-slate-400">
                        Qty: {item.quantity} {item.uom_id?.uom_code || 'Units'} | Wastage: {item.wastage_percent}%
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">₹{item.total_cost?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span className="font-mono">
                    ₹
                    {(
                      selectedBom.total_estimated_cost -
                      (selectedBom.overhead_cost || 0) -
                      (selectedBom.labor_cost || 0)
                    )?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overhead Cost:</span>
                  <span className="font-mono">₹{selectedBom.overhead_cost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor Cost:</span>
                  <span className="font-mono">₹{selectedBom.labor_cost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Estimated Batch Cost:</span>
                  <span className="font-mono text-indigo-600">
                    ₹{selectedBom.total_estimated_cost?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              No items configured in this BOM recipe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BomPage;
