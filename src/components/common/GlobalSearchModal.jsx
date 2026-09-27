import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, ExternalLink, Package, Users, ShoppingCart, Receipt, LifeBuoy, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commonService } from '../../services/common.service';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await commonService.globalSearch(query);
        setResults(res.data);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    if (path) navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customers, orders, invoices, products, tickets, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 flex-1 space-y-4">
          {loading && (
            <div className="text-center py-8 text-sm text-slate-400">Searching enterprise repository...</div>
          )}

          {!loading && results && (
            <div className="space-y-4">
              {/* Customers */}
              {results.customers?.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Customers
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleSelect(`/customers`)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{c.company_name}</div>
                          <div className="text-xs text-slate-500">{c.city}, {c.state} • {c.email}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales Orders */}
              {results.orders?.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" /> Sales Orders
                  </div>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <div
                        key={o._id}
                        onClick={() => handleSelect(`/sales/orders/${o._id}`)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 font-mono">{o.order_number}</div>
                          <div className="text-xs text-slate-500">
                            {o.customer_id?.company_name || 'Customer'} • ₹{(o.grand_total || 0).toLocaleString()} • {o.status}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products?.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Products & Catalog
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelect(`/products`)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.product_name}</div>
                          <div className="text-xs text-slate-500 font-mono">{p.sku_code} • Stock: {p.current_stock} NOS</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {results.invoices?.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" /> Tax Invoices
                  </div>
                  <div className="space-y-1">
                    {results.invoices.map((inv) => (
                      <div
                        key={inv._id}
                        onClick={() => handleSelect(`/invoices/list`)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 font-mono">{inv.invoice_number}</div>
                          <div className="text-xs text-slate-500">₹{(inv.grand_total || 0).toLocaleString()} • {inv.payment_status}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets */}
              {results.tickets?.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" /> Support Tickets
                  </div>
                  <div className="space-y-1">
                    {results.tickets.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => handleSelect(`/support/tickets`)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 font-mono">{t.ticket_number}: {t.subject}</div>
                          <div className="text-xs text-slate-500">{t.category} • {t.priority} • {t.status}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !results && query.length >= 2 && (
            <div className="text-center py-8 text-sm text-slate-500">No matching enterprise entities found.</div>
          )}

          {!query && (
            <div className="text-center py-8 text-xs text-slate-400">
              Type at least 2 characters to search across customers, orders, inventory, invoices, tickets, and tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
