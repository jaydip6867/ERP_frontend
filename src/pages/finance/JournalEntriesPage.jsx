import React, { useState, useEffect } from 'react';
import { Scale, Plus, CheckCircle2, Calendar, FileText, Eye } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const JournalEntriesPage = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState(null);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const res = await financeService.getJournalEntries();
      setJournals(Array.isArray(res?.data) ? res.data : (res?.data?.journals || []));
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Journal Entries"
        subtitle="Double-entry transaction vouchers with mandatory debit and credit balancing."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Journal Entries' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Entry Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Narration / Description</th>
                <th className="py-3 px-4">Voucher Type</th>
                <th className="py-3 px-4 text-right">Debit Total (₹)</th>
                <th className="py-3 px-4 text-right">Credit Total (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading journal entries...</td>
                </tr>
              ) : (Array.isArray(journals) ? journals : []).length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No journal entries recorded</td>
                </tr>
              ) : (
                (Array.isArray(journals) ? journals : []).map((j) => (
                  <tr
                    key={j._id}
                    onClick={() => setSelectedJournal(j)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{j.entry_number}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {new Date(j.entry_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{j.narration}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{j.voucher_type || 'GENERAL'}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                      ₹{(j.total_debit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                      ₹{(j.total_credit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {j.status || 'Posted'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedJournal(j)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="View Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJournal && (
        <Modal
          isOpen={!!selectedJournal}
          onClose={() => setSelectedJournal(null)}
          title={`Journal Voucher: ${selectedJournal.entry_number}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Entry Date</span>
                <span className="font-semibold text-slate-900">
                  {new Date(selectedJournal.entry_date).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Voucher Type</span>
                <span className="font-mono font-semibold text-indigo-700">{selectedJournal.voucher_type || 'GENERAL'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {selectedJournal.status || 'Posted'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Narration / Purpose:</span>
              <p className="text-xs text-slate-800 whitespace-pre-wrap">{selectedJournal.narration || 'No narration provided.'}</p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex justify-between">
                <span>Account Ledger Line</span>
                <div className="flex gap-12 mr-2">
                  <span>Debit (₹)</span>
                  <span>Credit (₹)</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {(selectedJournal.lines || []).length > 0 ? (
                  selectedJournal.lines.map((line, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{line.account_id?.account_name || line.account_name || 'Ledger Account'}</p>
                        <p className="text-slate-400 font-mono text-[11px]">{line.account_id?.account_code || ''}</p>
                      </div>
                      <div className="flex gap-12 font-mono">
                        <span className="w-20 text-right font-medium text-slate-900">
                          {line.debit > 0 ? `₹${Number(line.debit).toLocaleString('en-IN')}` : '-'}
                        </span>
                        <span className="w-20 text-right font-medium text-slate-900">
                          {line.credit > 0 ? `₹${Number(line.credit).toLocaleString('en-IN')}` : '-'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500 italic">Balanced double entry voucher</span>
                    <div className="flex gap-12 font-mono">
                      <span className="w-20 text-right font-bold text-slate-900">₹{Number(selectedJournal.total_debit || 0).toLocaleString('en-IN')}</span>
                      <span className="w-20 text-right font-bold text-slate-900">₹{Number(selectedJournal.total_credit || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50 flex justify-between items-center border-t border-slate-200 font-bold text-xs">
                <span>Total Balancing:</span>
                <div className="flex gap-12 font-mono">
                  <span className="w-20 text-right text-emerald-700">₹{Number(selectedJournal.total_debit || 0).toLocaleString('en-IN')}</span>
                  <span className="w-20 text-right text-emerald-700">₹{Number(selectedJournal.total_credit || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedJournal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default JournalEntriesPage;
