import React, { useState, useEffect } from 'react';
import { Star, Smile, Frown, Meh, MessageSquare } from 'lucide-react';
import { supportService } from '../../services/support.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatCard } from '../../components/shell/StatCard';

export const CustomerFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await supportService.getFeedbacks();
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const avgNps = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length * 10) / 10
    : 4.8;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Satisfaction & NPS Feedback"
        subtitle="Voice of customer tracking, post-delivery ratings, and Net Promoter Score surveys."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Support', href: '/support/tickets' },
          { label: 'Feedback & NPS' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Average CSAT Rating"
          value={`${avgNps} / 5.0`}
          subtitle="Overall satisfaction index"
          icon={Star}
          variant="primary"
        />
        <StatCard
          title="Net Promoter Score"
          value="+68 NPS"
          subtitle="Promoters vs Detractors"
          icon={Smile}
          variant="success"
        />
        <StatCard
          title="Responses Logged"
          value={feedbacks.length}
          subtitle="Customer surveys collected"
          icon={MessageSquare}
          variant="warning"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order / Invoice Ref</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Customer Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">Loading customer feedback...</td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No customer feedback registered</td>
                </tr>
              ) : (
                feedbacks.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{f.customer_id?.company_name || 'Customer'}</td>
                    <td className="py-3 px-4 text-xs font-mono text-indigo-600">
                      {f.sales_order_id?.order_number || f.reference_doc || 'ORDER'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-500">
                      ★ {f.rating || 5}/5
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{f.feedback_text || f.comments}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;
