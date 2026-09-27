import React, { useState } from 'react';
import { MessageSquare, Plus, Send, CheckCircle2, PhoneCall, Clock, Settings } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const WhatsAppAutoPage = () => {
  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'order_confirmation_v2',
      category: 'Transactional',
      language: 'English (US)',
      status: 'APPROVED',
      body: 'Hello {{1}}, your order #{{2}} of ₹{{3}} has been confirmed and is being prepared by Danza.',
    },
    {
      id: '2',
      name: 'dispatch_tracking_alert',
      category: 'Shipping',
      language: 'English (US)',
      status: 'APPROVED',
      body: 'Hi {{1}}, your shipment has been dispatched via {{2}} with tracking ID {{3}}. Track at: {{4}}',
    },
    {
      id: '3',
      name: 'payment_reminder_gentle',
      category: 'Accounts',
      language: 'English (US)',
      status: 'APPROVED',
      body: 'Dear {{1}}, a gentle reminder regarding invoice #{{2}} amounting to ₹{{3}} due on {{4}}.',
    },
  ]);

  const [testMobile, setTestMobile] = useState('');

  const handleTestSend = (template) => {
    if (!testMobile) {
      toast.warning('Enter a test recipient mobile number');
      return;
    }
    toast.success(`WhatsApp message simulated & queued for ${testMobile} using ${template.name}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="WhatsApp Business API & Bot Automations"
          subtitle="Meta Cloud API integration, pre-approved HSM templates, automated alerts, and conversational bot flows."
          breadcrumbs={[{ label: 'Technology' }, { label: 'WhatsApp Automation' }]}
        />
        <div className="flex items-center gap-3">
          <input
            type="tel"
            placeholder="+91 Mobile number..."
            value={testMobile}
            onChange={(e) => setTestMobile(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-700 font-medium">
                  {tpl.status}
                </span>
                <span className="text-xs text-slate-400">{tpl.category}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base font-mono">{tpl.name}</h3>
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg text-xs text-slate-700 leading-relaxed font-sans">
                {tpl.body}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">{tpl.language}</span>
              <button
                onClick={() => handleTestSend(tpl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                Test Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppAutoPage;
