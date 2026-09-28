import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const Customer360Page = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Contact Modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ contact_name: '', email: '', phone: '', designation: '', is_primary: false });

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ address_type: 'billing', address_line1: '', city: '', state: '', pincode: '', gstin: '', is_primary: false });

  // Interaction Modal
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [interactionForm, setInteractionForm] = useState({ interaction_type: 'call', subject: '', description: '', outcome: '' });

  // Credit Approval Modal
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditForm, setCreditForm] = useState({ credit_limit: 0, credit_days: 30, credit_status: 'approved', notes: '' });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/customers', { replace: true });
      return;
    }
    loadCustomer360();
  }, [id]);

  const loadCustomer360 = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomer360(id);
      setData(res.data);
      if (res.data?.customer) {
        setCreditForm({
          credit_limit: res.data.customer.credit_limit || 0,
          credit_days: res.data.customer.credit_days || 30,
          credit_status: res.data.customer.credit_status || 'approved',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to load customer 360 profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await customerService.addContact(id, contactForm);
      setIsContactModalOpen(false);
      loadCustomer360();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await customerService.addAddress(id, addressForm);
      setIsAddressModalOpen(false);
      loadCustomer360();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await customerService.addInteraction(id, interactionForm);
      setIsInteractionModalOpen(false);
      loadCustomer360();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record interaction');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveCredit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await customerService.approveCredit(id, creditForm);
      setIsCreditModalOpen(false);
      loadCustomer360();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update credit approval');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDoc = async (docId, status) => {
    try {
      await customerService.verifyDocument(id, docId, { verification_status: status });
      loadCustomer360();
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading Customer 360° profile...</div>;
  }

  if (!data?.customer) {
    return <div className="p-12 text-center text-slate-500">Customer account not found.</div>;
  }

  const { customer, contacts = [], addresses = [], documents = [], interactions = [] } = data;

  return (
    <div className="p-6">
      <PageHeader
        title={customer.company_name}
        subtitle={`Account #${customer.customer_code} • Type: ${customer.customer_type.toUpperCase()} • Segment: ${customer.segment}`}
        breadcrumbs={[
          { label: 'Commercial' },
          { label: 'Customers', path: '/customers' },
          { label: customer.company_name },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreditModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Credit Limit & Terms
            </button>
            <button
              onClick={() => {
                setInteractionForm({ interaction_type: 'call', subject: '', description: '', outcome: '' });
                setIsInteractionModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Interaction
            </button>
          </div>
        }
      />

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Authorized Credit</p>
          <p className="text-xl font-bold text-slate-900 mt-1">₹{customer.credit_limit?.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">{customer.credit_days} Days ({customer.credit_status})</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Outstanding Balance</p>
          <p className={`text-xl font-bold mt-1 ${customer.outstanding_balance > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            ₹{customer.outstanding_balance?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{customer.outstanding_balance > customer.credit_limit ? '⚠️ Credit Exceeded' : 'Within Limits'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Lifetime Orders</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{customer.total_orders_count || 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Stage: <span className="capitalize font-semibold">{customer.stage}</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Account Manager</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{customer.sales_person_id?.full_name || 'Unassigned'}</p>
          <p className="text-xs text-slate-500 mt-0.5">{customer.branch_id?.branch_name || 'HQ Branch'}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto">
        {[
          { key: 'overview', label: 'Summary Overview' },
          { key: 'contacts', label: `Key Contacts (${contacts.length})` },
          { key: 'addresses', label: `Addresses & Sites (${addresses.length})` },
          { key: 'kyc', label: `KYC & Tax Docs (${documents.length})` },
          { key: 'timeline', label: `Interaction Timeline (${interactions.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Account & Tax Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Legal Company Name:</span>
                <span className="font-semibold text-slate-800">{customer.company_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono font-bold text-slate-800">{customer.gstin || 'Unregistered'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">PAN Card:</span>
                <span className="font-mono font-bold text-slate-800">{customer.pan || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="font-semibold text-slate-800">{customer.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">{customer.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Website:</span>
                <span className="font-semibold text-indigo-600">{customer.website || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Commercial Engagement</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Assigned Price List:</span>
                <span className="font-semibold text-slate-800">{customer.price_list_id?.price_list_name || 'Standard Retail'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Last Order Date:</span>
                <span className="font-semibold text-slate-800">
                  {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'No orders recorded yet'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Last Contact / Activity:</span>
                <span className="font-semibold text-slate-800">
                  {customer.last_interaction_date ? new Date(customer.last_interaction_date).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Account Status:</span>
                <StatusBadge status={customer.status} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setContactForm({ contact_name: '', email: '', phone: '', designation: '', is_primary: false });
                setIsContactModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Key Contact
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <div key={c._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
                {c.is_primary && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                    Primary
                  </span>
                )}
                <h4 className="font-bold text-slate-900 text-sm">{c.contact_name}</h4>
                <p className="text-xs text-slate-500 mb-2">{c.designation || 'Staff'}</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email || 'No email'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone || 'No phone'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setAddressForm({ address_type: 'billing', address_line1: '', city: '', state: '', pincode: '', gstin: '', is_primary: false });
                setIsAddressModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                  {a.address_type} Address
                </span>
                <p className="font-semibold text-slate-900 text-sm mt-2">{a.address_line1}</p>
                {a.address_line2 && <p className="text-xs text-slate-500">{a.address_line2}</p>}
                <p className="text-xs text-slate-600 mt-1">
                  {a.city}, {a.state} - {a.pincode}
                </p>
                {a.gstin && <p className="text-xs text-slate-400 font-mono mt-1">GSTIN: {a.gstin}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: KYC Documents */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="min-w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">Doc / Registration No.</th>
                  <th className="px-4 py-3">File Attachment</th>
                  <th className="px-4 py-3">Verification Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                      No KYC documents submitted yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d._id}>
                      <td className="px-4 py-3 font-semibold uppercase">{d.doc_type?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-mono">{d.doc_number || '—'}</td>
                      <td className="px-4 py-3 text-indigo-600">{d.file_name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.verification_status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {d.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleVerifyDoc(d._id, 'verified')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold"
                          >
                            Verify & Approve
                          </button>
                        )}
                        {d.verification_status !== 'rejected' && (
                          <button
                            onClick={() => handleVerifyDoc(d._id, 'rejected')}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Interactions Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 max-w-3xl">
          {interactions.map((it) => (
            <div key={it._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{it.subject}</h4>
                  <span className="text-[11px] text-slate-400">{new Date(it.interaction_date).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{it.description}</p>
                {it.outcome && (
                  <p className="text-xs font-semibold text-emerald-700 mt-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    Outcome: {it.outcome}
                  </p>
                )}
                <div className="text-[11px] text-slate-400 mt-2">Conducted by: {it.conducted_by?.full_name || 'Staff'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credit Approval Modal */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="Customer Credit Terms & Limits"
      >
        <form onSubmit={handleApproveCredit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approved Credit Limit (₹) *</label>
            <input
              type="number"
              min="0"
              required
              value={creditForm.credit_limit}
              onChange={(e) => setCreditForm({ ...creditForm, credit_limit: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approved Payment Days *</label>
            <input
              type="number"
              min="0"
              required
              value={creditForm.credit_days}
              onChange={(e) => setCreditForm({ ...creditForm, credit_days: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Approval Status</label>
            <select
              value={creditForm.credit_status}
              onChange={(e) => setCreditForm({ ...creditForm, credit_status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="approved">Approved & Active</option>
              <option value="pending">Under Review / Pending</option>
              <option value="hold">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Updating...' : 'Save Credit Policy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Add Customer Contact"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
            <input
              type="text"
              required
              value={contactForm.contact_name}
              onChange={(e) => setContactForm({ ...contactForm, contact_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              value={contactForm.designation}
              onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Customer Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address Type</label>
              <select
                value={addressForm.address_type}
                onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="billing">Billing Address</option>
                <option value="shipping">Shipping / Site Address</option>
                <option value="factory">Factory</option>
                <option value="branch">Branch Office</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={addressForm.gstin}
                onChange={(e) => setAddressForm({ ...addressForm, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line *</label>
            <input
              type="text"
              required
              value={addressForm.address_line1}
              onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Adding...' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Interaction Modal */}
      <Modal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        title="Log CRM Interaction"
      >
        <form onSubmit={handleAddInteraction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interaction Type *</label>
              <select
                value={interactionForm.interaction_type}
                onChange={(e) => setInteractionForm({ ...interactionForm, interaction_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="call">Phone Call</option>
                <option value="meeting">Physical Meeting</option>
                <option value="email">Email Sent</option>
                <option value="site_visit">Site Visit / Mockup</option>
                <option value="whatsapp">WhatsApp Discussion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Agenda *</label>
              <input
                type="text"
                required
                value={interactionForm.subject}
                onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Discussion Details</label>
            <textarea
              rows={3}
              value={interactionForm.description}
              onChange={(e) => setInteractionForm({ ...interactionForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agreed Outcome / Next Step</label>
            <input
              type="text"
              value={interactionForm.outcome}
              onChange={(e) => setInteractionForm({ ...interactionForm, outcome: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInteractionModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Logging...' : 'Log Interaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Customer360Page;
