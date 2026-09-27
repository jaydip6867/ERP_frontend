import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { performanceService } from '../../services/performance.service';
import { PageHeader } from '../../components/shell/PageHeader';

export const LeaderboardPage = () => {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await performanceService.getLeaderboard();
      setBoard(res.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Sales Leaderboard"
        subtitle="Rankings of commercial representatives based on closed revenue, quotas met, and conversion efficiency."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Performance', href: '/performance/targets' },
          { label: 'Leaderboard' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {board.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border bg-white shadow-xs relative overflow-hidden ${
              index === 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
              }`}>
                #{index + 1}
              </div>
              <Trophy className={`w-6 h-6 ${index === 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <h4 className="text-base font-bold text-slate-900">{item.rep_name || item.name}</h4>
            <p className="text-xs text-slate-500">{item.designation || 'Sales Executive'}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Won Revenue</span>
              <span className="text-base font-bold text-emerald-600 font-mono">
                ₹{(item.total_revenue || item.revenue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Comprehensive Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4 text-center">Orders Closed</th>
                <th className="py-3 px-4 text-right">Revenue Contributed (₹)</th>
                <th className="py-3 px-4 text-center">Quota Attainment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">Loading leaderboard...</td>
                </tr>
              ) : board.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No sales leaderboard data available</td>
                </tr>
              ) : (
                board.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-700">#{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.rep_name || item.name}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{item.orders_closed || item.deals || 1}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ₹{(item.total_revenue || item.revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">
                      {item.attainment_percentage || 100}%
                    </td>
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

export default LeaderboardPage;
