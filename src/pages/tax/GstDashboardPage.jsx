import React, { useState, useEffect } from 'react';
import { Landmark, FileSpreadsheet, Calculator, Coins, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { taxService } from '../../services/tax.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const GstDashboardPage = () => {
  const navigate = useNavigate();
  const [ledger, setLedger] = useState({
    output_tax: { totalOutput: 0, outputCgst: 0, outputSgst: 0, outputIgst: 0 },
    input_tax_credit: { totalInput: 0, inputCgst: 0, inputSgst: 0, inputIgst: 0 },
    net_payable: { total: 0, cgst: 0, sgst: 0, igst: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await taxService.getTaxLedger();
      setLedger(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Compliance & Tax Ledger"
        subtitle="Manage statutory returns (GSTR-1, GSTR-3B), Input Tax Credit (ITC) reconciliation, and tax rates."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'GST & Tax' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/tax/rates"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Tax Rates Master
            </Link>
            <Link
              to="/tax/gstr-1"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              GSTR-1 Return
            </Link>
          </div>
        }
      />

      {/* Statutory Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Landmark className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Statutory & Regulatory Notice:</span>
          <p className="mt-0.5">
            This module generates audit-ready, standardized JSON/tabular structures for GSTR-1, GSTR-3B, and ITC reconciliation according to Indian GST guidelines. Live filing requires configured direct credentials with an authorized GSP/ASP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Output Tax Liability (Sales)"
          value={`₹${Number(ledger.output_tax?.totalOutput || 0).toLocaleString('en-IN')}`}
          icon={Coins}
          description="Total tax billed on outward invoices"
        />
        <StatCard
          title="Eligible ITC (Purchases)"
          value={`₹${Number(ledger.input_tax_credit?.totalInput || 0).toLocaleString('en-IN')}`}
          icon={ShieldCheck}
          description="Input Tax Credit from vendor bills"
        />
        <StatCard
          title="Net GST Payable"
          value={`₹${Number(ledger.net_payable?.total || 0).toLocaleString('en-IN')}`}
          icon={Calculator}
          description="Net liability after ITC deduction"
        />
      </div>

      {/* Return Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/tax/gstr-1')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">GSTR-1 Monthly Return</h3>
          <p className="text-xs text-slate-600">
            Outward supplies categorized into B2B, B2CL, B2CS, CDNR credit notes, and HSN summary.
          </p>
        </div>

        <div
          onClick={() => navigate('/tax/gstr-3b')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">GSTR-3B Summary Return</h3>
          <p className="text-xs text-slate-600">
            Table 3.1 Outward supplies, Table 4 ITC availability, and Table 6.1 Net tax liability.
          </p>
        </div>

        <div
          onClick={() => navigate('/tax/itc-register')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ITC Register & GSTR-2B</h3>
          <p className="text-xs text-slate-600">
            Detailed itemized register of supplier GST input tax credits and eligible offsets.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GstDashboardPage;
