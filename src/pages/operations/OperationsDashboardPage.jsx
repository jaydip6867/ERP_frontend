import React, { useState, useEffect } from 'react';
import { Truck, Package, Printer, Scissors, Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const OperationsDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getDashboard();
      setData(res.data || {});
    } catch (err) {
      toast.error('Failed to load operations dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Operations, Supply Chain & Job Work Execution"
          subtitle="Real-time control over contract manufacturing, printing, embroidery, packing, and fleet logistics."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Dashboard' }]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Printing Job Queue</span>
            <Printer className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.printingJobsCount || 0} Batches</div>
          <div className="text-xs text-slate-400 mt-1">Screen & Digital Textile Printing</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Embroidery Job Queue</span>
            <Scissors className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.embroideryJobsCount || 0} Batches</div>
          <div className="text-xs text-slate-400 mt-1">Multi-head computer embroidery</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Packing Operations</span>
            <Package className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.packingJobsCount || 0} Active</div>
          <div className="text-xs text-slate-400 mt-1">Barcode tagging & carton box packing</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In-Transit Freight</span>
            <Truck className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.activeLogisticsCount || 0} Shipments</div>
          <div className="text-xs text-slate-400 mt-1">Direct fleet & 3PL dispatches</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Manufacturing & Job Work Workstations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Printing Department', link: '/operations/printing', icon: Printer, desc: 'Fabric screen & sublimation' },
            { title: 'Embroidery Unit', link: '/operations/embroidery', icon: Scissors, desc: 'Thread work & applique' },
            { title: 'Finishing & Packing', link: '/operations/packing', icon: Package, desc: 'Ironing, folding & box carton' },
            { title: 'Logistics & Dispatch', link: '/operations/logistics', icon: Truck, desc: 'B2B freight & courier tracking' },
            { title: 'Supply Chain Tracker', link: '/operations/supply-chain', icon: Layers, desc: 'Material lead-time visibility' },
            { title: 'Product Merchandising', link: '/operations/merchandising', icon: Package, desc: 'SKU tech packs & catalogs' },
            { title: 'Vendor Management', link: '/operations/vendors', icon: CheckCircle2, desc: 'Subcontractor SLAs & rates' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.link}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition"
              >
                <Icon className="w-6 h-6 text-indigo-600 mb-2" />
                <div className="text-sm font-bold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OperationsDashboardPage;
