import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'won', 'approved', 'completed', 'verified', 'accepted', 'success'].includes(s)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['pending', 'contacted', 'proposal', 'negotiation', 'pending_approval', 'warning'].includes(s)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['lost', 'rejected', 'blacklisted', 'cancelled', 'inactive', 'discontinued', 'error'].includes(s)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['draft', 'new', 'info'].includes(s)) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (['sent', 'converted_to_order'].includes(s)) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  // Format label: snake_case to Title Case
  const formatted = s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      {formatted}
    </span>
  );
};
export default StatusBadge;
