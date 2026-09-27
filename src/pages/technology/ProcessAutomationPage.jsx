import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, Clock, Workflow, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const ProcessAutomationPage = () => {
  const [pipelines, setPipelines] = useState([
    {
      id: 'p1',
      name: 'Order-to-Cash End-to-End Orchestrator',
      description: 'Auto-checks inventory, allocates stock, creates packing slip, and notifies dispatch.',
      trigger: 'Sales Order Approved',
      status: 'Active',
      steps: ['Credit Check', 'Inventory Allocation', 'Invoice Generation', 'WhatsApp Notification'],
    },
    {
      id: 'p2',
      name: 'Auto-Procurement & Material Requisition',
      description: 'Generates draft Purchase Orders when raw material stock crosses below safety threshold.',
      trigger: 'Stock Below Minimum Level',
      status: 'Active',
      steps: ['BOM Calculation', 'Supplier Price Match', 'Draft PO Generation', 'Manager Approval Alert'],
    },
    {
      id: 'p3',
      name: 'Nightly Financial Settlement & Reconciliation',
      description: 'Reconciles payment gateway transactions against pending sales invoices at 00:00 midnight.',
      trigger: 'Cron (Every Midnight)',
      status: 'Scheduled',
      steps: ['Fetch Razorpay Settlements', 'Auto-Match Invoice ID', 'Post Journal Entry', 'Audit Report'],
    },
  ]);

  const handleRun = (pipe) => {
    toast.success(`Pipeline "${pipe.name}" triggered manually.`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Process Orchestration & Robotic Workflow Automation"
          subtitle="Multi-step business process pipelines, automated batch triggers, and cross-department workflows."
          breadcrumbs={[{ label: 'Technology' }, { label: 'Process Automation' }]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pipelines.map((pipe) => (
          <div key={pipe.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                  {pipe.status}
                </span>
                <span className="text-xs text-slate-400">Trigger: {pipe.trigger}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{pipe.name}</h3>
              <p className="text-xs text-slate-600">{pipe.description}</p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {pipe.steps.map((st, i) => (
                  <React.Fragment key={i}>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                      {st}
                    </span>
                    {i < pipe.steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRun(pipe)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run Pipeline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessAutomationPage;
