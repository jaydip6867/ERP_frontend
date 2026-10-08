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
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:opacity-90 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Brand Asset
        </button>
      </div>

      {/* Brand Identity & Guidelines Showcase */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 border border-brand/20 rounded-xl">
              <img src="/danza-mark.png" alt="Danza-son" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">DANZA-SON</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-brand/10 text-brand border border-brand/20">
                  Explorer Archetype
                </span>
              </div>
              <p className="text-sm font-semibold text-brand tracking-wider mt-0.5">
                Tagline: &ldquo;Ur Path Ur Style&rdquo;
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            Source: Brand Guideline.pdf &bull; Approved Identity System
          </div>
        </div>

        {/* Brand Colors & Typography Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colors */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand" />
              Official Brand Colors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark Green */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="h-20 bg-[#149346] flex items-end p-2.5">
                  <span className="text-white text-xs font-bold tracking-wide">Dark Green (Primary)</span>
                </div>
                <div className="p-3 bg-white space-y-1 text-xs font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">HEX:</span>
                    <strong className="text-slate-900 font-bold">#149346</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RGB:</span>
                    <span>20, 147, 70</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">HSL:</span>
                    <span>144, 76%, 33%</span>
                  </div>
                </div>
              </div>

              {/* Light Gray */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="h-20 bg-[#eeeff0] border-b border-slate-200 flex items-end p-2.5">
                  <span className="text-slate-800 text-xs font-bold tracking-wide">Light Gray (Secondary)</span>
                </div>
                <div className="p-3 bg-white space-y-1 text-xs font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">HEX:</span>
                    <strong className="text-slate-900 font-bold">#EEEFF0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RGB:</span>
                    <span>238, 239, 240</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">HSL:</span>
                    <span>210, 6%, 94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" />
              Approved Typography
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">Primary / Headlines</span>
                  <span className="text-xs font-mono text-brand font-semibold">30 &ndash; 36 pts</span>
                </div>
                <p className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Montserrat &bull; Ibrand Regular
                </p>
                <p className="text-xs text-slate-500">
                  Used for main headings, top navigation brand marks, marketing hero displays and high-impact titles.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">Secondary / Body & Tables</span>
                  <span className="text-xs font-mono text-brand font-semibold">10 &ndash; 12 pts</span>
                </div>
                <p className="text-sm font-medium text-slate-800" style={{ fontFamily: '"Microsoft Sans Serif", Montserrat, sans-serif' }}>
                  Microsoft Sans Serif &bull; Montserrat
                </p>
                <p className="text-xs text-slate-500">
                  Used for ERP data tables, invoices, reports, form controls, and standard body text.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Asset Library Quick Access */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Image className="w-4 h-4 text-brand" />
            Official Logo Assets (Extracted from Brand Guideline)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Logo Dark Green */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center group hover:border-brand/40 transition">
              <div className="h-20 w-full flex items-center justify-center p-2">
                <img src="/danza-logo.png" alt="Danza-son Full Logo" className="max-h-12 w-auto object-contain" />
              </div>
              <div className="w-full mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-900">Full Logo (Dark Green)</p>
                <p className="text-[11px] text-slate-500 font-mono">Transparent PNG</p>
                <a
                  href="/danza-logo.png"
                  download="danza-logo.png"
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-brand hover:text-white hover:border-brand transition"
                >
                  Download Asset
                </a>
              </div>
            </div>

            {/* Logo White */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center group hover:border-brand/40 transition">
              <div className="h-20 w-full flex items-center justify-center p-2">
                <img src="/danza-logo-white.png" alt="Danza-son White Logo" className="max-h-12 w-auto object-contain" />
              </div>
              <div className="w-full mt-3 pt-3 border-t border-slate-800">
                <p className="text-xs font-bold text-white">Full Logo (White)</p>
                <p className="text-[11px] text-slate-400 font-mono">Transparent for Dark UI</p>
                <a
                  href="/danza-logo-white.png"
                  download="danza-logo-white.png"
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-brand hover:text-white hover:border-brand transition"
                >
                  Download Asset
                </a>
              </div>
            </div>

            {/* Mark Dark Green */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center group hover:border-brand/40 transition">
              <div className="h-20 w-full flex items-center justify-center p-2">
                <img src="/danza-mark.png" alt="Danza Head Mark" className="max-h-14 w-auto object-contain" />
              </div>
              <div className="w-full mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-900">Head Mark (Dark Green)</p>
                <p className="text-[11px] text-slate-500 font-mono">App Icon / Favicon</p>
                <a
                  href="/danza-mark.png"
                  download="danza-mark.png"
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-brand hover:text-white hover:border-brand transition"
                >
                  Download Asset
                </a>
              </div>
            </div>

            {/* Mark White */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center group hover:border-brand/40 transition">
              <div className="h-20 w-full flex items-center justify-center p-2">
                <img src="/danza-mark-white.png" alt="Danza Head Mark White" className="max-h-14 w-auto object-contain" />
              </div>
              <div className="w-full mt-3 pt-3 border-t border-slate-800">
                <p className="text-xs font-bold text-white">Head Mark (White)</p>
                <p className="text-[11px] text-slate-400 font-mono">Dark App / Mobile Mark</p>
                <a
                  href="/danza-mark-white.png"
                  download="danza-mark-white.png"
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-brand hover:text-white hover:border-brand transition"
                >
                  Download Asset
                </a>
              </div>
            </div>
          </div>
        </div>
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
