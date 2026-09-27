import React, { useState, useEffect } from 'react';
import { Kanban, List, Flame, ArrowRight, User, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leadService } from '../../services/lead.service';
import { PageHeader } from '../../components/shell/PageHeader';

const STAGES = [
  { key: 'new', label: 'New Enquiries', color: 'border-sky-400 bg-sky-50/50' },
  { key: 'contacted', label: 'Contacted', color: 'border-blue-400 bg-blue-50/50' },
  { key: 'qualified', label: 'Qualified', color: 'border-indigo-400 bg-indigo-50/50' },
  { key: 'proposal', label: 'Proposal Sent', color: 'border-amber-400 bg-amber-50/50' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-orange-400 bg-orange-50/50' },
  { key: 'won', label: 'Closed Won', color: 'border-emerald-400 bg-emerald-50/50' },
  { key: 'lost', label: 'Closed Lost', color: 'border-rose-400 bg-rose-50/50' },
];

export const LeadKanbanPage = () => {
  const [kanbanData, setKanbanData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKanban();
  }, []);

  const loadKanban = async () => {
    try {
      setLoading(true);
      const res = await leadService.getKanban();
      setKanbanData(res.data || {});
    } catch (err) {
      console.error('Failed to load kanban:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageMove = async (leadId, nextStage) => {
    try {
      await leadService.updateStage(leadId, { pipeline_stage: nextStage });
      loadKanban();
    } catch (err) {
      alert('Failed to update stage');
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Visual Lead Pipeline (Kanban)"
        subtitle="Manage commercial deal progression through interactive stage columns."
        breadcrumbs={[
          { label: 'Commercial' },
          { label: 'Leads', path: '/leads' },
          { label: 'Kanban Pipeline' },
        ]}
        actions={
          <Link
            to="/leads"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <List className="w-3.5 h-3.5" />
            Table View
          </Link>
        }
      />

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading pipeline lanes...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((st, idx) => {
            const items = kanbanData[st.key] || [];
            const laneTotal = items.reduce((sum, item) => sum + (item.estimated_value || 0), 0);

            return (
              <div
                key={st.key}
                className="w-72 shrink-0 bg-slate-100/70 rounded-2xl p-3 flex flex-col max-h-[78vh] border border-slate-200"
              >
                {/* Lane Header */}
                <div className={`p-3 rounded-xl border-l-4 bg-white shadow-xs mb-3 ${st.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                      {st.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {items.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">
                    Value: ₹{laneTotal.toLocaleString()}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {items.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic">No leads in this stage</div>
                  ) : (
                    items.map((lead) => (
                      <div
                        key={lead._id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            #{lead.lead_code}
                          </span>
                          {lead.rating === 'hot' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" /> HOT
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                            {lead.contact_name}
                          </h4>
                          {lead.company_name && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{lead.company_name}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="font-bold text-slate-900">
                            ₹{lead.estimated_value?.toLocaleString() || 0}
                          </span>
                          <span className="text-[11px] text-slate-400">{lead.probability_percent}% win</span>
                        </div>

                        {/* Quick Move Trigger */}
                        {idx < STAGES.length - 1 && lead.pipeline_stage !== 'lost' && (
                          <button
                            onClick={() => handleStageMove(lead._id, STAGES[idx + 1].key)}
                            className="w-full mt-1 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded flex items-center justify-center gap-1 transition"
                          >
                            Advance to {STAGES[idx + 1].label} <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LeadKanbanPage;
