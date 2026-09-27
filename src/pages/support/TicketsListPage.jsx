import React, { useState, useEffect } from 'react';
import { LifeBuoy, AlertTriangle, CheckCircle, Clock, ShieldAlert, Plus, Search } from 'lucide-react';
import { supportService } from '../../services/support.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';
import { Badge } from '../../components/ui/Badge';

export const TicketsListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await supportService.getTickets();
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT': return <Badge variant="danger">URGENT</Badge>;
      case 'HIGH': return <Badge variant="warning">HIGH</Badge>;
      case 'MEDIUM': return <Badge variant="indigo">MEDIUM</Badge>;
      default: return <Badge>LOW</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Service & Helpdesk Tickets"
        subtitle="Manage warranty claims, defect reports, delivery disputes, and SLA resolution tracking."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Support' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Ticket No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-center">SLA Status</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading support tickets...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No active tickets found</td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{t.ticket_number}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{t.subject}</td>
                    <td className="py-3 px-4 text-slate-700">{t.customer_id?.company_name || 'Customer'}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{t.category}</td>
                    <td className="py-3 px-4">{getPriorityBadge(t.priority)}</td>
                    <td className="py-3 px-4 text-center">
                      {t.sla_breached ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" /> Breached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          <Clock className="w-3 h-3" /> On Track
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {t.status}
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

export default TicketsListPage;
