import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ExternalLink, Download } from 'lucide-react';
import { operationsService } from '../../services/operations.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { toast } from 'react-toastify';

export const CataloguePage = () => {
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalogues();
  }, []);

  const loadCatalogues = async () => {
    try {
      setLoading(true);
      const res = await operationsService.getMarketingAssets({ category: 'Catalogue' });
      setCatalogues(res.data?.assets || [
        {
          _id: '1',
          title: 'Spring / Summer 2026 Wholesale Lookbook',
          file_url: 'https://danza.internal/catalogues/ss-2026.pdf',
          tags: ['SS26', 'Denim', 'Knitwear', 'Export'],
          file_size_kb: 14200,
        },
        {
          _id: '2',
          title: 'Institutional Corporate Uniforms Catalogue',
          file_url: 'https://danza.internal/catalogues/corporate-2026.pdf',
          tags: ['B2B', 'Corporate', 'Hospitality', 'Healthcare'],
          file_size_kb: 9800,
        },
      ]);
    } catch (err) {
      toast.error('Failed to load digital catalogues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Product Catalogues & Wholesale Lookbooks"
          subtitle="Digital PDF lookbooks, swatch books, wholesale price sheets, and shareable client links."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Catalogues' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {catalogues.map((cat) => (
          <div key={cat._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-50 text-indigo-700">
                  PDF Lookbook
                </span>
                <span className="text-xs text-slate-400">{Math.round(cat.file_size_kb / 1024)} MB</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{cat.title}</h3>
              <div className="flex flex-wrap gap-1">
                {cat.tags?.map((t, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Public CDN</span>
              <a
                href={cat.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
              >
                View PDF <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CataloguePage;
