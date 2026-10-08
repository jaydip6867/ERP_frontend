import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Building2,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Layers,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const InquiriesQuotationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);

  // Status Update Modal (Accept/Reject/Quoted)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    status: 'accepted',
    quoted_price: '',
    quoted_delivery_date: '',
    quoted_remarks: '',
    accept_reason: '',
    reject_reason: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Create Form State
  const [creating, setCreating] = useState(false);
  const [categorySuppliers, setCategorySuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    category_name: '',
    expected_delivery_date: '',
    remarks: '',
    items: [
      {
        item_name: '',
        quantity: 1,
        uom: 'Nos',
        target_price: '',
        description: '',
      },
    ],
    selectedSuppliers: [], // array of supplier objects { _id, supplier_name, mobile, email, contact_person }
  });

  // Load inquiries and categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [search, statusFilter, categoryFilter]);

  const loadCategories = async () => {
    try {
      const res = await purchaseService.getCategories();
      const list = Array.isArray(res.data) ? res.data : [];
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getInquiries({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        limit: 50,
      });
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.inquiries)
        ? res.data.inquiries
        : [];
      setInquiries(list);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  // When category changes in Create form, load suppliers of that category
  const handleCategoryChange = async (catId) => {
    const sel = categories.find((c) => c._id === catId || c.code === catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      category_name: sel ? sel.name : '',
      selectedSuppliers: [],
    }));

    if (!catId) {
      setCategorySuppliers([]);
      return;
    }

    try {
      setLoadingSuppliers(true);
      const res = await purchaseService.getSuppliers({
        category: sel?.code || catId,
        category_id: catId,
        limit: 100,
      });
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.suppliers)
        ? res.data.suppliers
        : [];
      setCategorySuppliers(list);
      // Auto-select all suppliers by default for convenience
      setFormData((prev) => ({
        ...prev,
        selectedSuppliers: list.map((s) => ({
          supplier_id: s._id,
          supplier_name: s.supplier_name,
          contact_person: s.contact_person || '',
          mobile: s.mobile || '',
          email: s.email || '',
        })),
      }));
    } catch (err) {
      console.error('Failed to fetch suppliers for category:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Supplier selection toggle
  const toggleSupplierSelection = (sup) => {
    setFormData((prev) => {
      const exists = prev.selectedSuppliers.some((s) => s.supplier_id === sup._id);
      if (exists) {
        return {
          ...prev,
          selectedSuppliers: prev.selectedSuppliers.filter((s) => s.supplier_id !== sup._id),
        };
      } else {
        return {
          ...prev,
          selectedSuppliers: [
            ...prev.selectedSuppliers,
            {
              supplier_id: sup._id,
              supplier_name: sup.supplier_name,
              contact_person: sup.contact_person || '',
              mobile: sup.mobile || '',
              email: sup.email || '',
            },
          ],
        };
      }
    });
  };

  const toggleSelectAllSuppliers = () => {
    if (formData.selectedSuppliers.length === categorySuppliers.length) {
      setFormData((prev) => ({ ...prev, selectedSuppliers: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedSuppliers: categorySuppliers.map((s) => ({
          supplier_id: s._id,
          supplier_name: s.supplier_name,
          contact_person: s.contact_person || '',
          mobile: s.mobile || '',
          email: s.email || '',
        })),
      }));
    }
  };

  // Items table handlers
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: '',
          quantity: 1,
          uom: 'Nos',
          target_price: '',
          description: '',
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Build formatted WhatsApp message
  const generateWhatsAppMessage = (inqNumber, title, categoryName, items, remarks) => {
    let msg = `*INQUIRY / REQUEST FOR QUOTATION (RFQ)*\n`;
    if (inqNumber) msg += `*Inquiry Ref:* ${inqNumber}\n`;
    msg += `*Subject:* ${title || 'Requirement for Materials'}\n`;
    if (categoryName) msg += `*Category:* ${categoryName}\n`;
    msg += `----------------------------------------\n`;
    msg += `*REQUIRED ITEMS:*\n`;

    items.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.item_name || 'Item'}* - ${it.quantity} ${it.uom || 'Nos'}`;
      if (it.target_price) msg += ` (Target Rate: ₹${it.target_price})`;
      if (it.description) msg += `\n   Note: ${it.description}`;
      msg += `\n`;
    });

    if (remarks) {
      msg += `----------------------------------------\n`;
      msg += `*Remarks:* ${remarks}\n`;
    }

    msg += `----------------------------------------\n`;
    msg += `Please send us your best quotation, payment terms, and delivery lead time at the earliest.\n`;
    msg += `Thank you,\n*Danza ERP Procurement Team*`;

    return msg;
  };

  // Open WhatsApp Link
  const handleSendWhatsApp = (mobile, inq, supName) => {
    const rawNumber = (mobile || '').replace(/\D/g, '');
    let formattedPhone = rawNumber;
    if (rawNumber.length === 10) {
      formattedPhone = '91' + rawNumber;
    }
    const msg = generateWhatsAppMessage(
      inq.inquiry_number,
      inq.title,
      inq.category_name,
      inq.items || [],
      inq.remarks
    );
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
      `Hello ${supName || 'Supplier'},\n\n` + msg
    )}`;
    window.open(url, '_blank');
  };

  // Submit Create Inquiry
  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an inquiry title');
      return;
    }
    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }
    if (formData.selectedSuppliers.length === 0) {
      alert('Please select at least one supplier to send the inquiry to');
      return;
    }
    const validItems = formData.items.filter((it) => it.item_name.trim());
    if (validItems.length === 0) {
      alert('Please enter at least one item');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        title: formData.title.trim(),
        category_id: formData.category_id,
        category_name: formData.category_name,
        expected_delivery_date: formData.expected_delivery_date || undefined,
        remarks: formData.remarks,
        items: validItems.map((it) => ({
          item_name: it.item_name.trim(),
          quantity: Number(it.quantity) || 1,
          uom: it.uom || 'Nos',
          target_price: it.target_price ? Number(it.target_price) : 0,
          description: it.description || '',
        })),
        suppliers: formData.selectedSuppliers.map((s) => ({
          supplier_id: s.supplier_id,
          supplier_name: s.supplier_name,
          contact_person: s.contact_person,
          mobile: s.mobile,
          email: s.email,
          sent_via: 'whatsapp',
          status: 'pending',
        })),
      };

      const res = await purchaseService.createInquiry(payload);
      alert('Supplier Inquiry created successfully!');

      // Reset form
      setFormData({
        title: '',
        category_id: '',
        category_name: '',
        expected_delivery_date: '',
        remarks: '',
        items: [{ item_name: '', quantity: 1, uom: 'Nos', target_price: '', description: '' }],
        selectedSuppliers: [],
      });
      setActiveTab('list');
      await loadInquiries();
    } catch (err) {
      console.error('Error creating inquiry:', err);
      alert(err.response?.data?.message || 'Failed to create inquiry');
    } finally {
      setCreating(false);
    }
  };

  // Open Status Modal (Accept / Reject / Quoted)
  const handleOpenStatusModal = (inquiry, supplier) => {
    setActiveInquiry(inquiry);
    setActiveSupplier(supplier);
    setStatusFormData({
      status: supplier.status === 'pending' ? 'quoted' : supplier.status,
      quoted_price: supplier.quoted_price ?? '',
      quoted_delivery_date: supplier.quoted_delivery_date
        ? new Date(supplier.quoted_delivery_date).toISOString().split('T')[0]
        : '',
      quoted_remarks: supplier.quoted_remarks || '',
      accept_reason: supplier.accept_reason || '',
      reject_reason: supplier.reject_reason || '',
    });
    setStatusModalOpen(true);
  };

  // Submit Status Update
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!activeInquiry || !activeSupplier) return;

    if (statusFormData.status === 'accepted' && !statusFormData.accept_reason.trim()) {
      alert('Please provide an Accept Reason (e.g., lowest quotation, verified quality, immediate availability)');
      return;
    }
    if (statusFormData.status === 'rejected' && !statusFormData.reject_reason.trim()) {
      alert('Please provide a Reject Reason (e.g., rate too high, delivery lead time unacceptable)');
      return;
    }

    try {
      setUpdatingStatus(true);
      await purchaseService.updateSupplierQuotationStatus(
        activeInquiry._id,
        activeSupplier._id || activeSupplier.supplier_id,
        {
          status: statusFormData.status,
          quoted_price: statusFormData.quoted_price ? Number(statusFormData.quoted_price) : undefined,
          quoted_delivery_date: statusFormData.quoted_delivery_date || undefined,
          quoted_remarks: statusFormData.quoted_remarks,
          accept_reason: statusFormData.accept_reason,
          reject_reason: statusFormData.reject_reason,
        }
      );

      setStatusModalOpen(false);
      await loadInquiries();
    } catch (err) {
      console.error('Failed to update supplier quotation status:', err);
      alert(err.response?.data?.message || 'Failed to update quotation status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Inquiries & Quotations (RFQ)"
        subtitle="Generate supplier inquiries by category, broadcast via WhatsApp, and record acceptance/rejection with reasons."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'Inquiries & Quotations' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'list'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Inquiries List ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'create'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create New Inquiry
            </button>
          </div>
        }
      />

      {/* TAB 1: INQUIRIES LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Inquiry #, subject, or supplier name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-44 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="in_review">In Review</option>
                <option value="partially_accepted">Partially Accepted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Inquiries Cards */}
          {loading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-slate-500">
              Loading inquiries...
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No Supplier Inquiries Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No inquiries match your search or filter. Click 'Create New Inquiry' to generate a quotation request for suppliers.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" /> Create First Inquiry
              </button>
            </div>
          ) : (
            inquiries.map((inq) => {
              const isExpanded = expandedInquiryId === inq._id;
              const acceptedCount = inq.suppliers?.filter((s) => s.status === 'accepted').length || 0;
              const rejectedCount = inq.suppliers?.filter((s) => s.status === 'rejected').length || 0;
              const quotedCount = inq.suppliers?.filter((s) => s.status === 'quoted').length || 0;
              const pendingCount = inq.suppliers?.filter((s) => s.status === 'pending').length || 0;

              return (
                <div
                  key={inq._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300"
                >
                  {/* Inquiry Header */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-900 text-white rounded-md">
                          {inq.inquiry_number}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inq.category_name || inq.category_id?.name || 'General Category'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(inq.inquiry_date || inq.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 pt-1">{inq.title}</h4>
                      {inq.remarks && (
                        <p className="text-xs text-slate-500 italic max-w-2xl">{inq.remarks}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {/* Summary status pills */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-200">
                          {acceptedCount} Accepted
                        </span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-semibold border border-rose-200">
                          {rejectedCount} Rejected
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold border border-blue-200">
                          {quotedCount} Quoted
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-semibold border border-amber-200">
                          {pendingCount} Pending
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedInquiryId(isExpanded ? null : inq._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition ml-2"
                      >
                        {isExpanded ? (
                          <>
                            Hide Suppliers <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View Suppliers ({inq.suppliers?.length || 0}) <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Items summary strip */}
                  <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      Items ({inq.items?.length || 0}):
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {inq.items?.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-medium"
                        >
                          {it.item_name} &bull; <strong>{it.quantity}</strong> {it.uom}
                          {it.target_price ? ` (₹${it.target_price})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Suppliers Section (Expanded or default compact) */}
                  <div className="p-4 sm:p-5">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Suppliers Broadcasted ({inq.suppliers?.length || 0})</span>
                      <span className="text-slate-400 font-normal">
                        Click 'WhatsApp RFQ' to dispatch message or 'Record Response' to accept/reject
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inq.suppliers?.map((sup) => {
                        const statusColors = {
                          pending: 'bg-amber-50 text-amber-700 border-amber-200',
                          quoted: 'bg-blue-50 text-blue-700 border-blue-200',
                          accepted: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200',
                          rejected: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-200',
                        };

                        return (
                          <div
                            key={sup._id}
                            className={`p-3.5 rounded-xl border transition ${
                              sup.status === 'accepted'
                                ? 'bg-emerald-50/30 border-emerald-200 shadow-sm'
                                : sup.status === 'rejected'
                                ? 'bg-rose-50/20 border-rose-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-bold text-sm text-slate-900">{sup.supplier_name}</h5>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  {sup.mobile && (
                                    <span className="flex items-center gap-1 font-mono">
                                      <Phone className="w-3 h-3 text-emerald-600" />
                                      {sup.mobile}
                                    </span>
                                  )}
                                  {sup.contact_person && <span>&bull; {sup.contact_person}</span>}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                  statusColors[sup.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {sup.status}
                              </span>
                            </div>

                            {/* Response Details Display */}
                            {sup.status === 'quoted' && (
                              <div className="mt-2.5 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
                                <div className="font-semibold flex items-center justify-between">
                                  <span>Quoted Price:</span>
                                  <span className="font-mono text-sm text-blue-800 font-bold">
                                    ₹{(sup.quoted_price || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                {sup.quoted_remarks && (
                                  <div className="text-[11px] text-blue-700 italic">
                                    "{sup.quoted_remarks}"
                                  </div>
                                )}
                              </div>
                            )}

                            {sup.status === 'accepted' && (
                              <div className="mt-2.5 p-2 rounded-lg bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                                {sup.quoted_price && (
                                  <div className="font-semibold flex items-center justify-between">
                                    <span>Agreed Rate:</span>
                                    <span className="font-mono text-sm font-bold text-emerald-800">
                                      ₹{sup.quoted_price.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                )}
                                <div className="text-[11px]">
                                  <strong className="text-emerald-800">Accept Reason:</strong>{' '}
                                  <span className="font-medium">{sup.accept_reason || 'Quotation Approved'}</span>
                                </div>
                              </div>
                            )}

                            {sup.status === 'rejected' && (
                              <div className="mt-2.5 p-2 rounded-lg bg-rose-100/60 border border-rose-200 text-xs text-rose-950 space-y-1">
                                <div className="text-[11px]">
                                  <strong className="text-rose-800">Reject Reason:</strong>{' '}
                                  <span className="font-medium">{sup.reject_reason || 'Quotation Rejected'}</span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons for Supplier */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <button
                                onClick={() => handleSendWhatsApp(sup.mobile, inq, sup.supplier_name)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                title="Send formatted RFQ on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                WhatsApp RFQ
                              </button>

                              <button
                                onClick={() => handleOpenStatusModal(inq, sup)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition"
                              >
                                Record Response
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: CREATE NEW INQUIRY / QUOTATION */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateInquiry} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">1. Inquiry Overview & Category</h3>
              <p className="text-xs text-slate-500">
                Select the supplier category to automatically filter available vendors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Requirement for Cotton Yarn & Gray Fabric (Q4 2026)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Delivery Date (Target)
                </label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Notes / Delivery Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Material test certificate required with quotation. F.O.R. Danza factory delivery."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Supplier Selection for Chosen Category */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Select Recipient Suppliers ({formData.selectedSuppliers.length} selected)
                </h3>
                <p className="text-xs text-slate-500">
                  {formData.category_name
                    ? `Suppliers classified under "${formData.category_name}":`
                    : 'Select a category above to load suppliers'}
                </p>
              </div>

              {categorySuppliers.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllSuppliers}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {formData.selectedSuppliers.length === categorySuppliers.length
                    ? 'Deselect All'
                    : 'Select All Suppliers'}
                </button>
              )}
            </div>

            {loadingSuppliers ? (
              <p className="text-xs text-slate-500 italic py-4">Loading suppliers for selected category...</p>
            ) : !formData.category_id ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Please select a Supplier Category in Section 1 to view and select suppliers.
              </div>
            ) : categorySuppliers.length === 0 ? (
              <div className="p-6 text-center text-xs text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
                No active suppliers found in this category. You can add or update suppliers in the{' '}
                <a href="/purchase/suppliers" className="font-bold underline">
                  Suppliers Directory
                </a>
                .
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categorySuppliers.map((sup) => {
                  const isChecked = formData.selectedSuppliers.some((s) => s.supplier_id === sup._id);
                  return (
                    <label
                      key={sup._id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition select-none ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSupplierSelection(sup)}
                        className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {sup.supplier_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{sup.mobile || 'No mobile'}</span>
                          {sup.contact_person && <span>&bull; {sup.contact_person}</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Items Required Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">3. Items Required for Quotation</h3>
                <p className="text-xs text-slate-500">Specify material details, quantities, and target prices.</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Item / Product Name *</th>
                    <th className="py-2.5 px-3 min-w-[100px]">Quantity *</th>
                    <th className="py-2.5 px-3 min-w-[100px]">UOM</th>
                    <th className="py-2.5 px-3 min-w-[120px]">Target Price (₹)</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Specifications / Specs</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          required
                          placeholder="e.g. 100% Cotton Yarn 30s Carded"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          required
                          min="0.001"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={item.uom}
                          onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="Nos">Nos</option>
                          <option value="Kg">Kg</option>
                          <option value="Meters">Meters</option>
                          <option value="Bags">Bags</option>
                          <option value="Boxes">Boxes</option>
                          <option value="Tons">Tons</option>
                          <option value="Liters">Liters</option>
                          <option value="Pcs">Pcs</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="Optional"
                          value={item.target_price}
                          onChange={(e) => handleItemChange(idx, 'target_price', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Quality, grade, GSM, etc."
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          disabled={formData.items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WhatsApp RFQ Message Live Preview */}
          <div className="bg-slate-900 rounded-xl p-5 text-white space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp RFQ Message Live Preview</span>
            </div>
            <pre className="bg-slate-800/80 p-4 rounded-lg font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-700">
              {generateWhatsAppMessage(
                'INQ-2026-XXXXX',
                formData.title || '[Inquiry Title]',
                formData.category_name || '[Category]',
                formData.items,
                formData.remarks
              )}
            </pre>
            <p className="text-[11px] text-slate-400">
              Note: Once created, this message is ready to be sent to all {formData.selectedSuppliers.length} selected
              suppliers via WhatsApp web / API.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {creating ? 'Broadcasting Inquiry...' : 'Create Inquiry & Dispatch RFQ'}
            </button>
          </div>
        </form>
      )}

      {/* Record Response Modal (Accept / Reject / Quoted) */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Record Quotation Response: ${activeSupplier?.supplier_name || 'Supplier'}`}
        size="md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div>
              <strong>Inquiry:</strong> {activeInquiry?.inquiry_number} &bull; {activeInquiry?.title}
            </div>
            <div>
              <strong>Supplier:</strong> {activeSupplier?.supplier_name} ({activeSupplier?.mobile || 'No Phone'})
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Response Decision / Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatusFormData({ ...statusFormData, status: 'quoted' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  statusFormData.status === 'quoted'
                    ? 'bg-blue-50 text-blue-800 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Quoted Rate
              </button>

              <button
                type="button"
                onClick={() => setStatusFormData({ ...statusFormData, status: 'accepted' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  statusFormData.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ✓ Accept Quote
              </button>

              <button
                type="button"
                onClick={() => setStatusFormData({ ...statusFormData, status: 'rejected' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  statusFormData.status === 'rejected'
                    ? 'bg-rose-50 text-rose-800 border-rose-500 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ✕ Reject Quote
              </button>
            </div>
          </div>

          {/* Quoted Price & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quoted Rate / Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 245.50"
                value={statusFormData.quoted_price}
                onChange={(e) => setStatusFormData({ ...statusFormData, quoted_price: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Delivery Commitment
              </label>
              <input
                type="date"
                value={statusFormData.quoted_delivery_date}
                onChange={(e) => setStatusFormData({ ...statusFormData, quoted_delivery_date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Remarks / Quoted Terms
            </label>
            <input
              type="text"
              placeholder="e.g. Rate includes freight. Net 30 days payment."
              value={statusFormData.quoted_remarks}
              onChange={(e) => setStatusFormData({ ...statusFormData, quoted_remarks: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Conditional Accept Reason */}
          {statusFormData.status === 'accepted' && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
              <label className="block text-xs font-bold text-emerald-900">
                Reason for Acceptance <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Explain why this quotation was accepted (e.g. Lowest L1 bidder, verified quality, immediate dispatch)"
                value={statusFormData.accept_reason}
                onChange={(e) => setStatusFormData({ ...statusFormData, accept_reason: e.target.value })}
                className="w-full border border-emerald-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
              />
            </div>
          )}

          {/* Conditional Reject Reason */}
          {statusFormData.status === 'rejected' && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
              <label className="block text-xs font-bold text-rose-900">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Explain why this quotation was rejected (e.g. Exceeded budget threshold, delayed delivery lead time, non-standard specifications)"
                value={statusFormData.reject_reason}
                onChange={(e) => setStatusFormData({ ...statusFormData, reject_reason: e.target.value })}
                className="w-full border border-rose-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className={`px-4 py-2 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                statusFormData.status === 'accepted'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : statusFormData.status === 'rejected'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {updatingStatus ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InquiriesQuotationsPage;
