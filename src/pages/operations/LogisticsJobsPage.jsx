import React, { useState, useEffect } from 'react';
import { Truck, Plus, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const LogisticsJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    consignment_number: '',
    carrier_name: 'Blue Dart Express',
    tracking_number: '',
    origin_city: 'Surat',
    destination_city: 'Mumbai',
    shipping_cost: 1200,
    status: 'in_transit',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getLogistics();
      setJobs(res.data?.logisticsJobs || []);
    } catch (err) {
      toast.error('Failed to load logistics shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createLogistics(formData);
      toast.success('Shipment booking logged');
      setShowModal(false);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book consignment');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Outbound Logistics & Carrier Fleet Tracking"
          subtitle="Multi-courier dispatch management, consignment docket tracking, POD verification, and freight costs."
          breadcrumbs={[{ label: 'Operations' }, { label: 'Logistics Jobs' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Book Consignment
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Consignment No</th>
                <th className="px-5 py-3">Carrier / Courier</th>
                <th className="px-5 py-3">Origin & Destination</th>
                <th className="px-5 py-3">AWB / Tracking</th>
                <th className="px-5 py-3">Freight Cost</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading freight shipments...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No active dispatches found.</td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{j.consignment_number}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{j.carrier_name}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {j.origin_city} → {j.destination_city}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-600">
                      {j.tracking_number || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-mono">₹{(j.shipping_cost || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${
                        j.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                        j.status === 'in_transit' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {j.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Book Outbound Consignment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Consignment No *</label>
                  <input
                    required
                    type="text"
                    value={formData.consignment_number}
                    onChange={(e) => setFormData({ ...formData, consignment_number: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="e.g. CSG-2026-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Carrier</label>
                  <input
                    type="text"
                    value={formData.carrier_name}
                    onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Origin City</label>
                  <input
                    type="text"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Destination City</label>
                  <input
                    type="text"
                    value={formData.destination_city}
                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tracking / AWB No</label>
                  <input
                    type="text"
                    value={formData.tracking_number}
                    onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                    placeholder="AWB123456"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Freight Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.shipping_cost}
                    onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 text-sm border rounded-lg"
                  />
                </div>
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
                  Book Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsJobsPage;
