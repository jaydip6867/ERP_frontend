import React, { useState } from 'react';
import { PhoneCall, Mail, Settings, CheckCircle2, Shield, Radio } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CrmTechPage = () => {
  const [telephonyConfig, setTelephonyConfig] = useState({
    provider: 'Exotel',
    caller_id: '+91 80 4040 1234',
    recording_enabled: true,
    auto_lead_creation: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Telephony & CTI settings updated');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="CRM Telephony & CTI Infrastructure"
          subtitle="Cloud call center integration, click-to-dial CTI, call recordings, and automatic inbound lead routing."
          breadcrumbs={[{ label: 'Technology' }, { label: 'CRM & Telephony' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Cloud Telephony Provider</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">IVR & CTI Provider</label>
              <select
                value={telephonyConfig.provider}
                onChange={(e) => setTelephonyConfig({ ...telephonyConfig, provider: e.target.value })}
                className="w-full mt-1 p-2 text-sm border rounded-lg bg-slate-50"
              >
                <option value="Exotel">Exotel Cloud Telephony</option>
                <option value="Knowlarity">Knowlarity SuperReceptionist</option>
                <option value="Twilio">Twilio Voice API</option>
                <option value="TataTele">Tata SmartFlo Cloud PBX</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Virtual Caller ID Number</label>
              <input
                type="text"
                value={telephonyConfig.caller_id}
                onChange={(e) => setTelephonyConfig({ ...telephonyConfig, caller_id: e.target.value })}
                className="w-full mt-1 p-2 text-sm border rounded-lg"
              />
            </div>
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={telephonyConfig.recording_enabled}
                  onChange={(e) => setTelephonyConfig({ ...telephonyConfig, recording_enabled: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                Enable Call Recording & Sentiment Audio Analysis
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={telephonyConfig.auto_lead_creation}
                  onChange={(e) => setTelephonyConfig({ ...telephonyConfig, auto_lead_creation: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                Auto-create Lead in CRM on Unknown Inbound Caller
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
              >
                Save CTI Settings
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Inbound Lead Distribution Engine</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure round-robin algorithms, skill-based agent routing, and territory-level lead assignment.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
              <span>B2B Corporate Leads</span>
              <span className="font-semibold text-slate-700">Round-Robin (KAM Team)</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
              <span>Channel / Wholesale Inquiries</span>
              <span className="font-semibold text-slate-700">Territory Distribution</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
              <span>Support & Grievances</span>
              <span className="font-semibold text-slate-700">Queue by Priority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmTechPage;
