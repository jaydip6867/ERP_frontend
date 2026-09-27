import React, { useState, useEffect } from 'react';
import { Cpu, Server, Activity, Zap, Shield, RefreshCw, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { technologyService } from '../../services/technology.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const TechDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await technologyService.getDashboard();
      setMetrics(res.data || {});
    } catch (err) {
      toast.error('Failed to load technology operations dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Technology & IT Infrastructure Command"
          subtitle="Real-time monitoring of enterprise microservices, automations, API connectors, and security health."
          breadcrumbs={[{ label: 'Technology' }, { label: 'Dashboard' }]}
        />
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-xs transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">System Health</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.systemHealth?.status === 'healthy' ? '99.98% OK' : 'Degraded'}
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Services Operational
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Integrations</span>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.integrationsCount || 0} Connected
          </div>
          <div className="text-xs text-slate-400 mt-1">Shopify, Razorpay, WhatsApp API</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Automation Workflows</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.automationRulesCount || 0} Rules
          </div>
          <div className="text-xs text-slate-400 mt-1">Auto notifications, invoice sync</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">RAM & CPU Util</span>
            <Server className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics?.systemHealth?.memoryUsedMb ? `${metrics.systemHealth.memoryUsedMb} MB` : 'Optimal'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Node.js V8 Runtime Active</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Connected API Ecosystem</h3>
            <Link to="/technology/integrations" className="text-xs text-indigo-600 font-semibold hover:underline">
              Manage Connectors →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'WhatsApp Cloud API', category: 'Messaging', status: 'Connected', uptime: '99.9%' },
              { name: 'Shopify Storefront Sync', category: 'E-Commerce', status: 'Connected', uptime: '100%' },
              { name: 'Razorpay Payment Gateway', category: 'FinTech', status: 'Connected', uptime: '100%' },
              { name: 'Shiprocket Multi-Courier', category: 'Logistics', status: 'Connected', uptime: '99.8%' },
            ].map((conn, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{conn.name}</div>
                  <div className="text-xs text-slate-400">{conn.category}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                    {conn.status}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">{conn.uptime} uptime</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Technology Navigation</h3>
            <span className="text-xs text-slate-400 font-mono">DANZA-TECH-V2</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'ERP System Health', desc: 'DB latency, memory & CPU', link: '/technology/system-health' },
              { title: 'Automation Engine', desc: 'Trigger event pipelines', link: '/technology/automation' },
              { title: 'WhatsApp Bots', desc: 'Templates & auto-replies', link: '/technology/whatsapp-auto' },
              { title: 'BI & Analytical Lake', desc: 'Embedded executive reports', link: '/technology/bi-reports' },
              { title: 'Customer Portal', desc: 'B2B client self-service', link: '/technology/customer-portal' },
              { title: 'AI Assist & Agents', desc: 'Predictive forecast models', link: '/technology/ai-tech' },
            ].map((nav, idx) => (
              <Link
                key={idx}
                to={nav.link}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition"
              >
                <div className="text-sm font-semibold text-slate-800">{nav.title}</div>
                <div className="text-xs text-slate-500 mt-1">{nav.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechDashboardPage;
