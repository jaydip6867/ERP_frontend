import React, { useState, useEffect } from 'react';
import { Layers, Bookmark, Scale, FileText, Plus, Edit2 } from 'lucide-react';
import { productService } from '../../services/product.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';
import { Modal } from '../../components/shell/Modal';

export const CategoriesBrandsPage = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [hsns, setHsns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cRes, bRes, uRes, hRes] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
        productService.getUoms(),
        productService.getHsns(),
      ]);
      setCategories(cRes.data || []);
      setBrands(bRes.data || []);
      setUoms(uRes.data || []);
      setHsns(hRes.data || []);
    } catch (err) {
      console.error('Failed to load masters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeTab === 'categories') {
      setFormData({ category_name: '', category_code: '', description: '' });
    } else if (activeTab === 'brands') {
      setFormData({ brand_name: '', brand_code: '', description: '' });
    } else if (activeTab === 'uoms') {
      setFormData({ uom_name: '', uom_code: '', uom_type: 'quantity' });
    } else if (activeTab === 'hsns') {
      setFormData({ hsn_code: '', description: '', gst_rate: 18 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (activeTab === 'categories') {
        editingItem
          ? await productService.updateCategory(editingItem._id, formData)
          : await productService.createCategory(formData);
      } else if (activeTab === 'brands') {
        editingItem
          ? await productService.updateBrand(editingItem._id, formData)
          : await productService.createBrand(formData);
      } else if (activeTab === 'uoms') {
        editingItem
          ? await productService.updateUom(editingItem._id, formData)
          : await productService.createUom(formData);
      } else if (activeTab === 'hsns') {
        editingItem
          ? await productService.updateHsn(editingItem._id, formData)
          : await productService.createHsn(formData);
      }
      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Product Master Setup"
        subtitle="Manage product categories, brand trademarks, units of measurement, and official HSN tax codes."
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Product Masters' }]}
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'categories' ? 'Category' : activeTab === 'brands' ? 'Brand' : activeTab === 'uoms' ? 'UOM' : 'HSN'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'brands'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Brands ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('uoms')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'uoms'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          UOMs ({uoms.length})
        </button>
        <button
          onClick={() => setActiveTab('hsns')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'hsns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          HSN Codes ({hsns.length})
        </button>
      </div>

      {activeTab === 'categories' && (
        <DataTable
          columns={[
            { header: 'Code', key: 'category_code', cellClassName: 'font-mono font-bold' },
            { header: 'Category Name', key: 'category_name', cellClassName: 'font-semibold text-slate-900' },
            { header: 'Description', key: 'description' },
          ]}
          data={categories}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => {
                setEditingItem(row);
                setFormData({ ...row });
                setIsModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        />
      )}

      {activeTab === 'brands' && (
        <DataTable
          columns={[
            { header: 'Code', key: 'brand_code', cellClassName: 'font-mono font-bold' },
            { header: 'Brand Name', key: 'brand_name', cellClassName: 'font-semibold text-slate-900' },
            { header: 'Description', key: 'description' },
          ]}
          data={brands}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => {
                setEditingItem(row);
                setFormData({ ...row });
                setIsModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        />
      )}

      {activeTab === 'uoms' && (
        <DataTable
          columns={[
            { header: 'Code', key: 'uom_code', cellClassName: 'font-mono font-bold' },
            { header: 'UOM Name', key: 'uom_name', cellClassName: 'font-semibold text-slate-900' },
            { header: 'Type', key: 'uom_type', render: (val) => <span className="capitalize">{val}</span> },
          ]}
          data={uoms}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => {
                setEditingItem(row);
                setFormData({ ...row });
                setIsModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        />
      )}

      {activeTab === 'hsns' && (
        <DataTable
          columns={[
            { header: 'HSN Code', key: 'hsn_code', cellClassName: 'font-mono font-bold text-slate-900' },
            { header: 'Description', key: 'description' },
            { header: 'GST Rate', key: 'gst_rate', render: (val) => `${val}%` },
          ]}
          data={hsns}
          loading={loading}
          actions={(row) => (
            <button
              onClick={() => {
                setEditingItem(row);
                setFormData({ ...row });
                setIsModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'categories' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.category_name || ''}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  value={formData.category_code || ''}
                  onChange={(e) => setFormData({ ...formData, category_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            </>
          )}

          {activeTab === 'brands' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.brand_name || ''}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Code *</label>
                <input
                  type="text"
                  required
                  value={formData.brand_code || ''}
                  onChange={(e) => setFormData({ ...formData, brand_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            </>
          )}

          {activeTab === 'uoms' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UOM Name *</label>
                <input
                  type="text"
                  required
                  value={formData.uom_name || ''}
                  onChange={(e) => setFormData({ ...formData, uom_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UOM Code *</label>
                <input
                  type="text"
                  required
                  value={formData.uom_code || ''}
                  onChange={(e) => setFormData({ ...formData, uom_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg uppercase font-mono"
                />
              </div>
            </>
          )}

          {activeTab === 'hsns' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code *</label>
                <input
                  type="text"
                  required
                  value={formData.hsn_code || ''}
                  onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GST Tax Rate (%) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.gst_rate ?? 18}
                  onChange={(e) => setFormData({ ...formData, gst_rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CategoriesBrandsPage;
