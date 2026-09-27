import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { productService } from '../../services/product.service';
import { productionService } from '../../services/production.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const MaterialAvailabilityPage = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBomId, setSelectedBomId] = useState('');
  const [targetQty, setTargetQty] = useState(50);
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBoms();
  }, []);

  const loadBoms = async () => {
    try {
      const res = await productService.getBoms({ limit: 100 });
      const list = res.data || [];
      setBoms(list);
      if (list.length > 0) {
        setSelectedBomId(list[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheck = async () => {
    if (!selectedBomId) return;
    try {
      setLoading(true);
      const res = await productionService.checkMaterialAvailability({
        bom_id: selectedBomId,
        planned_qty: targetQty,
      });
      setCheckResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBomId) {
      handleCheck();
    }
  }, [selectedBomId, targetQty]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Material Availability & Shortage Check"
        subtitle="Simulate production runs against BOM requirements and current warehouse inventory."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Production', href: '/production' },
          { label: 'Material Check' },
        ]}
      />

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Bill of Materials (BOM)</label>
            <select
              value={selectedBomId}
              onChange={(e) => setSelectedBomId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
            >
              {boms.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bom_name} ({b.bom_number})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Target Production Quantity</label>
            <input
              type="number"
              min="1"
              value={targetQty}
              onChange={(e) => setTargetQty(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
            />
          </div>
        </div>

        {checkResult && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900">Component Sufficiency Report</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  checkResult.isFullyAvailable
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {checkResult.isFullyAvailable ? '✅ Ready for Production' : '⚠️ Material Shortages Detected'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="py-2.5 px-3">Raw Material / Part</th>
                    <th className="py-2.5 px-3 text-center">Required Qty</th>
                    <th className="py-2.5 px-3 text-center">In Stock</th>
                    <th className="py-2.5 px-3 text-center">Shortage</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {checkResult.materials?.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-sans">
                        <p className="font-semibold text-slate-900">{m.product_name}</p>
                        <p className="text-xs font-mono text-slate-500">{m.product_code}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{m.required_qty}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{m.current_stock}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-600">{m.shortage}</td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        {m.is_sufficient ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                            Shortage ({m.shortage})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialAvailabilityPage;
