import React, { useState, useEffect } from 'react';
import { FileCheck, Plus } from 'lucide-react';
import { qcService } from '../../services/qc.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/shell/DataTable';

export const QcTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await qcService.getTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Template Code',
      key: 'template_code',
      cellClassName: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Template Name',
      key: 'template_name',
      render: (val) => <span className="font-semibold text-slate-900">{val}</span>,
    },
    {
      header: 'Inspection Type',
      key: 'inspection_type',
      render: (t) => <span className="capitalize text-xs font-semibold text-slate-700">{t?.replace('_', ' ')}</span>,
    },
    {
      header: 'Sample Size %',
      key: 'sample_size_percent',
      render: (sz) => <span className="font-mono text-xs">{sz || 10}%</span>,
    },
    {
      header: 'Checkpoints',
      key: 'parameters',
      render: (p) => <span className="text-xs text-slate-600 font-medium">{p?.length || 0} testing parameters</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (st) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
          {st?.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Inspection Checklists & Templates"
        subtitle="Reusable inspection protocols mapped to products and manufacturing gates."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quality Control', href: '/qc' },
          { label: 'Templates' },
        ]}
      />

      <DataTable columns={columns} data={templates} loading={loading} />
    </div>
  );
};

export default QcTemplatesPage;
