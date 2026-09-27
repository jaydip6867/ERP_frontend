import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Filter, Building2 } from 'lucide-react';
import { taxService } from '../../services/tax.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const Gstr1Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('b2b');

  useEffect(() => {
    loadGstr1();
  }, []);

  const loadGstr1 = async () => {
    try {
      setLoading(true);
      const res = await taxService.getGstr1();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, sections } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="GSTR-1 Monthly Return"
        subtitle="Statement of outward supplies of goods and services."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'GST', href: '/tax' },
          { label: 'GSTR-1' },
        ]}
        actions={
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Return JSON
          </button>
        }
      />

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-mono text-xs">
        <div>
          <p className="font-sans text-slate-500 font-semibold">Total Invoices</p>
          <p className="text-base font-bold text-slate-900 mt-0.5">{summary?.total_invoices || 0}</p>
        </div>
        <div>
          <p className="font-sans text-slate-500 font-semibold">Taxable Value</p>
          <p className="text-base font-bold text-slate-900 mt-0.5">₹{Number(summary?.total_taxable || 0).toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="font-sans text-slate-500 font-semibold">CGST + SGST</p>
          <p className="text-base font-bold text-slate-900 mt-0.5">
            ₹{Number((summary?.total_cgst || 0) + (summary?.total_sgst || 0)).toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="font-sans text-slate-500 font-semibold">Total Tax</p>
          <p className="text-base font-bold text-indigo-600 mt-0.5">₹{Number(summary?.total_tax || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('b2b')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'b2b'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          4A, 4B - B2B Invoices ({sections?.b2b?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('b2cs')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'b2cs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          7 - B2CS Small Consumer ({sections?.b2cs?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('hsn')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'hsn'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          12 - HSN Summary ({sections?.hsn_summary?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'b2b' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Customer GSTIN</th>
                <th className="py-2.5 px-4">Customer Name</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">CGST</th>
                <th className="py-2.5 px-3 text-right">SGST</th>
                <th className="py-2.5 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sections?.b2b?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{row.gstin}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-800">{row.customer_name}</td>
                  <td className="py-2.5 px-3 text-indigo-700">{row.invoice_number}</td>
                  <td className="py-2.5 px-3">{new Date(row.invoice_date).toLocaleDateString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right">₹{Number(row.taxable_amount).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{Number(row.cgst || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{Number(row.sgst || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{Number(row.grand_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'hsn' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">HSN Code</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-3 text-center">UOM</th>
                <th className="py-2.5 px-3 text-center">Total Qty</th>
                <th className="py-2.5 px-4 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 text-right">CGST</th>
                <th className="py-2.5 px-3 text-right">SGST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sections?.hsn_summary?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{row.hsn_code}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-800">{row.description}</td>
                  <td className="py-2.5 px-3 text-center">{row.uom}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{row.total_qty}</td>
                  <td className="py-2.5 px-4 text-right">₹{Number(row.taxable_value).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{Number(row.cgst || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">₹{Number(row.sgst || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'b2cs' && (
          <div className="p-8 text-center text-xs text-slate-500">
            {sections?.b2cs?.length > 0 ? (
              <p>{sections.b2cs.length} small consumer invoices recorded.</p>
            ) : (
              <p>No unregistered small retail consumer invoices for this period.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gstr1Page;
