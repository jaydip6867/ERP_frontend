import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  RefreshCw,
  Info,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { taxService } from '../../services/tax.service';

export const TaxLedgerPage = () => {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await taxService.getTaxLedger();
      setLedger(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load tax ledger summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const output = ledger?.output_tax || { outputCgst: 0, outputSgst: 0, outputIgst: 0, totalOutput: 0 };
  const input = ledger?.input_tax_credit || { inputCgst: 0, inputSgst: 0, inputIgst: 0, totalInput: 0 };
  const net = ledger?.net_payable || { cgst: 0, sgst: 0, igst: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tax Ledger & Offsetting</h1>
              <p className="text-sm text-gray-500">Output tax liability vs. available input tax credit & net cash payout</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchLedger}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <span className="font-semibold">Electronic Credit & Cash Offset Rule:</span> Under GST statutory law, Input Tax Credit (ITC) is first utilized against CGST/SGST/IGST liability according to the setoff order. Any balance liability remaining after ITC utilization must be discharged via the Electronic Cash Ledger.
        </div>
      </div>

      {/* Primary KPI Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Output Tax */}
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-8 -mt-8 opacity-60"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Gross Output Tax (Sales)</span>
            <span className="p-1.5 bg-red-100 text-red-600 rounded-md">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-3">
            ₹{(output.totalOutput || 0).toLocaleString()}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>CGST:</span> <span className="font-mono font-medium">₹{(output.outputCgst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span> <span className="font-mono font-medium">₹{(output.outputSgst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST:</span> <span className="font-mono font-medium">₹{(output.outputIgst || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Input Tax */}
        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 opacity-60"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Input Tax Credit (ITC)</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">
            ₹{(input.totalInput || 0).toLocaleString()}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>CGST:</span> <span className="font-mono font-medium">₹{(input.inputCgst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span> <span className="font-mono font-medium">₹{(input.inputSgst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST:</span> <span className="font-mono font-medium">₹{(input.inputIgst || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Cash Liability */}
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-50/40 to-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full -mr-8 -mt-8 opacity-40"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Net Cash Payable</span>
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-indigo-900 mt-3">
            ₹{(net.total || 0).toLocaleString()}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Net CGST:</span> <span className="font-mono font-medium text-indigo-900">₹{(net.cgst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Net SGST:</span> <span className="font-mono font-medium text-indigo-900">₹{(net.sgst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Net IGST:</span> <span className="font-mono font-medium text-indigo-900">₹{(net.igst || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Head-wise Tax Offsetting Computation</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase">
                <th className="p-4">Tax Head</th>
                <th className="p-4 text-right">Output Liability (A)</th>
                <th className="p-4 text-right">Eligible ITC (B)</th>
                <th className="p-4 text-right">Net Tax Payable (A - B)</th>
                <th className="p-4 text-center">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-800">Central Tax (CGST)</td>
                <td className="p-4 text-right font-mono text-gray-700">₹{(output.outputCgst || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-emerald-600">₹{(input.inputCgst || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono font-bold text-indigo-700">₹{(net.cgst || 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {net.cgst === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Offset
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Cash Payable
                    </span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-800">State Tax (SGST)</td>
                <td className="p-4 text-right font-mono text-gray-700">₹{(output.outputSgst || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-emerald-600">₹{(input.inputSgst || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono font-bold text-indigo-700">₹{(net.sgst || 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {net.sgst === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Offset
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Cash Payable
                    </span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-800">Integrated Tax (IGST)</td>
                <td className="p-4 text-right font-mono text-gray-700">₹{(output.outputIgst || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-emerald-600">₹{(input.inputIgst || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono font-bold text-indigo-700">₹{(net.igst || 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {net.igst === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Offset
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Cash Payable
                    </span>
                  )}
                </td>
              </tr>
              <tr className="bg-gray-50/70 font-bold border-t-2 border-gray-200">
                <td className="p-4 text-gray-900">Total Statutory Liability</td>
                <td className="p-4 text-right font-mono text-gray-900">₹{(output.totalOutput || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-emerald-700">₹{(input.totalInput || 0).toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-indigo-800 text-base">₹{(net.total || 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="text-xs text-gray-600">Period Cumulative</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxLedgerPage;
