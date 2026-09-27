import React, { useState, useEffect } from 'react';
import { Users, Plus, Eye, DollarSign, Clock, ShieldCheck, Merge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';
import { FilterBar } from '../../components/shell/FilterBar';

export const CustomersListPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Add Customer Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    customer_type: 'corporate',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    credit_limit: 500000,
    credit_days: 30,
    segment: 'General',
    primary_contact: {
      contact_name: '',
      email: '',
      phone: '',
      designation: 'Procurement Head',
    },
    billing_address: {
      address_line1: '',
      city: '',
      state: '',
      pincode: '',
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers(pagination.page);
  }, [pagination.page, search, typeFilter, segmentFilter, stageFilter]);

  const loadCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers({
        page,
        limit: 10,
        search,
        customer_type: typeFilter || undefined,
        segment: segmentFilter || undefined,
        stage: stageFilter || undefined,
      });
      setCustomers(res.data || []);
      if (res.meta) {
        setPagination({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: res.meta.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await customerService.createCustomer(formData);
      setIsModalOpen(false);
      loadCustomers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to onboard customer');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Customer Code',
      key: 'customer_code',
      cellClassName: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Company / Name',
      key: 'company_name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900 block hover:text-indigo-600 transition">
            {val}
          </span>
          <span className="text-xs text-slate-400">
            {row.email} {row.phone ? `• ${row.phone}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'customer_type',
      render: (val) => <span className="capitalize text-xs px-2 py-0.5 rounded bg-slate-100">{val}</span>,
    },
    {
      header: 'Segment',
      key: 'segment',
      render: (val) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            val === 'Platinum'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : val === 'Gold'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      header: 'Credit Limit',
      key: 'credit_limit',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900 block">₹{val?.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400">{row.credit_days} Days ({row.credit_status})</span>
        </div>
      ),
    },
    {
      header: 'Outstanding Balance',
      key: 'outstanding_balance',
      render: (val) => (
        <span className={`font-semibold ${val > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
          ₹{val?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      header: 'Stage',
      key: 'stage',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="CRM & Customer Directory"
        subtitle="Manage accounts, authorized credit limits, GST profiles, key contacts, and dormant buyer accounts."
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Customers' }]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search customers by company, code, GSTIN, phone..."
        filters={[
          {
            label: 'All Types',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'Corporate', value: 'corporate' },
              { label: 'Distributor', value: 'distributor' },
              { label: 'Dealer', value: 'dealer' },
              { label: 'Retail', value: 'retail' },
            ],
          },
          {
            label: 'All Segments',
            value: segmentFilter,
            onChange: setSegmentFilter,
            options: [
              { label: 'Platinum', value: 'Platinum' },
              { label: 'Gold', value: 'Gold' },
              { label: 'Silver', value: 'Silver' },
              { label: 'General', value: 'General' },
            ],
          },
          {
            label: 'All Stages',
            value: stageFilter,
            onChange: setStageFilter,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Prospect', value: 'prospect' },
              { label: 'Dormant (>90d)', value: 'dormant' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setTypeFilter('');
          setSegmentFilter('');
          setStageFilter('');
        }}
      />

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => loadCustomers(page)}
        onRowClick={(row) => navigate(`/customers/${row._id}/360`)}
        actions={(row) => (
          <button
            onClick={() => navigate(`/customers/${row._id}/360`)}
            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            360° Profile
          </button>
        )}
      />

      {/* Onboard Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard New Customer Account"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Customer Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Type *</label>
              <select
                required
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="corporate">Corporate / Developer</option>
                <option value="distributor">Distributor</option>
                <option value="dealer">Dealer</option>
                <option value="retail">Retail Store</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Card</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Days</label>
              <input
                type="number"
                min="0"
                value={formData.credit_days}
                onChange={(e) => setFormData({ ...formData, credit_days: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Segment</label>
              <select
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Platinum">Platinum (VIP)</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Primary Contact Section */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Primary Key Contact</h4>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Contact Person *"
                required
                value={formData.primary_contact.contact_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_contact: { ...formData.primary_contact, contact_name: e.target.value },
                  })
                }
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Mobile / Phone"
                value={formData.primary_contact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_contact: { ...formData.primary_contact, phone: e.target.value },
                  })
                }
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.primary_contact.designation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primary_contact: { ...formData.primary_contact, designation: e.target.value },
                  })
                }
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
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
              {saving ? 'Creating...' : 'Onboard Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CustomersListPage;
