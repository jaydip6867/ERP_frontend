import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Search,
  ShoppingCart,
  DollarSign,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { salesService } from '../../services/sales.service';
import { productService } from '../../services/product.service';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Modal } from '../../components/shell/Modal';

export const RetailPosPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState('');

  // Cart: [{ product_id, product_name, sku, quantity, rate, discount_amount, gst_rate, total }]
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');

  // Completed Receipt Modal
  const [completedSale, setCompletedSale] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (search.length > 1) {
      searchProducts();
    } else {
      setCatalog([]);
    }
  }, [search]);

  const loadInitial = async () => {
    try {
      const res = await adminService.getBranches();
      setBranches(res.data || []);
      if (res.data?.length > 0) setSelectedBranch(res.data[0]._id);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const searchProducts = async () => {
    try {
      const res = await productService.getProducts({ search, limit: 8 });
      setCatalog(res.data || []);
    } catch (err) {
      console.error('Catalog search failed:', err);
    }
  };

  const addToCart = (product) => {
    const existingIndex = cart.findIndex((i) => i.product_id === product._id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          product_id: product._id,
          product_name: product.product_name,
          sku: product.sku,
          quantity: 1,
          rate: product.selling_rate || 0,
          discount_amount: 0,
          gst_rate: product.gst_rate ?? 18,
        },
      ]);
    }
    setSearch('');
  };

  const updateCartQty = (idx, delta) => {
    const updated = [...cart];
    updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
    setCart(updated);
  };

  const removeFromCart = (idx) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  // Calculations
  let subtotal = 0;
  let taxTotal = 0;
  cart.forEach((i) => {
    const itemSub = i.quantity * i.rate - (i.discount_amount || 0);
    const tax = (itemSub * (i.gst_rate || 18)) / 100;
    subtotal += itemSub;
    taxTotal += tax;
  });

  const grandTotal = Math.round(subtotal + taxTotal);
  const paidVal = Number(amountPaid) || grandTotal;
  const changeDue = Math.max(0, paidVal - grandTotal);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!selectedBranch) return alert('Please select retail store branch');

    const payload = {
      branch_id: selectedBranch,
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_mode: paymentMode,
      amount_paid: paidVal,
      items: cart,
    };

    try {
      setProcessing(true);
      const res = await salesService.createPosSale(payload);
      setCompletedSale(res.data);
      setCart([]);
      setAmountPaid('');
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Retail POS Terminal"
        subtitle="Fast multi-lane point-of-sale checkout, barcode scanning, UPI/Cash split, and automated receipt printing."
        breadcrumbs={[{ label: 'Commercial' }, { label: 'Retail POS' }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Store Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Search & Quick Add */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan barcode or type product name/SKU..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                autoFocus
              />
            </div>

            {catalog.length > 0 && (
              <div className="mt-3 divide-y divide-slate-100 max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                {catalog.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => addToCart(p)}
                    className="p-3 hover:bg-indigo-50/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-sm text-slate-900 block">{p.product_name}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {p.sku} • Stock: {p.current_stock}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900 block font-mono">
                        ₹{p.selling_rate?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">+ Add Item</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Current Transaction Items ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic">
                Cart is empty. Scan an item or search above to begin checkout.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-slate-900 block">{item.product_name}</span>
                      <span className="text-xs text-slate-400 font-mono">₹{item.rate} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQty(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-24">
                      <span className="font-mono font-bold text-slate-900 text-sm block">
                        ₹{(item.quantity * item.rate).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">GST: {item.gst_rate}%</span>
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tender & Settlement */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm">Customer & Settlement</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile (for SMS Receipt)</label>
                <input
                  type="text"
                  placeholder="+91"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['cash', 'upi', 'card'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border transition ${
                      paymentMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Taxable):</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST:</span>
                <span className="font-mono">₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-slate-900 pt-2 border-t border-slate-200">
                <span>Net Payable:</span>
                <span className="font-mono text-indigo-600">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Tender Amount & Change Due */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tender / Received</label>
                <input
                  type="number"
                  placeholder={`₹${grandTotal}`}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Change Due</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg font-mono font-bold text-sm text-slate-800">
                  ₹{changeDue.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing || cart.length === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {processing ? 'Processing Payment...' : `Complete Sale (₹${grandTotal.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>

      {/* POS Receipt Modal */}
      <Modal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        title="Payment Successful & POS Receipt"
        maxWidth="max-w-md"
      >
        {completedSale && (
          <div className="space-y-4 text-xs font-mono">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h4 className="font-sans font-black text-base text-slate-900">DANZA ERP RETAIL</h4>
              <p className="text-[11px] text-slate-500 font-sans">Official Retail Bill / Cash Memo</p>
              <p className="font-bold mt-1 text-indigo-600">Bill #{completedSale.bill_number}</p>
              <p className="text-slate-400">{new Date(completedSale.bill_date).toLocaleString()}</p>
            </div>

            <div className="divide-y divide-slate-100 py-1">
              {completedSale.items?.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <div>
                    <span className="font-semibold block">{item.product_name}</span>
                    <span className="text-slate-400">
                      {item.quantity} x ₹{item.rate}
                    </span>
                  </div>
                  <span className="font-bold">₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{completedSale.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes:</span>
                <span>₹{completedSale.tax_total}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>₹{completedSale.grand_total}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Mode:</span>
                <span className="uppercase font-bold">{completedSale.payment_mode}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Paid:</span>
                <span>₹{completedSale.amount_paid}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Change Returned:</span>
                <span>₹{completedSale.change_returned}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-3 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Bill
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
              >
                Next Customer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default RetailPosPage;
