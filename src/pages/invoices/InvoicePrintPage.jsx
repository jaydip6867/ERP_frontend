import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { invoiceService } from '../../services/invoice.service';
import { adminService } from '../../services/admin.service';

export const InvoicePrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, compRes] = await Promise.all([
        invoiceService.getInvoiceById(id),
        adminService.getCompanyProfile(),
      ]);
      setInvoice(invRes.data);
      setCompany(compRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isInterstate = invoice.is_interstate;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-800">
      {/* Screen toolbar (hidden on print) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate(`/invoices/${id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoice
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print Tax Invoice
        </button>
      </div>

      {/* Tax Invoice Printable Document */}
      <div className="bg-white border border-slate-300 p-8 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {company?.company_name || 'DANZA VALVE ENTERPRISES'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">
              Plot 104, GIDC Sachin Industrial Area, Surat, Gujarat - 394230
            </p>
            <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
              GSTIN: {company?.gstin || '24AAACD9988K1Z5'}
            </p>
            <p className="text-xs text-slate-600">Email: accounts@danzaerp.com | Phone: +91 261 2899000</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              TAX INVOICE
            </span>
            <p className="text-sm font-bold font-mono text-slate-900">{invoice.invoice_number}</p>
            <p className="text-xs text-slate-600">Date: {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
            {invoice.e_way_bill?.ewb_number && (
              <p className="text-xs font-mono text-slate-700 font-semibold mt-1">
                EWB: {invoice.e_way_bill.ewb_number}
              </p>
            )}
          </div>
        </div>

        {/* Customer & Shipping Particulars */}
        <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-4">
          <div>
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Billed To:</p>
            <p className="font-bold text-slate-900 text-sm">{invoice.customer_id?.display_name || invoice.customer_id?.company_name}</p>
            <p className="text-slate-600 mt-0.5">{invoice.billing_address?.address_line1 || 'Main Road'}</p>
            <p className="text-slate-600">{invoice.billing_address?.city}, {invoice.billing_address?.state} - {invoice.billing_address?.pincode}</p>
            <p className="font-mono font-semibold text-slate-800 mt-1">GSTIN: {invoice.customer_id?.gstin || 'Unregistered'}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Invoice Particulars:</p>
            <p><span className="text-slate-500">Order Ref:</span> <span className="font-mono font-semibold">{invoice.sales_order_id?.order_number || 'Direct'}</span></p>
            <p><span className="text-slate-500">Place of Supply:</span> <span className="font-semibold">{invoice.place_of_supply_state}</span></p>
            <p><span className="text-slate-500">Tax Type:</span> <span className="font-semibold">{isInterstate ? 'Interstate (IGST)' : 'Intrastate (CGST + SGST)'}</span></p>
            <p><span className="text-slate-500">Payment Due:</span> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'Net 30'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs border border-slate-200">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2 px-3 border-r border-slate-200 w-8">#</th>
              <th className="py-2 px-3 border-r border-slate-200">Description of Goods</th>
              <th className="py-2 px-3 border-r border-slate-200 text-center w-20">HSN</th>
              <th className="py-2 px-3 border-r border-slate-200 text-center w-16">Qty</th>
              <th className="py-2 px-3 border-r border-slate-200 text-right w-20">Rate</th>
              <th className="py-2 px-3 border-r border-slate-200 text-right w-24">Taxable (₹)</th>
              {!isInterstate ? (
                <>
                  <th className="py-2 px-2 border-r border-slate-200 text-center w-16">CGST</th>
                  <th className="py-2 px-2 border-r border-slate-200 text-center w-16">SGST</th>
                </>
              ) : (
                <th className="py-2 px-2 border-r border-slate-200 text-center w-20">IGST</th>
              )}
              <th className="py-2 px-3 text-right w-24">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {invoice.items?.map((it, idx) => (
              <tr key={idx}>
                <td className="py-2 px-3 border-r border-slate-200 text-center font-sans">{idx + 1}</td>
                <td className="py-2 px-3 border-r border-slate-200 font-sans">
                  <p className="font-bold text-slate-900">{it.item_name}</p>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{it.hsn_code || '8481'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{it.quantity} {it.uom}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{it.rate}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{Number(it.taxable_amount || 0).toFixed(2)}</td>
                {!isInterstate ? (
                  <>
                    <td className="py-2 px-2 border-r border-slate-200 text-center">{it.cgst_amount || 0}</td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center">{it.sgst_amount || 0}</td>
                  </>
                ) : (
                  <td className="py-2 px-2 border-r border-slate-200 text-center">{it.igst_amount || 0}</td>
                )}
                <td className="py-2 px-3 text-right font-bold text-slate-900">{Number(it.total_amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation Summary & Bank Details */}
        <div className="grid grid-cols-2 gap-6 pt-2 text-xs">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <p className="font-bold text-slate-900 uppercase text-[10px] mb-1">Company Bank Details</p>
              <p>Bank: <strong>{invoice.bank_details?.bank_name}</strong></p>
              <p className="font-mono">A/C: {invoice.bank_details?.account_number}</p>
              <p className="font-mono">IFSC: {invoice.bank_details?.ifsc_code}</p>
              <p>Branch: {invoice.bank_details?.branch}</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Terms: {invoice.terms_and_conditions}
            </p>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-sans text-slate-600">Total Taxable Value:</span>
              <span>₹{Number(invoice.taxable_total || 0).toFixed(2)}</span>
            </div>
            {!isInterstate ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Central GST (CGST):</span>
                  <span>₹{Number(invoice.cgst_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-sans text-slate-600">State GST (SGST):</span>
                  <span>₹{Number(invoice.sgst_total || 0).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-sans text-slate-600">Integrated GST (IGST):</span>
                <span>₹{Number(invoice.igst_total || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm font-bold text-slate-900">
              <span className="font-sans">Grand Total:</span>
              <span>₹{Number(invoice.grand_total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Signatory */}
        <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
          <div>
            {invoice.e_invoice?.signed_qr_code && (
              <div className="p-2 border border-slate-300 inline-block font-mono text-[9px] text-slate-600 text-center">
                [ QR Code: NIC E-Invoice ]<br />IRN Verified
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 uppercase">For Danza Valve Enterprises</p>
            <div className="h-12"></div>
            <p className="text-slate-600 text-[11px]">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPage;
