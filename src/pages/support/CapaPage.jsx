import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { supportService } from '../../services/support.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const CapaPage = () => {
  const [capaRecords, setCapaRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapa();
  }, []);

  const loadCapa = async () => {
    try {
      setLoading(true);
      const res = await supportService.getCapa();
      setCapaRecords(res.data || []);
    } catch (err) {
      console.error('Failed to load CAPA records:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Root Cause Analysis & CAPA"
        subtitle="5-Why analysis, Corrective Actions (CA), and Preventive Actions (PA) for quality and customer incidents."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Support', href: '/support/tickets' },
          { label: 'CAPA' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">CAPA Number</th>
                <th className="py-3 px-4">Title / Defect Nature</th>
                <th className="py-3 px-4">Root Cause (5-Why Conclusion)</th>
                <th className="py-3 px-4">Corrective Action</th>
                <th className="py-3 px-4">Preventive Action</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Loading CAPA records...</td>
                </tr>
              ) : capaRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">No CAPA investigations registered</td>
                </tr>
              ) : (
                capaRecords.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{c.rca_number || 'CAPA'}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{c.title}</td>
                    <td className="py-3 px-4 text-xs text-slate-700">{c.root_cause_summary}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{c.corrective_action}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{c.preventive_action}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {c.status || 'Implemented'}
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

export default CapaPage;
