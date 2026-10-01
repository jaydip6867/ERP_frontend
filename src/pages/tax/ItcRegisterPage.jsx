import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  Filter,
  RefreshCw,
  Search,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { taxService } from '../../services/tax.service';

export const ItcRegisterPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const fetchItc = async () => {
    try {
      setLoading(true);
      const res = await taxService.getItcRegister({ startDate, endDate });
      setData(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to fetch ITC Register:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItc();
  }, [startDate, endDate]);

  const filteredEntries = data?.entries?.filter(e =>
    e.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.supplier_gstin?.toLowerCase().includes(search.toLowerCase()) ||
    e.bill_number?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleExportCsv = () => {
    if (!filteredEntries.length) return;
    const headers = ['Supplier Name', 'Supplier GSTIN', 'Bill Number', 'Bill Date', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total ITC', 'Eligibility'];
    const rows = filteredEntries.map(e => [
      `"${e.supplier_name || ''}"`,
      `"${e.supplier_gstin || ''}"`,
      `"${e.bill_number || ''}"`,
      `"${e.bill_date ? new Date(e.bill_date).toLocaleDateString() : ''}"`,
      e.taxable_amount || 0,
      e.cgst || 0,
      e.sgst || 0,
      e.igst || 0,
      e.total_itc || 0,
      `"${e.eligibility || 'All other ITC'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ITC_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Input Tax Credit (ITC) Register</h1>
              <p className="text-sm text-gray-500">Inward supplies, supplier GSTINs, and eligible tax credit breakdown</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchItc}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            disabled={!filteredEntries.length}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Purchase Bills</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{data?.total_bills || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/50 to-transparent">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Eligible ITC</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">₹{(data?.total_eligible_itc || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Total CGST Claim</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">₹{(data?.total_cgst || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Total SGST Claim</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">₹{(data?.total_sgst || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Total IGST Claim</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">₹{(data?.total_igst || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier, GSTIN, bill #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-red-600 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ITC Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <th className="p-3.5">Supplier Details</th>
                <th className="p-3.5">Bill No. & Date</th>
                <th className="p-3.5 text-right">Taxable Amt</th>
                <th className="p-3.5 text-right">CGST</th>
                <th className="p-3.5 text-right">SGST</th>
                <th className="p-3.5 text-right">IGST</th>
                <th className="p-3.5 text-right">Total ITC</th>
                <th className="p-3.5 text-center">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">Loading ITC register entries...</td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">No inward supplies or ITC records found.</td>
                </tr>
              ) : (
                filteredEntries.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{row.supplier_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{row.supplier_gstin || 'Unregistered'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-gray-800">{row.bill_number}</div>
                      <div className="text-xs text-gray-400">
                        {row.bill_date ? new Date(row.bill_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-medium text-gray-700">
                      ₹{(row.taxable_amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right text-blue-600 font-mono">
                      ₹{(row.cgst || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right text-purple-600 font-mono">
                      ₹{(row.sgst || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right text-amber-600 font-mono">
                      ₹{(row.igst || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-700 font-mono">
                      ₹{(row.total_itc || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        {row.eligibility}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItcRegisterPage;
