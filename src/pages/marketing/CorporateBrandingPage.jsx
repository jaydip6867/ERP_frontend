import React from 'react';
import { Award, Briefcase, Tag, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';

export const CorporateBrandingPage = () => {
  const assets = [
    { name: 'Corporate Business Card Standard', format: 'Vector AI / PDF', status: 'Approved', dept: 'HR & Management' },
    { name: 'Executive Letterhead & Stamp', format: 'DOCX / Vector SVG', status: 'Approved', dept: 'Legal & Finance' },
    { name: 'Customer Presentation Pitch Deck', format: 'PowerPoint (16:9)', status: 'Approved', dept: 'Sales & BD' },
    { name: 'Polybag & Shipping Carton Tape Design', format: 'Pantone Specs', status: 'Approved', dept: 'Operations & Dispatch' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Corporate Collaterals & Brand Standards"
          subtitle="Official stationery, executive presentations, tamper-evident packing tapes, and corporate gift kits."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Corporate Branding' }]}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Collateral Asset</th>
                <th className="px-5 py-3">Format / Specs</th>
                <th className="px-5 py-3">Department Scope</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{item.format}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">{item.dept}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CorporateBrandingPage;
