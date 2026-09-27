import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, ShieldCheck, Phone, Mail } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const VendorManagementPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getVendors();
      setVendors(res.data?.vendors || []);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Vendor, Subcontractor & Mill Network"
          subtitle="Yarn spinning mills, dye houses, printing subcontractors, packaging suppliers, and delivery SLAs."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Vendors' }]}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Vendor / Mill</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Category / Service</th>
                <th className="px-5 py-3">Quality Rating</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading vendor partners...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No vendors registered yet.</td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{v.supplier_name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      <div>{v.contact_person}</div>
                      <div>{v.phone || v.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">{v.category || 'Textile Mill'}</td>
                    <td className="px-5 py-3.5 font-semibold text-amber-500">★ 4.8 / 5</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        Approved SLA
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

export default VendorManagementPage;
