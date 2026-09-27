import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Filter, MapPin, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const JobOpeningsPage = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    job_code: '',
    department: 'Human Resources',
    position: '',
    headcount: 1,
    location: 'Corporate HQ',
    employment_type: 'full_time',
    experience_years_min: 1,
    experience_years_max: 3,
    description: '',
    requirements: '',
    status: 'open',
  });

  useEffect(() => {
    loadOpenings();
  }, [statusFilter]);

  const loadOpenings = async () => {
    try {
      setLoading(true);
      const res = await hrService.getJobOpenings({ status: statusFilter || undefined });
      setOpenings(res.data?.jobOpenings || []);
    } catch (err) {
      toast.error('Failed to load job openings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createJobOpening(formData);
      toast.success('Job opening created successfully');
      setShowModal(false);
      setFormData({
        title: '',
        job_code: '',
        department: 'Human Resources',
        position: '',
        headcount: 1,
        location: 'Corporate HQ',
        employment_type: 'full_time',
        experience_years_min: 1,
        experience_years_max: 3,
        description: '',
        requirements: '',
        status: 'open',
      });
      loadOpenings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job opening');
    }
  };

  const filtered = openings.filter(o => 
    o.title?.toLowerCase().includes(search.toLowerCase()) ||
    o.job_code?.toLowerCase().includes(search.toLowerCase()) ||
    o.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Job Openings & Requisitions"
          subtitle="Manage active corporate job postings, requisitions, and recruitment headcount."
          breadcrumbs={[{ label: 'Human Resources' }, { label: 'Recruitment', link: '/hr/recruitment' }, { label: 'Job Openings' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Job Opening
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, code, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="on_hold">On Hold</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading job postings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
          No job openings found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.job_code || 'JOB'}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    item.status === 'open' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{item.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {item.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location || 'HQ'}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Headcount: <b>{item.headcount || 1}</b></span>
                <span>Exp: {item.experience_years_min || 0}-{item.experience_years_max || 0} yrs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create New Job Opening</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Job Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. Senior Backend Engineer"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Job Code</label>
                  <input
                    type="text"
                    value={formData.job_code}
                    onChange={(e) => setFormData({ ...formData, job_code: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. ENG-2026-01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Headcount</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.headcount}
                    onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="Responsibilities & key deliverables..."
                />
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
                  Create Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOpeningsPage;
