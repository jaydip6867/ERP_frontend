import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Calculator,
  Save,
  ArrowLeft,
  Search,
  Package,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { salesService } from '../../services/sales.service';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { ProductSelector } from '../../components/common/ProductSelector';

export const QuotationBuilderPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [isInterstate, setIsInterstate] = useState(false);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. Prices are valid for 30 days.\n2. 50% advance along with purchase order.\n3. Delivery within 2-3 weeks from receipt of advance.'
  );

  // Line items: [{ product_id, product_name, sku, quantity, rate, discount_percent, gst_rate }]
  const [items, setItems] = useState([]);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    try {
      setLoadingLookups(true);
      const [cRes, bRes, pRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        adminService.getBranches(),
        salesService.getChannelPartners(),
      ]);
      setCustomers(cRes.data || []);
      setBranches(bRes.data || []);
      setPartners(pRes.data || []);

      if (bRes.data?.length > 0) setBranchId(bRes.data[0]._id);
      if (cRes.data?.length > 0) setCustomerId(cRes.data[0]._id);
    } catch (err) {
      console.error('Failed to load quotation lookups:', err);
    } finally {
      setLoadingLookups(false);
    }
  };

  const handleAddProduct = (product) => {
    setItems([
      ...items,
      {
        product_id: product._id,
        product_name: product.product_name,
        sku: product.sku || product.product_code,
        uom_id: product.uom_id?._id || product.uom_id,
        uom_code: product.uom_id?.uom_code || 'PCS',
        quantity: 1,
        rate: product.selling_rate || 0,
        discount_percent: 0,
        gst_rate: product.gst_rate ?? 18,
      },
    ]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Real-time Total Calculations
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discPercent = Number(item.discount_percent) || 0;
    const gstRate = Number(item.gst_rate) || 0;

    const gross = qty * rate;
    const discount = (gross * discPercent) / 100;
    const taxable = gross - discount;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterstate) {
      igst = (taxable * gstRate) / 100;
    } else {
      cgst = (taxable * (gstRate / 2)) / 100;
      sgst = (taxable * (gstRate / 2)) / 100;
    }

    subtotal += gross;
    totalDiscount += discount;
    taxableTotal += taxable;
    cgstTotal += cgst;
    sgstTotal += sgst;
    igstTotal += igst;
  });

  const grandTotalExact = taxableTotal + cgstTotal + sgstTotal + igstTotal;
  const grandTotal = Math.round(grandTotalExact);
  const roundOff = Number((grandTotal - grandTotalExact).toFixed(2));
  const requiresApproval = items.some((i) => Number(i.discount_percent) > 15);

  const handleSubmit = async (status = 'draft') => {
    if (!customerId) return alert('Please select a customer');
    if (!branchId) return alert('Please select a branch');
    if (items.length === 0) return alert('Please add at least one line item');

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + Number(validDays));

    const payload = {
      customer_id: customerId,
      branch_id: branchId,
      channel_partner_id: partnerId || null,
      is_interstate: isInterstate,
      valid_until: validUntilDate,
      notes,
      terms_and_conditions: terms,
      items,
      status: status === 'submit' ? 'pending_approval' : 'draft',
    };

    try {
      setSaving(true);
      const res = await salesService.createQuotation(payload);
      alert(`Quotation #${res.data?.quotation_number} generated successfully!`);
      navigate(`/sales/quotations/${res.data?._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      <PageHeader
        title="Quotation Builder & Pricing Engine"
        subtitle="Construct compliant GST quotations with line item margins, tiered partner commissions, and real-time tax breakdowns."
        breadcrumbs={[
          { label: 'Commercial' },
          { label: 'Quotations', path: '/sales/quotations' },
          { label: 'New Quotation' },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('submit')}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              Submit for Approval
            </button>
          </div>
        }
      />

      {requiresApproval && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900">⚠️ Special Discount Approval Required:</span>
            <span>One or more items exceed the standard 15% discount limit. Manager approval will be required.</span>
          </div>
        </div>
      )}

      {/* Header Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Customer & Commercial Header</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Account *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.company_name} ({c.customer_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fulfilling Branch *</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Partner (Optional)</label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Direct Sale (No Partner)</option>
              {partners.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.partner_name} ({p.commission_percent}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quote Validity (Days)</label>
            <input
              type="number"
              min="1"
              value={validDays}
              onChange={(e) => setValidDays(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInterstate}
              onChange={(e) => setIsInterstate(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Interstate Supply (Calculate IGST instead of CGST+SGST)
            </span>
          </label>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Line Items & Products ({items.length})</h3>
          <button
            type="button"
            onClick={() => setIsProductSelectorOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
            No products added yet. Click "+ Add Product Item" to select products from the catalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">Item Description</th>
                  <th className="px-3 py-2.5 w-24">Qty</th>
                  <th className="px-3 py-2.5 w-28">Rate (₹)</th>
                  <th className="px-3 py-2.5 w-24">Disc %</th>
                  <th className="px-3 py-2.5 w-24">GST %</th>
                  <th className="px-3 py-2.5 text-right w-28">Total (₹)</th>
                  <th className="px-2 py-2.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item, idx) => {
                  const qty = Number(item.quantity) || 0;
                  const rate = Number(item.rate) || 0;
                  const disc = Number(item.discount_percent) || 0;
                  const gst = Number(item.gst_rate) || 0;
                  const taxable = qty * rate * (1 - disc / 100);
                  const total = taxable * (1 + gst / 100);

                  return (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <span className="font-semibold text-slate-900 block">{item.product_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(idx, 'rate', Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount_percent}
                          onChange={(e) => handleUpdateItem(idx, 'discount_percent', Number(e.target.value))}
                          className={`w-full px-2 py-1 text-xs border rounded ${
                            item.discount_percent > 15 ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-slate-600">{item.gst_rate}%</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                        ₹{total.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Calculation Summary Footer */}
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Visible Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Delivery lead time 15 days, freight extra at actuals."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Gross):</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discounts:</span>
                <span className="font-mono">-₹{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
                <span>Taxable Total:</span>
                <span className="font-mono">₹{taxableTotal.toFixed(2)}</span>
              </div>

              {!isInterstate ? (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST:</span>
                    <span className="font-mono">₹{cgstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST:</span>
                    <span className="font-mono">₹{sgstTotal.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-500">
                  <span>IGST:</span>
                  <span className="font-mono">₹{igstTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Round Off:</span>
                <span className="font-mono">₹{roundOff.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t-2 border-slate-300">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-600">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Selector Dialog */}
      <ProductSelector
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onSelect={handleAddProduct}
      />
    </div>
  );
};
export default QuotationBuilderPage;
