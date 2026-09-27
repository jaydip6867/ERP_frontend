import React, { useState, useEffect } from 'react';
import { Calculator, Download } from 'lucide-react';
import { taxService } from '../../services/tax.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const Gstr3bPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGstr3b();
  }, []);

  const loadGstr3b = async () => {
    try {
      setLoading(true);
      const res = await taxService.getGstr3b();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { outward_supplies_3_1, eligible_itc_4, net_tax_payable_6_1 } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="GSTR-3B Monthly Summary"
        subtitle="Self-assessed summary of outward supplies, eligible input tax credits, and net tax liability."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'GST', href: '/tax' },
          { label: 'GSTR-3B' },
        ]}
      />

      {/* Table 3.1: Outward Supplies */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase">
          3.1 Details of Outward Supplies and inward supplies liable to reverse charge
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 font-sans">Nature of Supplies</th>
              <th className="py-2.5 px-3 text-right">Total Taxable Value</th>
              <th className="py-2.5 px-3 text-right">IGST</th>
              <th className="py-2.5 px-3 text-right">CGST</th>
              <th className="py-2.5 px-4 text-right">SGST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                (a) Outward taxable supplies (other than zero rated, nil rated and exempted)
              </td>
              <td className="py-3 px-3 text-right font-bold text-slate-900">
                ₹{Number(outward_supplies_3_1?.taxable_value || 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right">₹{Number(outward_supplies_3_1?.igst || 0).toFixed(2)}</td>
              <td className="py-3 px-3 text-right">₹{Number(outward_supplies_3_1?.cgst || 0).toFixed(2)}</td>
              <td className="py-3 px-4 text-right">₹{Number(outward_supplies_3_1?.sgst || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 4: Eligible ITC */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase">
          4. Eligible ITC (Input Tax Credit Available)
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 font-sans">Details</th>
              <th className="py-2.5 px-3 text-right">IGST</th>
              <th className="py-2.5 px-3 text-right">CGST</th>
              <th className="py-2.5 px-4 text-right">SGST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                (A) (5) All other ITC (From purchase invoices booked)
              </td>
              <td className="py-3 px-3 text-right">₹{Number(eligible_itc_4?.igst || 0).toFixed(2)}</td>
              <td className="py-3 px-3 text-right">₹{Number(eligible_itc_4?.cgst || 0).toFixed(2)}</td>
              <td className="py-3 px-4 text-right">₹{Number(eligible_itc_4?.sgst || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 6.1: Net Payment of Tax */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase">
          6.1 Payment of Tax (Net Cash / Electronic Ledger Liability)
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 font-sans">Description</th>
              <th className="py-2.5 px-3 text-right">Tax Payable (Output)</th>
              <th className="py-2.5 px-3 text-right">Paid through ITC</th>
              <th className="py-2.5 px-4 text-right">Tax Paid in Cash (Net)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">Central Tax (CGST)</td>
              <td className="py-2.5 px-3 text-right">₹{Number(outward_supplies_3_1?.cgst || 0).toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right">₹{Number(eligible_itc_4?.cgst || 0).toFixed(2)}</td>
              <td className="py-2.5 px-4 text-right font-bold text-indigo-700">₹{Number(net_tax_payable_6_1?.cgst || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">State Tax (SGST)</td>
              <td className="py-2.5 px-3 text-right">₹{Number(outward_supplies_3_1?.sgst || 0).toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right">₹{Number(eligible_itc_4?.sgst || 0).toFixed(2)}</td>
              <td className="py-2.5 px-4 text-right font-bold text-indigo-700">₹{Number(net_tax_payable_6_1?.sgst || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Gstr3bPage;
