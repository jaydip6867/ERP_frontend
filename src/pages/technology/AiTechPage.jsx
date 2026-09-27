import React, { useState } from 'react';
import { Sparkles, Bot, BrainCircuit, Play, CheckCircle2, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const AiTechPage = () => {
  const [agents, setAgents] = useState([
    {
      id: 'a1',
      name: 'Inventory Demand Forecaster Agent',
      model: 'Predictive ML & ARIMA',
      accuracy: '94.2%',
      status: 'Active',
      description: 'Analyzes 12 months historical sales, seasonal velocity, and open PO lead times to recommend stock replenishment.',
    },
    {
      id: 'a2',
      name: 'Customer Churn & Lead Scoring Agent',
      model: 'Ensemble Classification',
      accuracy: '91.8%',
      status: 'Active',
      description: 'Scores leads by industry, engagement score, order frequency, and flags dormant accounts requiring sales follow-up.',
    },
    {
      id: 'a3',
      name: 'Automated Invoice Data Extraction (OCR)',
      model: 'Vision Transformer & LLM',
      accuracy: '98.5%',
      status: 'Active',
      description: 'Extracts line items, tax IDs, invoice amounts, and vendor names from supplier PDF invoices into draft Purchase Bills.',
    },
  ]);

  const handleTriggerModel = (agent) => {
    toast.success(`Inference task launched for ${agent.name}. Model output generated.`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Artificial Intelligence & Machine Learning Suite"
          subtitle="Autonomous predictive models, computer vision OCR, automated lead scoring, and intelligent agents."
          breadcrumbs={[{ label: 'Technology' }, { label: 'AI Suite' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((ag) => (
          <div key={ag.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700">
                  {ag.status}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">{ag.accuracy} Precision</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-base">{ag.name}</h3>
              </div>
              <div className="text-xs font-mono text-slate-500 bg-slate-50 p-1.5 rounded">
                Model: {ag.model}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{ag.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => handleTriggerModel(ag)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run Inference
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTechPage;
