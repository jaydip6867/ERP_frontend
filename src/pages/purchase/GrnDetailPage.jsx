import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PackageCheck,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Warehouse,
  UserCheck,
  AlertCircle,
  FileText,
  FileUp,
  Image,
  X,
  ExternalLink,
  Download,
  Paperclip,
} from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { adminService } from '../../services/admin.service';
import { useAppStore } from '../../store/useAppStore';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/shell/StatusBadge';
import { Modal } from '../../components/shell/Modal';

export const GrnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Warehouse selection & user posting modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [postRemarks, setPostRemarks] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState('');

  useEffect(() => {
    if (id === 'new' || id === 'create') {
      navigate('/purchase/grn', { replace: true });
      return;
    }
    if (!id || id === 'undefined') {
      navigate('/purchase/grn', { replace: true });
      return;
    }
    loadGrn();
    loadWarehouses();
  }, [id]);

  const loadWarehouses = async () => {
    try {
      const res = await adminService.getWarehouses();
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.warehouses)
        ? res.data.warehouses
        : [];
      setWarehouses(list);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const loadGrn = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getGrnById(id);
      setGrn(res.data);
      if (res.data?.warehouse_id?._id || res.data?.warehouse_id) {
        setSelectedWarehouse(res.data.warehouse_id?._id || res.data.warehouse_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPostModal = () => {
    const defaultWh =
      grn?.warehouse_id?._id ||
      grn?.warehouse_id ||
      (warehouses.length > 0 ? (warehouses[0]._id || warehouses[0].id) : '');
    setSelectedWarehouse(defaultWh);
    setPostRemarks('');
    setAttachmentPreview('');
    setAttachmentName('');
    setAttachmentType('');
    setIsPostModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit. Please choose a smaller file.');
      return;
    }

    setAttachmentName(file.name);
    setAttachmentType(file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setAttachmentPreview('');
    setAttachmentName('');
    setAttachmentType('');
  };

  const handleConfirmPostToStock = async (e) => {
    if (e) e.preventDefault();
    if (!selectedWarehouse) {
      alert('Please select the destination warehouse for this inventory inward.');
      return;
    }

    try {
      setActionLoading(true);
      await purchaseService.postGrnToStock(id, {
        warehouse_id: selectedWarehouse,
        remarks: postRemarks,
        file_data: attachmentPreview || undefined,
        attachment_name: attachmentName || undefined,
        attachment_type: attachmentType || undefined,
      });
      setIsPostModalOpen(false);
      await loadGrn();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting GRN to inventory');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !grn) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={`GRN: ${grn.grn_number}`}
        subtitle={`Received on ${new Date(grn.grn_date).toLocaleDateString('en-IN')}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchase', href: '/purchase' },
          { label: 'GRN', href: '/purchase/grn' },
          { label: grn.grn_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/purchase/grn')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {!grn.stock_posted && (
              <button
                disabled={actionLoading}
                onClick={handleOpenPostModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading ? 'Posting...' : 'Accept & Post to Inventory'}
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">GRN Status</p>
          <div className="mt-1"><StatusBadge status={grn.status} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Supplier</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{grn.supplier_id?.supplier_name}</p>
          <p className="text-xs text-slate-500">PO: {grn.po_id?.po_number || 'Direct'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Challan & Vehicle</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{grn.vendor_challan_no || 'N/A'}</p>
          <p className="text-xs text-slate-500 font-mono">{grn.vehicle_number || ''}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Stock Integration</p>
          <p className="text-sm font-bold mt-1 text-slate-800">
            {grn.stock_posted ? '✅ Atomic Ledger Posted' : '⏳ Awaiting Stock Inward'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Received Line Items & Lots</h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
            <tr>
              <th className="py-2.5 px-4">Item</th>
              <th className="py-2.5 px-3 text-center">Received Qty</th>
              <th className="py-2.5 px-3 text-center">Accepted Qty</th>
              <th className="py-2.5 px-3">Batch Number</th>
              <th className="py-2.5 px-3">QC Status</th>
              <th className="py-2.5 px-4 text-right">Unit Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {grn.items?.map((it, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{it.product_id?.product_name}</p>
                  <p className="text-xs font-mono text-slate-500">{it.product_id?.product_code}</p>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">{it.received_qty}</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-700">{it.accepted_qty || it.received_qty}</td>
                <td className="py-3 px-3 font-mono text-indigo-700 font-medium">{it.batch_number || 'Auto-lot'}</td>
                <td className="py-3 px-3 capitalize">{it.qc_status}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold">₹{it.unit_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attached Inward / QC Documents */}
      {(grn.attachment_url || (grn.documents && grn.documents.length > 0)) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-brand" />
              Attached Inward Proof / QC Document
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grn.attachment_url && (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex-shrink-0">
                    {grn.attachment_type?.includes('pdf') || grn.attachment_name?.toLowerCase().endsWith('.pdf') ? (
                      <FileText className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Image className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{grn.attachment_name || 'Inward Document'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Uploaded Document</p>
                  </div>
                </div>
                <a
                  href={grn.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand hover:border-brand/40 shadow-2xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            )}
            {grn.documents?.filter((d) => d.file_url !== grn.attachment_url).map((doc, dIdx) => (
              <div key={dIdx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex-shrink-0">
                    {doc.file_type?.includes('pdf') || doc.file_name?.toLowerCase().endsWith('.pdf') ? (
                      <FileText className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Image className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.file_name || 'Document'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN') : 'Uploaded'}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand hover:border-brand/40 shadow-2xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Assignment & User Record Modal */}
      {isPostModalOpen && (
        <Modal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          title="Accept & Post GRN to Inventory"
          subtitle={`GRN: ${grn.grn_number} • Supplier: ${grn.supplier_id?.supplier_name || 'N/A'}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleConfirmPostToStock} className="space-y-5 text-sm">
            {/* Target Warehouse Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-brand" />
                Select Destination Warehouse *
              </label>
              <select
                required
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
              >
                <option value="">-- Choose Target Warehouse --</option>
                {warehouses.map((wh) => (
                  <option key={wh._id || wh.id} value={wh._id || wh.id}>
                    {wh.warehouse_name} ({wh.warehouse_code || 'WH'}) - {wh.city || wh.state || 'Primary'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Material quantities and lot batches will be credited into this warehouse's stock ledger.
              </p>
            </div>

            {/* Posting Officer / User Audit Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Posting Officer / Verified By
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{user?.full_name || 'Authorized Store User'}</p>
                  <p className="text-xs text-slate-500">
                    {user?.email || 'user@danzaerp.com'} &bull; Role:{' '}
                    <span className="capitalize font-semibold text-slate-700">{user?.role || 'Store Keeper'}</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Audit Stored
                </span>
              </div>
              <p className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5 mt-1">
                Your user account record will be permanently linked to this stock posting and ledger entry.
              </p>
            </div>

            {/* Goods Summary */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/60 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Items Being Posted ({grn.items?.length || 0})</span>
                <span>
                  Total Accepted: {grn.items?.reduce((s, it) => s + (it.accepted_qty || it.received_qty || 0), 0)} units
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                {grn.items?.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{it.product_id?.product_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{it.product_id?.product_code}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700">{it.accepted_qty || it.received_qty} units</span>
                      <p className="text-[11px] font-mono text-slate-500">{it.batch_number || 'Auto-Lot'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document / PDF / Image Proof Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-brand" />
                Upload Inward Document / Vendor Challan / QC Proof (PDF or Image)
              </label>
              {!attachmentPreview ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-brand/60 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition group">
                  <div className="p-2.5 rounded-full bg-white shadow-xs border border-slate-200 group-hover:scale-105 transition">
                    <FileUp className="w-5 h-5 text-brand" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 mt-2">
                    Click to select file or drag &amp; drop
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Supports PDF, PNG, JPG, JPEG, WEBP (Max 8MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf, image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex-shrink-0">
                      {attachmentType.includes('pdf') || attachmentName.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="w-5 h-5 text-rose-500" />
                      ) : (
                        <Image className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{attachmentName}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{attachmentType || 'Attachment'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer flex-shrink-0"
                    title="Remove File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Remarks / Inward Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storage Rack / Verification Remarks (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Inwarded to Aisle 3, Rack B-12. Verified physical condition and seal intact."
                value={postRemarks}
                onChange={(e) => setPostRemarks(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionLoading ? 'Posting to Warehouse...' : 'Accept & Post to Inventory'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GrnDetailPage;
