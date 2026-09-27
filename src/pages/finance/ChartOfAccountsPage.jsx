import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Search, Filter, BookOpen } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await financeService.getChartOfAccounts();
      setAccounts(res.data || []);
    } catch (err) {
      console.error('Failed to load chart of accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = accounts.filter((acc) => {
    const matchesType = filterType === 'ALL' || acc.account_type === filterType;
    const matchesSearch =
      acc.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.account_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ASSET': return <Badge variant="success">ASSET</Badge>;
      case 'LIABILITY': return <Badge variant="danger">LIABILITY</Badge>;
      case 'EQUITY': return <Badge variant="indigo">EQUITY</Badge>;
      case 'REVENUE': return <Badge variant="success">REVENUE</Badge>;
      case 'EXPENSE': return <Badge variant="warning">EXPENSE</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts (COA)"
        subtitle="Standardized double-entry chart of accounts classified by Assets, Liabilities, Equity, Revenues, and Expenses."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Chart of Accounts' },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search account code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Subcategory</th>
                <th className="py-3 px-4 text-right">Current Balance (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Loading accounts...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No accounts match the criteria</td>
                </tr>
              ) : (
                filtered.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{acc.account_code}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{acc.account_name}</td>
                    <td className="py-3 px-4">{getTypeBadge(acc.account_type)}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{acc.sub_category || 'General'}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                      ₹{(acc.current_balance || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
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

export default ChartOfAccountsPage;
