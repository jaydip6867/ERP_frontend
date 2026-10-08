import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  emptyMessage = 'No records found',
  actions,
  rowKey = '_id',
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading data...</p>
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Desktop Table View (md screens and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3.5 ${col.className || ''} [&_svg]:shrink-0`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3.5 text-right whitespace-nowrap shrink-0 w-1">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-400 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={row[rowKey] || row._id || row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-indigo-50/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx} className={`px-4 py-3 ${col.cellClassName || ''} [&_svg]:shrink-0`}>
                      {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key] ?? '—'}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-4 py-3 text-right whitespace-nowrap shrink-0 w-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5 shrink-0 [&_svg]:shrink-0 [&_button]:shrink-0">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (screens smaller than md: 768px) */}
      <div className="block md:hidden p-2 space-y-2 bg-slate-50/50">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 italic text-xs bg-white rounded-lg border border-slate-200">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row, rowIdx) => {
            const remainingCols = columns.slice(1);
            return (
              <div
                key={row[rowKey] || row._id || row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs transition-all space-y-2 ${
                  onRowClick ? 'cursor-pointer active:bg-indigo-50/40' : ''
                }`}
              >
                {/* Primary Column / Card Header */}
                {columns.length > 0 && (
                  <div className="pb-1.5 border-b border-slate-100 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                        {columns[0].header}
                      </span>
                      <div className="text-xs font-bold text-slate-900 leading-snug [&_svg]:shrink-0">
                        {columns[0].render
                          ? columns[0].render(row[columns[0].key], row, rowIdx)
                          : row[columns[0].key] ?? '—'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Remaining Columns as Compact 2-Column Grid */}
                {remainingCols.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] leading-tight">
                    {remainingCols.map((col, cIdx) => {
                      const isLastOdd = remainingCols.length % 2 !== 0 && cIdx === remainingCols.length - 1;
                      return (
                        <div
                          key={col.key || cIdx + 1}
                          className={`bg-slate-50/80 border border-slate-100 rounded px-2 py-1 flex flex-col justify-center min-w-0 ${
                            isLastOdd ? 'col-span-2' : ''
                          }`}
                        >
                          <span className="text-[9px] uppercase font-semibold text-slate-400 truncate tracking-wide">
                            {col.header}
                          </span>
                          <div className={`text-[11px] font-medium text-slate-800 truncate mt-0.5 [&_svg]:shrink-0 ${col.cellClassName || ''}`}>
                            {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key] ?? '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons for Mobile Card */}
                {actions && (
                  <div
                    className="pt-1.5 border-t border-slate-100 flex items-center justify-end gap-1.5 text-xs shrink-0 [&_button]:text-xs [&_button]:py-1 [&_button]:px-2 [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:shrink-0 [&_button]:shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions(row)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600">
          <div className="text-center sm:text-left">
            Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold">{pagination.total}</span> entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(1)}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-0.5 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.totalPages)}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DataTable;
