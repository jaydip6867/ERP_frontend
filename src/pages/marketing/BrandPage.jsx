import React, { useState, useEffect } from 'react';
import { Palette, Plus, ExternalLink, Image, FileText, CheckCircle2 } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const BrandPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    asset_type: 'LOGO',
    category: 'Brand',
    file_url: '',
    tags: '',
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getMarketingAssets({ category: 'Brand' });
      setAssets(res.data?.assets || []);
    } catch (err) {
      toast.error('Failed to load brand assets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await operationsService.createMarketingAsset({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : [],
      });
      toast.success('Brand asset uploaded & catalogued');
      setShowModal(false);
      loadAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload asset');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Brand Guidelines, Assets & Identity Vault"
          subtitle="Official Danza logomarks, typography specs, color palettes, and certified brand guidelines."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Brand Identity' }]}
        />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Brand Asset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Loading brand assets...</div>
        ) : assets.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No brand assets catalogued yet.
          </div>
        ) : (
          assets.map((a) => (
            <div key={a._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-50 text-indigo-700 font-semibold">
                    {a.asset_type}
                  </span>
                  <span className="text-xs text-slate-400">Approved</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{a.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {a.tags?.map((t, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">High-Res Vector / Web</span>
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Download <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Brand Asset</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Asset Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="e.g. Danza Primary Logo SVG"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Asset Type</label>
                <select
                  value={formData.asset_type}
                  onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                >
                  <option value="LOGO">Official Logo</option>
                  <option value="BRAND_GUIDELINES">Brand Style Guide (PDF)</option>
                  <option value="DOCUMENT">Font & Typography</option>
                  <option value="IMAGE">Color Palette Palette Board</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Cloud Storage URL *</label>
                <input
                  required
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-lg"
                  placeholder="vector, transparent, dark-mode"
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandPage;
