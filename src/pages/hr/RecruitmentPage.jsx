import React, { useState, useEffect } from 'react';
import { Briefcase, Users, UserCheck, Calendar, Plus, ChevronRight } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Link } from 'react-router-dom';

export const RecruitmentPage = () => {
  const [openings, setOpenings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oRes, cRes] = await Promise.all([
        hrService.getJobOpenings({ status: 'open' }),
        hrService.getCandidates(),
      ]);
      setOpenings(oRes.data?.jobOpenings || []);
      setCandidates(cRes.data?.candidates || []);
    } catch (err) {
      console.error('Failed to load recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Recruitment & Talent Acquisition"
          subtitle="Manage active job openings, candidate resumes, interview scheduling, and hiring workflows."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Recruitment' }]}
        />
        <div className="flex items-center gap-2">
          <Link
            to="/hr/job-openings"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Manage Job Openings
          </Link>
          <Link
            to="/hr/candidates"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Candidate Database
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{openings.length}</div>
            <div className="text-xs text-slate-500 font-medium">Open Positions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{candidates.length}</div>
            <div className="text-xs text-slate-500 font-medium">Applicants in Pipeline</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {candidates.filter((c) => c.status === 'hired').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Hired This Quarter</div>
          </div>
        </div>
      </div>

      {/* Recruitment Pipeline Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Active Job Openings</h3>
            <Link to="/hr/job-openings" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {openings.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">No active openings.</p>
            ) : (
              openings.slice(0, 5).map((job) => (
                <div key={job._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.department_id?.department_name} • {job.experience} experience
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {job.openings_count || 1} Open
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Recent Candidate Applications</h3>
            <Link to="/hr/candidates" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {candidates.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">No candidates in pipeline.</p>
            ) : (
              candidates.slice(0, 5).map((cand) => (
                <div key={cand._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{cand.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cand.job_opening_id?.title || 'General'} • {cand.source || 'Direct'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      cand.status === 'hired'
                        ? 'bg-emerald-50 text-emerald-700'
                        : cand.status === 'interview_scheduled'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cand.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentPage;
