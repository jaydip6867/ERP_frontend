import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Plus, Trash2, ArrowLeft, Save, Search } from 'lucide-react';
import { salesOrderService } from '../../../services/salesOrder.service';
import { customerService } from '../../../services/customer.service';
import { adminService } from '../../../services/admin.service';
import { PageHeader } from '../../../components/shell/PageHeader';
import { ProductSelector } from '../../../components/common/ProductSelector';

export const CreateSalesOrderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_po_number: '',
    customer_po_date: '',
    branch_id: '',
    warehouse_id: '',
    payment_terms: 'Net 30 Days',
    delivery_terms: 'Door Delivery',
    expected_delivery_date: '',
    is_interstate: false,
    require_approval: false,
    notes: '',
  });

  const [items, setItems] = useState([
    {
      product_id: '',
      product_name: '',
      product_code: '',
      ordered_qty: 1,
      rate: 0,
      discount_percent: 0,
      gst_rate: 18,
    },
  ]);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [custRes, branchRes, whRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        adminService.getBranches(),
        adminService.getWarehouses(),
      ]);

      setCustomers(custRes.data || []);
      const bList = branchRes.data || [];
      const wList = whRes.data || [];
      setBranches(bList);
      setWarehouses(wList);

      setFormData((prev) => ({
        ...prev,
        customer_id: custRes.data?.[0]?._id || '',
        branch_id: bList[0]?._id || '',
        warehouse_id: wList[0]?._id || '',
      }));
    } catch (err) {
      console.error('Failed to load prerequisites:', err);
    }
  };

  const handleProductSelect = (product) => {
    setItems((prev) => {
      const newItems = [...prev];
      const targetIdx = newItems.findIndex((it) => !it.product_id);
      const itemData = {
        product_id: product._id,
        product_name: product.product_name,
        product_code: product.product_code,
        ordered_qty: 1,
        rate: product.selling_rate || 0,
        discount_percent: 0,
        gst_rate: product.gst_rate || 18,
      };

      if (targetIdx !== -1) {
        newItems[targetIdx] = itemData;
      } else {
        newItems.push(itemData);
      }
      return newItems;
    });
    setShowProductModal(false);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Tax calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let taxable = 0;
    let taxAmount = 0;

    items.forEach((it) => {
      const gross = Number(it.ordered_qty || 0) * Number(it.rate || 0);
      subtotal += gross;
      const discount = (gross * Number(it.discount_percent || 0)) / 100;
      const lineTaxable = gross - discount;
      taxable += lineTaxable;
      const tax = (lineTaxable * Number(it.gst_rate || 0)) / 100;
      taxAmount += tax;
    });

    const grand = Math.round(taxable + taxAmount);
    return { subtotal, taxable, taxAmount, grand };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }
    if (items.some((it) => !it.product_id)) {
      alert('Please select valid products for all items');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        items,
      };
      const res = await salesOrderService.createOrder(payload);
      navigate(`/sales/orders/${res.data?._id || ''}`);
    } catch (err) {
      console.error('Failed to create sales order:', err);
      alert(err.response?.data?.message || 'Error creating sales order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Create Sales Order"
        subtitle="Record a confirmed customer order for inventory reservation and fulfillment."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/sales/orders' },
          { label: 'Create' },
        ]}
        actions={
          <button
            onClick={() => navigate('/sales/orders')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Branch Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Customer & Delivery Particulars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer *</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white"
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.display_name || c.company_name} ({c.gstin || 'Unregistered'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer PO Number</label>
              <input
                type="text"
                value={formData.customer_po_number}
                onChange={(e) => setFormData({ ...formData, customer_po_number: e.target.value })}
                placeholder="e.g. PO/2026/892"
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer PO Date</label>
              <input
                type="date"
                value={formData.customer_po_date}
                onChange={(e) => setFormData({ ...formData, customer_po_date: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                required
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fulfillment Warehouse *</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                required
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.warehouse_name} ({w.warehouse_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Terms</label>
              <input
                type="text"
                value={formData.delivery_terms}
                onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_interstate}
                  onChange={(e) => setFormData({ ...formData, is_interstate: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Interstate (IGST)
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.require_approval}
                  onChange={(e) => setFormData({ ...formData, require_approval: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Require Approval
              </label>
            </div>
          </div>
        </div>

        {/* Order Line Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Order Items</h2>
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              <Search className="w-3.5 h-3.5" />
              Catalog Lookup
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 w-28">Quantity</th>
                  <th className="py-2.5 px-3 w-32">Rate (₹)</th>
                  <th className="py-2.5 px-3 w-24">Disc %</th>
                  <th className="py-2.5 px-3 w-24">GST %</th>
                  <th className="py-2.5 px-3 w-32 text-right">Taxable</th>
                  <th className="py-2.5 px-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => {
                  const gross = (Number(it.ordered_qty || 0) * Number(it.rate || 0));
                  const disc = (gross * Number(it.discount_percent || 0)) / 100;
                  const lineTaxable = gross - disc;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        {it.product_name ? (
                          <div>
                            <p className="font-semibold text-slate-900">{it.product_name}</p>
                            <p className="text-xs font-mono text-slate-500">{it.product_code}</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowProductModal(true)}
                            className="text-indigo-600 hover:underline text-xs font-semibold"
                          >
                            + Select Product
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={it.ordered_qty}
                          onChange={(e) => updateItem(idx, 'ordered_qty', e.target.value)}
                          className="w-full text-sm rounded border border-slate-300 p-1.5 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          value={it.rate}
                          onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                          className="w-full text-sm rounded border border-slate-300 p-1.5 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.discount_percent}
                          onChange={(e) => updateItem(idx, 'discount_percent', e.target.value)}
                          className="w-full text-sm rounded border border-slate-300 p-1.5 font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={it.gst_rate}
                          onChange={(e) => updateItem(idx, 'gst_rate', e.target.value)}
                          className="w-full text-sm rounded border border-slate-300 p-1.5"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                        ₹{lineTaxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { product_id: '', product_name: '', product_code: '', ordered_qty: 1, rate: 0, discount_percent: 0, gst_rate: 18 },
              ])
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-2"
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes / Terms</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special customer packaging instructions, dispatch notes..."
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
            />
          </div>

          <div className="w-full md:w-80 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">₹{totals.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxable Amount:</span>
              <span className="font-mono">₹{totals.taxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax ({formData.is_interstate ? 'IGST' : 'CGST + SGST'}):</span>
              <span className="font-mono">₹{totals.taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-600">₹{totals.grand.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Confirming Order...' : 'Confirm Sales Order'}
            </button>
          </div>
        </div>
      </form>

      {showProductModal && (
        <ProductSelector
          onSelect={handleProductSelect}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
};

export default CreateSalesOrderPage;
