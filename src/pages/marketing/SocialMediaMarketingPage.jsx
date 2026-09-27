import React from 'react';
import { Share2, Globe, Video, MessageCircle, Heart, Eye } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';

export const SocialMediaMarketingPage = () => {
  const posts = [
    {
      platform: 'Instagram',
      handle: '@danzaofficial',
      followers: '142K',
      engagement: '4.8%',
      recent_post: 'Behind the scenes: Precision computerized embroidery at Danza Surat Facility.',
      likes: '3,420',
      views: '48.5K',
    },
    {
      platform: 'LinkedIn',
      handle: 'Danza Garments & Textiles',
      followers: '28.5K',
      engagement: '6.2%',
      recent_post: 'Announcing our 100% Recycled Cotton Knitwear line for European exports.',
      likes: '890',
      views: '18.2K',
    },
    {
      platform: 'YouTube',
      handle: 'Danza Studio',
      followers: '19.4K',
      engagement: '5.1%',
      recent_post: 'Factory Tour: From Raw Yarn to Finished Garment in 72 Hours.',
      likes: '1,200',
      views: '35K',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Social Media Channels & Brand Audience Engagement"
          subtitle="Manage multi-platform presence across Instagram, LinkedIn, and YouTube, tracking reach and viral engagement."
          breadcrumbs={[{ label: 'Marketing' }, { label: 'Social Media' }]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((p, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                  {p.platform}
                </span>
                <span className="text-xs font-semibold text-slate-700">{p.followers} Followers</span>
              </div>
              <div className="font-mono text-xs text-slate-500">{p.handle}</div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                "{p.recent_post}"
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> {p.likes}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-indigo-500" /> {p.views}</span>
                <span className="font-semibold text-emerald-600">{p.engagement} Eng.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaMarketingPage;
