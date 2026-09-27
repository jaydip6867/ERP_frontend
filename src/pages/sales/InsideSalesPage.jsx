import React, { useState, useEffect } from 'react';
import { PhoneCall, Search, Plus, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const InsideSalesPage = () => {
  const [data, setData] = useState({ customers: [], leads: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegment();
  }, []);

  const loadSegment = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getSalesSegment('INSIDE_SALES');
      setData(res.data || { customers: [], leads: [], orders: [] });
    } catch (err) {
      toast.error('Failed to load inside sales queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Inside Sales, Inbound Demand & Tele-Calling"
          subtitle="Direct website inquiries, WhatsApp catalog leads, outbound telemarketing, and sales rep pipeline."
          breadcrumbs={[{ label: 'Commercial Sales' }, { label: 'Inside Sales' }]}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Lead Code</th>
                <th className="px-5 py-3">Prospect Name</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">Pipeline Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading call queue...</td>
                </tr>
              ) : data.leads?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No inside sales leads queued.</td>
                </tr>
              ) : (
                data.leads?.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{l.lead_code || 'LEAD'}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{l.name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <div>{l.phone}</div>
                      <div className="text-slate-400">{l.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-blue-50 text-blue-700">
                        {l.status || 'new'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Today'}
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

export default InsideSalesPage;
