import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2, AlertCircle, RefreshCw, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { technologyService } from '../../services/technology.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'api',
    base_url: '',
    auth_type: 'bearer',
    credentials: {
      api_key: '',
      secret_key: '',
    },
    sync_frequency: 'realtime',
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const res = await technologyService.getIntegrations();
      setIntegrations(res.data?.integrations || []);
    } catch (err) {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (id) => {
    try {
      setTestingId(id);
      const res = await technologyService.testIntegration(id);
      toast.success(res.message || 'Connection ping test successful (200 OK)');
      loadIntegrations();
    } catch (err) {
      toast.error('Integration ping failed: Unable to connect');
    } finally {
      setTestingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await technologyService.createIntegration(formData);
      toast.success('Integration connector configured successfully');
      setShowModal(false);
      setFormData({
        name: '',
        type: 'api',
        base_url: '',
        auth_type: 'bearer',
        credentials: {
          api_key: '',
          secret_key: '',
        },
        sync_frequency: 'realtime',
      });
      loadIntegrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create integration');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Enterprise API Connectors & Integrations"
          subtitle="Manage secure external integrations (Shopify, Razorpay, WhatsApp Business API, Shiprocket)."
          breadcrumbs={[{ label: 'Technology' }, { label: 'Integrations' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading connectors...</div>
        ) : integrations.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No integration connectors registered yet.
          </div>
        ) : (
          integrations.map((item) => (
            <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full uppercase font-mono font-medium bg-slate-100 text-slate-700">
                    {item.type}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    item.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{item.name}</h3>
                <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded truncate">
                  {item.base_url}
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Auth: <b>{item.auth_type}</b></span>
                  <span>Sync: <b>{item.sync_frequency}</b></span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Last: {item.last_sync_at ? new Date(item.last_sync_at).toLocaleTimeString() : 'Never'}
                </span>
                <button
                  onClick={() => handleTest(item._id)}
                  disabled={testingId === item._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === item._id ? 'animate-spin' : ''}`} />
                  Test Ping
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Configure API Integration</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Connector Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Shopify Global Store"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="api">REST API</option>
                    <option value="webhook">Webhook</option>
                    <option value="payment_gateway">Payment Gateway</option>
                    <option value="whatsapp">WhatsApp Cloud</option>
                    <option value="bi">BI & Analytics</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Auth Method</label>
                  <select
                    value={formData.auth_type}
                    onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  >
                    <option value="bearer">Bearer Token</option>
                    <option value="api_key">API Key & Secret</option>
                    <option value="basic">Basic Auth</option>
                    <option value="oauth2">OAuth 2.0</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Base API Endpoint / URL *</label>
                <input
                  required
                  type="url"
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="https://api.service.com/v1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">API Key / Token</label>
                  <input
                    type="password"
                    value={formData.credentials.api_key}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, api_key: e.target.value }
                    })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Secret Key</label>
                  <input
                    type="password"
                    value={formData.credentials.secret_key}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, secret_key: e.target.value }
                    })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                >
                  Save Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
