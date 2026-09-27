import React, { useState, useEffect } from 'react';
import { Settings, Save, Database, Shield, Sliders } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Danza ERP',
    default_currency: 'INR',
    default_tax_rate: 18,
    enable_two_factor: false,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    allow_negative_stock: false,
    enforce_customer_credit_limit: true,
    discount_approval_threshold_percent: 15,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSystemSettings();
      if (res.data?.settings || res.data) {
        setSettings({ ...settings, ...(res.data.settings || res.data) });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      alert('System settings saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading system settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        subtitle="Global enterprise parameters, security lockouts, inventory controls, and financial approval thresholds."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Security Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Security & Authentication Policies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Failed Login Attempts</label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.max_login_attempts}
                onChange={(e) => setSettings({ ...settings, max_login_attempts: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Lockout Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.lockout_duration_minutes}
                onChange={(e) => setSettings({ ...settings, lockout_duration_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Commercial & Sales Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Commercial & Sales Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quotation Special Discount Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={settings.discount_approval_threshold_percent}
                onChange={(e) =>
                  setSettings({ ...settings, discount_approval_threshold_percent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-xs text-slate-400 mt-1">Discounts above this percent require Manager approval.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={settings.default_tax_rate}
                onChange={(e) => setSettings({ ...settings, default_tax_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforce_customer_credit_limit}
                onChange={(e) => setSettings({ ...settings, enforce_customer_credit_limit: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-800">
                Block new sales orders when customer exceeds approved credit limit
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_negative_stock}
                onChange={(e) => setSettings({ ...settings, allow_negative_stock: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-800">
                Allow negative inventory during sales transactions
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default SystemSettingsPage;
