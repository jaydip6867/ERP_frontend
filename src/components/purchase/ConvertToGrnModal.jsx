import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageCheck, Truck, Warehouse, Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import { adminService } from '../../services/admin.service';
import { Modal } from '../shell/Modal';

export const ConvertToGrnModal = ({
  isOpen,
  onClose,
  purchaseOrder = null,
  poId = null,
  onSuccess = null,
}) => {
  const navigate = useNavigate();

  const [poList, setPoList] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState(poId || purchaseOrder?._id || purchaseOrder?.id || '');
  const [poData, setPoData] = useState(purchaseOrder || null);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingPo, setLoadingPo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [warehouseId, setWarehouseId] = useState('');
  const [grnDate, setGrnDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorChallanNo, setVendorChallanNo] = useState('');
  const [vendorChallanDate, setVendorChallanDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState([]);

  // Load available warehouses
  useEffect(() => {
    if (isOpen) {
      loadWarehouses();
      if (!purchaseOrder && !poId) {
        loadOpenPurchaseOrders();
      }
    }
  }, [isOpen]);

  // Sync PO data when purchaseOrder prop changes
  useEffect(() => {
    if (purchaseOrder) {
      setPoData(purchaseOrder);
      setSelectedPoId(purchaseOrder._id || purchaseOrder.id);
      initializeFromPo(purchaseOrder);
    } else if (poId) {
      setSelectedPoId(poId);
      fetchPoDetails(poId);
    }
  }, [purchaseOrder, poId, isOpen]);

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

  const loadOpenPurchaseOrders = async () => {
    try {
      setLoadingPo(true);
      const res = await purchaseService.getOrders({ limit: 100 });
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.orders)
        ? res.data.orders
        : [];
      // Prefer approved or partially_received POs
      const activePos = list.filter((p) => p.status !== 'completed' && p.status !== 'cancelled');
      setPoList(activePos.length > 0 ? activePos : list);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoadingPo(false);
    }
  };

  const fetchPoDetails = async (id) => {
    if (!id) return;
    try {
      setLoadingPo(true);
      setError('');
      const res = await purchaseService.getOrderById(id);
      const data = res.data;
      setPoData(data);
      initializeFromPo(data);
    } catch (err) {
      console.error('Failed to fetch PO details:', err);
      setError('Failed to fetch selected purchase order details');
    } finally {
      setLoadingPo(false);
    }
  };

  const initializeFromPo = (po) => {
    if (!po) return;

    // Set warehouse from PO if available
    const whId = po.warehouse_id?._id || po.warehouse_id || (warehouses[0]?._id || '');
    if (whId) setWarehouseId(whId);

    // Initialize line items
    const lineItems = (po.items || []).map((it) => {
      const ordered = Number(it.ordered_qty || 0);
      const received = Number(it.received_qty || 0);
      const pending = Math.max(0, it.pending_qty !== undefined ? Number(it.pending_qty) : ordered - received);

      return {
        product_id: it.product_id?._id || it.product_id || '',
        product_name: it.product_id?.product_name || it.description || 'Material / Item',
        product_code: it.product_id?.product_code || '',
        ordered_qty: ordered,
        already_received_qty: received,
        pending_qty: pending,
        received_qty: pending > 0 ? pending : ordered,
        unit_rate: Number(it.rate || it.unit_rate || 0),
        batch_number: '',
        uom_id: it.uom_id?._id || it.uom_id || null,
        po_item_id: it._id || null,
      };
    });

    setItems(lineItems);
  };

  const handlePoSelectionChange = (e) => {
    const nextId = e.target.value;
    setSelectedPoId(nextId);
    if (nextId) {
      fetchPoDetails(nextId);
    } else {
      setPoData(null);
      setItems([]);
    }
  };

  const handleItemQtyChange = (index, value) => {
    const val = Math.max(0, parseFloat(value) || 0);
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], received_qty: val };
      return next;
    });
  };

  const handleBatchChange = (index, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], batch_number: value };
      return next;
    });
  };

  const handleReceiveAll = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        received_qty: it.pending_qty > 0 ? it.pending_qty : it.ordered_qty,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!poData && !selectedPoId) {
      setError('Please select a purchase order.');
      return;
    }

    if (!warehouseId) {
      setError('Please select receiving destination warehouse.');
      return;
    }

    const validItems = items.filter((it) => Number(it.received_qty) > 0);
    if (validItems.length === 0) {
      setError('At least one item must have a received quantity greater than 0.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        po_id: poData?._id || selectedPoId,
        supplier_id: poData?.supplier_id?._id || poData?.supplier_id,
        warehouse_id: warehouseId,
        grn_date: grnDate,
        vendor_challan_no: vendorChallanNo.trim(),
        vendor_challan_date: vendorChallanDate || null,
        vehicle_number: vehicleNumber.trim(),
        driver_name: driverName.trim(),
        remarks: remarks.trim(),
        items: validItems.map((it) => ({
          product_id: it.product_id,
          received_qty: Number(it.received_qty),
          accepted_qty: Number(it.received_qty),
          unit_rate: Number(it.unit_rate || 0),
          batch_number: it.batch_number.trim(),
          uom_id: it.uom_id,
          po_item_id: it.po_item_id,
        })),
      };

      const res = await purchaseService.createGrn(payload);
      const createdGrn = res?.data || res;

      if (onSuccess) {
        onSuccess(createdGrn);
      }

      onClose();

      // Navigate to the newly created GRN detail page
      if (createdGrn?._id || createdGrn?.id) {
        navigate(`/purchase/grn/${createdGrn._id || createdGrn.id}`);
      }
    } catch (err) {
      console.error('Error creating GRN from PO:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create Goods Receipt Note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Purchase Order to Goods Receipt (GRN)"
      subtitle="Inward received goods against purchase order contract into warehouse inventory"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PO Selection (if not already locked to a PO) */}
        {!purchaseOrder && !poId && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Purchase Order (PO) *
            </label>
            <select
              required
              value={selectedPoId}
              onChange={handlePoSelectionChange}
              disabled={loadingPo}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            >
              <option value="">-- Choose Purchase Order --</option>
              {poList.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.po_number} &bull; {p.supplier_id?.supplier_name || 'Vendor'} &bull; ₹{Number(p.grand_total || 0).toLocaleString('en-IN')} ({p.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PO Highlights Card */}
        {poData && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">PO Reference</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{poData.po_number}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Supplier / Vendor</span>
              <p className="font-semibold text-slate-900 truncate mt-0.5">
                {poData.supplier_id?.supplier_name || 'Vendor'}
              </p>
              {poData.supplier_id?.gstin && (
                <p className="font-mono text-[10px] text-slate-400">{poData.supplier_id.gstin}</p>
              )}
            </div>
            <div>
              <span className="text-slate-500 font-medium">Order Date</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {poData.po_date ? new Date(poData.po_date).toLocaleDateString('en-IN') : '-'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Order Status</span>
              <p className="font-bold uppercase text-brand mt-0.5 tracking-wider">{poData.status}</p>
            </div>
          </div>
        )}

        {/* Inward Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Warehouse *
            </label>
            <div className="relative">
              <select
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id || w.id} value={w._id || w.id}>
                    {w.warehouse_name} {w.warehouse_code ? `(${w.warehouse_code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inward Date (GRN Date) *
            </label>
            <input
              type="date"
              required
              value={grnDate}
              onChange={(e) => setGrnDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor Challan / Invoice #
            </label>
            <input
              type="text"
              placeholder="e.g. DC-2024-901"
              value={vendorChallanNo}
              onChange={(e) => setVendorChallanNo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Challan Date
            </label>
            <input
              type="date"
              value={vendorChallanDate}
              onChange={(e) => setVendorChallanDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle / Transporter No.
            </label>
            <input
              type="text"
              placeholder="e.g. GJ-05-BX-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Driver / Gate Carrier Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Bhai"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-brand" />
              Receipt Quantities & Batch Allocations
            </h4>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleReceiveAll}
                className="text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                Auto-fill Pending Qty
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
              {loadingPo ? 'Loading PO items...' : 'No items found in selected Purchase Order.'}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Item / Material</th>
                      <th className="px-3 py-2.5 text-right">Ordered</th>
                      <th className="px-3 py-2.5 text-right">Prev Received</th>
                      <th className="px-3 py-2.5 text-right">Pending</th>
                      <th className="px-3 py-2.5 w-32">Receiving Now *</th>
                      <th className="px-3 py-2.5 w-36">Lot / Batch No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="px-3 py-2.5 font-medium text-slate-900">
                          <div>{item.product_name}</div>
                          {item.product_code && (
                            <span className="font-mono text-[10px] text-slate-400">{item.product_code}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-600">{item.ordered_qty}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-500">{item.already_received_qty}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-700">{item.pending_qty}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.received_qty}
                            onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            placeholder="Optional Batch"
                            value={item.batch_number}
                            onChange={(e) => handleBatchChange(idx, e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Gate Receipt Remarks / Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Unloaded at Dock 2 in good condition, seal verified"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating GRN...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Convert &amp; Generate GRN
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConvertToGrnModal;
