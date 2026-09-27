import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, CheckCircle2 } from 'lucide-react';
import { invoiceService } from '../../services/invoice.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { FilterBar } from '../../components/shell/FilterBar';
import { Modal } from '../../components/shell/Modal';

export const CreditDebitNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    loadNotes(pagination.page);
  }, [pagination.page, typeFilter]);

  const loadNotes = async (page = 1) => {
    try {
      setLoading(true);
      const res = await invoiceService.getCreditDebitNotes({
        page,
        limit: 10,
        note_type: typeFilter || undefined,
      });
      setNotes(res.data?.notes || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Note #',
      key: 'note_number',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Type',
      key: 'note_type',
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
            t === 'credit_note' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {t?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Date',
      key: 'note_date',
      render: (dt) => new Date(dt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Party',
      key: 'customer_id',
      render: (c, row) => (
        <span className="font-semibold text-slate-900">
          {c?.display_name || row.supplier_id?.supplier_name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Invoice Ref',
      key: 'original_invoice_number',
      render: (ref) => <span className="font-mono text-xs text-slate-600">{ref || 'Direct'}</span>,
    },
    {
      header: 'Grand Total',
      key: 'grand_total',
      cellClassName: 'font-bold text-slate-900',
      render: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => <StatusBadge status={st} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit & Debit Notes"
        subtitle="Post-issuance billing adjustments, sales return credits, and vendor debit memos."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'Credit/Debit Notes' },
        ]}
      />

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Filter notes..."
        filters={[
          {
            label: 'Note Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Notes', value: '' },
              { label: 'Credit Notes', value: 'credit_note' },
              { label: 'Debit Notes', value: 'debit_note' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={notes}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        onRowClick={(row) => setSelectedNote(row)}
        actions={(row) => (
          <button
            onClick={() => setSelectedNote(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="View Note Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {selectedNote && (
        <Modal
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          title={`${selectedNote.note_type === 'credit_note' ? 'Credit Note' : 'Debit Note'}: ${selectedNote.note_number}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Note Number</p>
                <p className="font-mono font-bold text-slate-900">{selectedNote.note_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Type</p>
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {selectedNote.note_type?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Note Date</p>
                <p className="text-slate-800">{new Date(selectedNote.note_date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Status</p>
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedNote.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Original Reference Invoice</p>
              <p className="font-mono font-bold text-slate-900">{selectedNote.original_invoice_number || 'Direct Memo'}</p>
              {selectedNote.reason && (
                <p className="text-xs text-slate-600 mt-1">Reason: <span className="font-medium text-slate-800">{selectedNote.reason}</span></p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
              <div>
                <p className="text-xs text-slate-500">Taxable Adjustment</p>
                <p className="font-bold text-slate-800 text-base">₹{Number(selectedNote.taxable_amount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-medium">Total Adjustment Amount</p>
                <p className="font-extrabold text-indigo-700 text-xl">₹{Number(selectedNote.grand_total || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
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

export default CreditDebitNotesPage;
