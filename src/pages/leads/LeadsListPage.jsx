import React, { useState, useEffect } from 'react';
import { Target, Plus, Kanban, PhoneCall, CheckCircle2, UserCheck, Flame, ArrowRight, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { leadService } from '../../services/lead.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';
import { FilterBar } from '../../components/shell/FilterBar';

export const LeadsListPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [viewingLead, setViewingLead] = useState(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: '',
    company_name: '',
    email: '',
    phone: '',
    mobile: '',
    city: '',
    state: '',
    lead_source: 'website',
    pipeline_stage: 'new',
    rating: 'warm',
    estimated_value: 0,
    probability_percent: 20,
    notes: '',
  });

  // Convert Modal
  const [convertingLead, setConvertingLead] = useState(null);
  const [convertForm, setConvertForm] = useState({ company_name: '', customer_type: 'corporate' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLeads(pagination.page);
  }, [pagination.page, search, stageFilter, ratingFilter, sourceFilter]);

  const loadLeads = async (page = 1) => {
    try {
      setLoading(true);
      const res = await leadService.getLeads({
        page,
        limit: 10,
        search,
        pipeline_stage: stageFilter || undefined,
        rating: ratingFilter || undefined,
        lead_source: sourceFilter || undefined,
      });
      setLeads(res.data || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await leadService.createLead(formData);
      setIsModalOpen(false);
      loadLeads(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await leadService.convertToCustomer(convertingLead._id, convertForm);
      setConvertingLead(null);
      alert('Lead successfully converted to customer!');
      loadLeads(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert lead');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Lead Code',
      key: 'lead_code',
      cellClassName: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Contact & Company',
      key: 'contact_name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{val}</span>
          <span className="text-xs text-slate-500 font-medium">
            {row.company_name ? `${row.company_name} • ` : ''}
            {row.mobile || row.phone || row.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Stage',
      key: 'pipeline_stage',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            val === 'hot'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : val === 'warm'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-sky-50 text-sky-700 border border-sky-200'
          }`}
        >
          {val === 'hot' && <Flame className="w-3 h-3 text-rose-500" />}
          {val?.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Source',
      key: 'lead_source',
      render: (val) => <span className="capitalize text-xs text-slate-600">{val?.replace('_', ' ')}</span>,
    },
    {
      header: 'Pipeline Value',
      key: 'estimated_value',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900 block">₹{val?.toLocaleString() || 0}</span>
          <span className="text-[11px] text-slate-400 font-medium">{row.probability_percent}% win chance</span>
        </div>
      ),
    },
    {
      header: 'Assigned To',
      key: 'assigned_to',
      render: (val) => val?.full_name || 'Unassigned',
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Lead & Pipeline Management"
        subtitle="Track prospective buyers, commercial enquiries, deal values, and win probabilities across sales cycles."
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Leads' }]}
        actions={
          <div className="flex gap-2">
            <Link
              to="/leads/kanban"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Lead
            </button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search leads by contact, company, phone, code..."
        filters={[
          {
            label: 'All Stages',
            value: stageFilter,
            onChange: setStageFilter,
            options: [
              { label: 'New', value: 'new' },
              { label: 'Contacted', value: 'contacted' },
              { label: 'Qualified', value: 'qualified' },
              { label: 'Proposal', value: 'proposal' },
              { label: 'Negotiation', value: 'negotiation' },
              { label: 'Won', value: 'won' },
              { label: 'Lost', value: 'lost' },
            ],
          },
          {
            label: 'All Ratings',
            value: ratingFilter,
            onChange: setRatingFilter,
            options: [
              { label: 'Hot', value: 'hot' },
              { label: 'Warm', value: 'warm' },
              { label: 'Cold', value: 'cold' },
            ],
          },
          {
            label: 'All Sources',
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { label: 'Website', value: 'website' },
              { label: 'Exhibition', value: 'exhibition' },
              { label: 'Referral', value: 'referral' },
              { label: 'Cold Call', value: 'cold_call' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStageFilter('');
          setRatingFilter('');
          setSourceFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={leads}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => loadLeads(page)}
        onRowClick={(row) => setViewingLead(row)}
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setViewingLead(row)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="View Lead Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!row.converted_to_customer_id && row.pipeline_stage !== 'lost' && (
              <button
                onClick={() => {
                  setConvertingLead(row);
                  setConvertForm({
                    company_name: row.company_name || row.contact_name,
                    customer_type: 'corporate',
                  });
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                title="Convert Lead to Official Customer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Convert
              </button>
            )}
            {row.converted_to_customer_id && (
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Converted
              </span>
            )}
          </div>
        )}
      />

      {/* New Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Commercial Lead"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
              <select
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="website">Website / Inbound</option>
                <option value="exhibition">Exhibition / Expo</option>
                <option value="referral">Client Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="social_media">Social Media</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="hot">🔥 Hot Lead</option>
                <option value="warm">Warm Lead</option>
                <option value="cold">Cold Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Value (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements & Opportunity Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Creating...' : 'Register Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Convert Lead to Customer Modal */}
      <Modal
        isOpen={Boolean(convertingLead)}
        onClose={() => setConvertingLead(null)}
        title="Convert Lead to Active Customer"
      >
        {convertingLead && (
          <form onSubmit={handleConvertLead} className="space-y-4">
            <p className="text-xs text-slate-600">
              Converting Lead <span className="font-bold text-slate-900 font-mono">#{convertingLead.lead_code}</span> will automatically provision an official Customer account with linked primary contact and advance the pipeline stage to <span className="font-bold text-emerald-600 uppercase">Won</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Company Name *</label>
              <input
                type="text"
                required
                value={convertForm.company_name}
                onChange={(e) => setConvertForm({ ...convertForm, company_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Entity Type</label>
              <select
                value={convertForm.customer_type}
                onChange={(e) => setConvertForm({ ...convertForm, customer_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="corporate">Corporate / Developer</option>
                <option value="distributor">Distributor</option>
                <option value="dealer">Dealer</option>
                <option value="retail">Retail Store</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5"
              >
                {saving ? 'Converting...' : 'Confirm Conversion'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Lead Details Modal */}
      {viewingLead && (
        <Modal
          isOpen={Boolean(viewingLead)}
          onClose={() => setViewingLead(null)}
          title={`Lead Profile: ${viewingLead.contact_name}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Lead Code</p>
                <p className="font-mono font-bold text-slate-900">{viewingLead.lead_code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Stage</p>
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {viewingLead.pipeline_stage?.replace('_', ' ') || 'New'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Rating</p>
                <span className={`text-xs font-bold uppercase ${viewingLead.lead_rating === 'hot' ? 'text-rose-600' : viewingLead.lead_rating === 'warm' ? 'text-amber-600' : 'text-slate-600'}`}>
                  {viewingLead.lead_rating || 'Normal'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Win Probability</p>
                <p className="font-bold text-slate-800">{viewingLead.probability_percent || 0}%</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Account & Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Company / Organization</p>
                  <p className="font-bold text-slate-900">{viewingLead.company_name || 'Individual'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Contact Person</p>
                  <p className="font-bold text-slate-900">{viewingLead.contact_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="text-slate-700">{viewingLead.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Phone Number</p>
                  <p className="text-slate-700">{viewingLead.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
              <div>
                <p className="text-xs text-slate-500">Acquisition Source</p>
                <p className="font-semibold text-slate-800 capitalize">{viewingLead.lead_source?.replace('_', ' ') || 'Direct'}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-medium">Estimated Deal Value</p>
                <p className="font-extrabold text-indigo-700 text-lg">₹{Number(viewingLead.estimated_value || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div>
                {!viewingLead.converted_to_customer_id && viewingLead.pipeline_stage !== 'lost' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingLead;
                      setViewingLead(null);
                      setConvertingLead(target);
                      setConvertForm({
                        company_name: target.company_name || target.contact_name,
                        customer_type: 'corporate',
                      });
                    }}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Convert to Customer
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
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
export default LeadsListPage;
