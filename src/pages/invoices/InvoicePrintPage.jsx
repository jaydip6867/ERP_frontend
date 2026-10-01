import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Printer, ArrowLeft, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { invoiceService } from '../../services/invoice.service';
import { adminService } from '../../services/admin.service';

// Utility: Number to Words in Indian numbering format
function numberToWordsINR(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(num)).slice(-9);
  const crore = Number(n.slice(0, 2));
  const lakh = Number(n.slice(2, 4));
  const thousand = Number(n.slice(4, 6));
  const hundred = Number(n.slice(6, 7));
  const rem = Number(n.slice(7));

  let str = '';

  const getTwoDigits = (val) => {
    if (val < 20) return a[val];
    return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
  };

  if (crore) str += getTwoDigits(crore) + ' Crore ';
  if (lakh) str += getTwoDigits(lakh) + ' Lakh ';
  if (thousand) str += getTwoDigits(thousand) + ' Thousand ';
  if (hundred) str += a[hundred] + ' Hundred ';
  if (rem) {
    if (str !== '') str += 'and ';
    str += getTwoDigits(rem) + ' ';
  }

  const paise = Math.round((num - Math.floor(num)) * 100);
  let paiseStr = '';
  if (paise > 0) {
    paiseStr = ' and ' + getTwoDigits(paise) + ' Paise';
  }

  return 'Rupees ' + str.trim() + paiseStr + ' Only';
}

export const InvoicePrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyType, setCopyType] = useState('ORIGINAL FOR RECIPIENT');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load invoice first
      const invRes = await invoiceService.getInvoiceById(id);
      const invData = invRes?.data || invRes;
      if (!invData) {
        throw new Error('Invoice data not found');
      }
      setInvoice(invData);

      // Attempt company profile fetch safely
      try {
        const compRes = await adminService.getCompany();
        if (compRes?.data) {
          setCompany(compRes.data);
        }
      } catch (cErr) {
        console.warn('Could not fetch company profile, using system default profile:', cErr);
      }
    } catch (err) {
      console.error('Failed to load invoice for print:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If autoprint query parameter is passed (?autoprint=true), trigger print once loaded
    if (!loading && invoice && searchParams.get('autoprint') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, invoice, searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Generating Tax Invoice PDF layout...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-rose-200 rounded-xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Failed to Load Invoice</h3>
          <p className="text-xs text-rose-600 mt-1">{error || 'Invoice record could not be retrieved.'}</p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => navigate('/invoices/list')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Back to Invoices
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isInterstate = Boolean(invoice.is_interstate);
  const companyProfile = company || {
    company_name: 'DANZA VALVE ENTERPRISES',
    address: 'Plot 104, GIDC Sachin Industrial Area, Surat, Gujarat - 394230',
    gstin: '24AAACD9988K1Z5',
    pan: 'AAACD9988K',
    state: 'Gujarat',
    state_code: '24',
    email: 'accounts@danzaerp.com',
    phone: '+91 261 2899000',
    cin: 'U29100GJ2020PTC115432',
  };

  const customerObj = invoice.customer_id || {};
  const billingAddr = invoice.billing_address || customerObj.billing_address || {};
  const shippingAddr = invoice.shipping_address || customerObj.shipping_address || billingAddr;

  const totalTax = (Number(invoice.cgst_total) || 0) + (Number(invoice.sgst_total) || 0) + (Number(invoice.igst_total) || 0);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white py-6 px-4">
      {/* Print Stylesheet Overrides */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-page-break {
            page-break-after: always;
          }
          .tax-invoice-box {
            border: 1.5px solid #0f172a !important;
            box-shadow: none !important;
            padding: 12px !important;
          }
        }
      `}</style>

      {/* Screen Toolbar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/invoices/${id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Details
          </button>
          <div className="h-5 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Copy:</span>
            <select
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
              className="text-xs font-semibold border border-slate-300 rounded-md px-2 py-1 bg-slate-50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ORIGINAL FOR RECIPIENT">Original for Recipient</option>
              <option value="DUPLICATE FOR TRANSPORTER">Duplicate for Transporter</option>
              <option value="TRIPLICATE FOR SUPPLIER">Triplicate for Supplier</option>
              <option value="EXTRA COPY">Extra Office Copy</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Select <strong>"Save as PDF"</strong> in destination to export
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
          >
            <Download className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Tax Invoice Document (Standard Indian GST Layout) */}
      <div className="max-w-4xl mx-auto bg-white border-2 border-slate-900 p-6 shadow-xl print:shadow-none print:border-2 print:border-slate-900 print:p-4 text-slate-900 text-xs font-sans tax-invoice-box">
        {/* Top Header Banner */}
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 bg-slate-900 text-white rounded-xs">
              GST RULE 46 COMPLIANT
            </span>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-black tracking-widest uppercase text-slate-900">
              TAX INVOICE
            </h1>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider px-2 py-0.5 border border-slate-900 bg-slate-50">
              {copyType}
            </span>
          </div>
        </div>

        {/* Company & Supplier Header */}
        <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
              {companyProfile.company_name}
            </h2>
            <p className="text-[11px] text-slate-700 leading-tight mt-0.5">
              {companyProfile.address || 'Plot 104, GIDC Sachin Industrial Area, Surat, Gujarat - 394230'}
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[11px] font-mono">
              <p><strong className="text-slate-900">GSTIN:</strong> {companyProfile.gstin || '24AAACD9988K1Z5'}</p>
              <p><strong className="text-slate-900">PAN:</strong> {companyProfile.pan || 'AAACD9988K'}</p>
              <p><strong className="text-slate-900">State:</strong> {companyProfile.state || 'Gujarat'} (Code: {companyProfile.state_code || '24'})</p>
              {companyProfile.cin && <p><strong className="text-slate-900">CIN:</strong> {companyProfile.cin}</p>}
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Email: {companyProfile.email || 'accounts@danzaerp.com'} | Phone: {companyProfile.phone || '+91 261 2899000'}
            </p>
          </div>

          <div className="border-l border-slate-300 pl-4 font-mono text-[11px] space-y-1">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="font-bold text-slate-700">Invoice Number:</span>
              <span className="font-black text-slate-950 text-sm">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Invoice Date:</span>
              <span className="font-bold text-slate-900">{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Payment Due Date:</span>
              <span className="font-bold text-slate-900">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'Immediate'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Order Reference:</span>
              <span className="font-semibold text-slate-900">
                {invoice.sales_order_id?.order_number || invoice.sales_order_id?.customer_po_number || 'Direct Order'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Place of Supply:</span>
              <span className="font-bold text-slate-900">
                {invoice.place_of_supply_state || 'Gujarat'} ({isInterstate ? 'Interstate' : 'Intrastate'})
              </span>
            </div>
            {invoice.e_way_bill?.ewb_number && (
              <div className="flex justify-between bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                <span className="font-bold text-slate-700">E-Way Bill:</span>
                <span className="font-bold text-indigo-700">{invoice.e_way_bill.ewb_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-700">Reverse Charge:</span>
              <span className="font-bold text-slate-900">{invoice.reverse_charge ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>

        {/* Billed To & Shipped To Addresses */}
        <div className="grid grid-cols-2 gap-4 border-b border-slate-800 py-2.5 bg-slate-50/50">
          <div className="pr-2">
            <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
              Details of Receiver / Billed to:
            </p>
            <p className="font-bold text-slate-950 text-xs">
              {customerObj.display_name || customerObj.company_name || 'Valued Customer'}
            </p>
            <p className="text-slate-700 text-[11px] leading-tight mt-0.5">
              {billingAddr.address_line1 || billingAddr.street || 'Factory / Registered Address'}
            </p>
            <p className="text-slate-700 text-[11px]">
              {billingAddr.city || 'Surat'}, {billingAddr.state || 'Gujarat'} - {billingAddr.pincode || '395002'}
            </p>
            <div className="mt-1 font-mono text-[11px]">
              <p><strong className="text-slate-900">GSTIN:</strong> {customerObj.gstin || billingAddr.gstin || 'Unregistered'}</p>
              <p><strong className="text-slate-900">State:</strong> {billingAddr.state || customerObj.state || 'Gujarat'}</p>
            </div>
          </div>

          <div className="border-l border-slate-300 pl-4">
            <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
              Details of Consignee / Shipped to:
            </p>
            <p className="font-bold text-slate-950 text-xs">
              {customerObj.display_name || customerObj.company_name || 'Valued Customer'}
            </p>
            <p className="text-slate-700 text-[11px] leading-tight mt-0.5">
              {shippingAddr.address_line1 || billingAddr.address_line1 || 'Same as Billing Address'}
            </p>
            <p className="text-slate-700 text-[11px]">
              {shippingAddr.city || billingAddr.city || 'Surat'}, {shippingAddr.state || billingAddr.state || 'Gujarat'} - {shippingAddr.pincode || billingAddr.pincode || '395002'}
            </p>
            <div className="mt-1 font-mono text-[11px]">
              <p><strong className="text-slate-900">GSTIN:</strong> {customerObj.gstin || shippingAddr.gstin || 'Unregistered'}</p>
              <p><strong className="text-slate-900">State:</strong> {shippingAddr.state || billingAddr.state || 'Gujarat'}</p>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="my-3 overflow-hidden border border-slate-900">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-1.5 px-2 border-r border-slate-700 w-7 text-center">#</th>
                <th className="py-1.5 px-2 border-r border-slate-700">Description of Goods / Services</th>
                <th className="py-1.5 px-2 border-r border-slate-700 text-center w-16">HSN/SAC</th>
                <th className="py-1.5 px-2 border-r border-slate-700 text-center w-14">Qty</th>
                <th className="py-1.5 px-2 border-r border-slate-700 text-right w-16">Rate (₹)</th>
                <th className="py-1.5 px-2 border-r border-slate-700 text-right w-18">Taxable (₹)</th>
                {!isInterstate ? (
                  <>
                    <th className="py-1.5 px-1.5 border-r border-slate-700 text-center w-14">CGST</th>
                    <th className="py-1.5 px-1.5 border-r border-slate-700 text-center w-14">SGST</th>
                  </>
                ) : (
                  <th className="py-1.5 px-1.5 border-r border-slate-700 text-center w-16">IGST</th>
                )}
                <th className="py-1.5 px-2 text-right w-20">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-mono">
              {(invoice.items && invoice.items.length > 0 ? invoice.items : [
                {
                  item_name: 'Industrial Valve Assembly',
                  hsn_code: '8481',
                  quantity: 1,
                  uom: 'NOS',
                  rate: invoice.taxable_total || 0,
                  taxable_amount: invoice.taxable_total || 0,
                  cgst_amount: invoice.cgst_total || 0,
                  sgst_amount: invoice.sgst_total || 0,
                  igst_amount: invoice.igst_total || 0,
                  total_amount: invoice.grand_total || 0,
                }
              ]).map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 border-r border-slate-300 text-center font-sans">{idx + 1}</td>
                  <td className="py-1.5 px-2 border-r border-slate-300 font-sans">
                    <p className="font-bold text-slate-950">{it.item_name || 'Standard Product Item'}</p>
                    {it.description && <p className="text-[10px] text-slate-500">{it.description}</p>}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-center">{it.hsn_code || '8481'}</td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold">
                    {it.quantity} {it.uom || 'NOS'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-right">{Number(it.rate || 0).toFixed(2)}</td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-right font-medium">
                    {Number(it.taxable_amount || 0).toFixed(2)}
                  </td>
                  {!isInterstate ? (
                    <>
                      <td className="py-1.5 px-1.5 border-r border-slate-300 text-center text-[10px]">
                        ₹{Number(it.cgst_amount || 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1.5 border-r border-slate-300 text-center text-[10px]">
                        ₹{Number(it.sgst_amount || 0).toFixed(2)}
                      </td>
                    </>
                  ) : (
                    <td className="py-1.5 px-1.5 border-r border-slate-300 text-center text-[10px]">
                      ₹{Number(it.igst_amount || 0).toFixed(2)}
                    </td>
                  )}
                  <td className="py-1.5 px-2 text-right font-bold text-slate-950">
                    {Number(it.total_amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Subtotals Row */}
            <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-mono font-bold text-[11px]">
              <tr>
                <td colSpan="5" className="py-1.5 px-3 text-right font-sans border-r border-slate-300 uppercase">
                  Total Taxable & Taxes:
                </td>
                <td className="py-1.5 px-2 text-right border-r border-slate-300">
                  ₹{Number(invoice.taxable_total || 0).toFixed(2)}
                </td>
                {!isInterstate ? (
                  <>
                    <td className="py-1.5 px-1.5 text-center border-r border-slate-300 text-[10px]">
                      ₹{Number(invoice.cgst_total || 0).toFixed(2)}
                    </td>
                    <td className="py-1.5 px-1.5 text-center border-r border-slate-300 text-[10px]">
                      ₹{Number(invoice.sgst_total || 0).toFixed(2)}
                    </td>
                  </>
                ) : (
                  <td className="py-1.5 px-1.5 text-center border-r border-slate-300 text-[10px]">
                    ₹{Number(invoice.igst_total || 0).toFixed(2)}
                  </td>
                )}
                <td className="py-1.5 px-2 text-right text-slate-950">
                  ₹{Number(invoice.grand_total || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="border border-slate-300 p-2 bg-slate-50/70 mb-3 flex items-start gap-2">
          <span className="font-bold text-slate-700 text-[11px] whitespace-nowrap">Invoice Total in Words:</span>
          <span className="font-bold text-slate-900 text-xs italic">
            {numberToWordsINR(invoice.grand_total || 0)}
          </span>
        </div>

        {/* Bank & Tax Summary & Signatory Section */}
        <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-900 pt-3">
          <div className="space-y-2.5">
            {/* Bank Particulars */}
            <div className="border border-slate-300 p-2.5 rounded bg-slate-50 text-[11px] leading-tight space-y-0.5">
              <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                Bank Details for NEFT / RTGS Transfer
              </p>
              <p><strong className="text-slate-800">Bank Name:</strong> {invoice.bank_details?.bank_name || 'HDFC Bank Ltd'}</p>
              <p className="font-mono"><strong className="text-slate-800">Account No:</strong> {invoice.bank_details?.account_number || '50200088991122'}</p>
              <p className="font-mono"><strong className="text-slate-800">IFSC Code:</strong> {invoice.bank_details?.ifsc_code || 'HDFC0000256'}</p>
              <p><strong className="text-slate-800">Branch:</strong> {invoice.bank_details?.branch || 'Ring Road, Surat'}</p>
            </div>

            {/* Terms and Conditions */}
            <div className="text-[10px] text-slate-600 leading-normal border-t border-slate-200 pt-2">
              <p className="font-bold text-slate-800 uppercase mb-0.5">Terms & Conditions:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Goods once sold will not be taken back without prior authorization.</li>
                <li>Interest @ 18% p.a. will be levied if payment is not received within agreed terms.</li>
                <li>All disputes are strictly subject to Surat jurisdiction only.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            {/* Tax Total Calculation Breakdown */}
            <div className="font-mono text-xs space-y-1">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-sans text-slate-600">Taxable Value:</span>
                <span className="font-semibold">₹{Number(invoice.taxable_total || 0).toFixed(2)}</span>
              </div>
              {!isInterstate ? (
                <>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-[11px]">
                    <span className="font-sans text-slate-600">Central Tax (CGST):</span>
                    <span>₹{Number(invoice.cgst_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-[11px]">
                    <span className="font-sans text-slate-600">State Tax (SGST):</span>
                    <span>₹{Number(invoice.sgst_total || 0).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-0.5 border-b border-slate-100 text-[11px]">
                  <span className="font-sans text-slate-600">Integrated Tax (IGST):</span>
                  <span>₹{Number(invoice.igst_total || 0).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.round_off || 0) !== 0 && (
                <div className="flex justify-between py-0.5 border-b border-slate-100 text-[11px]">
                  <span className="font-sans text-slate-600">Round Off:</span>
                  <span>₹{Number(invoice.round_off || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-slate-950 text-sm font-black text-slate-950">
                <span className="font-sans uppercase">Grand Total (₹):</span>
                <span>₹{Number(invoice.grand_total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="border border-slate-900 p-3 text-center space-y-8 rounded bg-white">
              <p className="font-bold text-slate-900 text-xs uppercase">
                For {companyProfile.company_name}
              </p>
              <div className="border-t border-dashed border-slate-400 pt-1">
                <p className="text-[11px] font-semibold text-slate-700">Authorized Signatory / Digital Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-slate-300 mt-3">
          This is a Computer Generated Tax Invoice issued in accordance with Section 31 of CGST Act, 2017.
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPage;
