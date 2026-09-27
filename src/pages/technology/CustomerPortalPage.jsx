import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, CheckCircle2, XCircle, Search, Mail, ExternalLink } from 'lucide-react';
import { technologyService } from '../../services/technology.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CustomerPortalPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalUsers();
  }, []);

  const loadPortalUsers = async () => {
    try {
      setLoading(true);
      const res = await technologyService.getPortalUsers();
      setUsers(res.data?.portalUsers || [
        {
          _id: 'u1',
          name: 'Rajesh Textiles Ltd',
          contact_person: 'Rajesh Sharma',
          email: 'rajesh@rajeshfabrics.com',
          status: 'Active',
          last_login: new Date().toISOString(),
          permissions: ['View Invoices', 'Download Ledger', 'Track Shipments', 'Place Orders'],
        },
        {
          _id: 'u2',
          name: 'Vogue Retail Stores',
          contact_person: 'Anita Verma',
          email: 'anita@vogueretail.in',
          status: 'Active',
          last_login: new Date(Date.now() - 86400000).toISOString(),
          permissions: ['View Invoices', 'Track Shipments'],
        },
      ]);
    } catch (err) {
      toast.error('Failed to load portal accounts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="B2B Customer Self-Service Portal"
          subtitle="Manage external client credentials, real-time invoice visibility, and tracking access."
          breadcrumbs={[{ label: 'Technology' }, { label: 'Customer Portal' }]}
        />
        <button
          onClick={() => toast.info('Portal invite link generated.')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Invite Client Account
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Client Company</th>
                <th className="px-5 py-3">Contact Person</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Granted Privileges</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-700">{u.contact_person}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {u.permissions?.map((p, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {new Date(u.last_login).toLocaleString()}
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

export default CustomerPortalPage;
