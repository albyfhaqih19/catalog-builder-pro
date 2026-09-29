import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { MediaItem } from '../types/media';
import { mediaRepository } from '../services';
import { Image as ImageIcon, Upload, Search, Trash2 } from 'lucide-react';

export const MediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const items = await mediaRepository.getAllMedia();
    setMediaList(items);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      await mediaRepository.uploadMedia(files[0]);
      await loadMedia();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus gambar dari Media Library?')) {
      await mediaRepository.deleteMedia(id);
      await loadMedia();
    }
  };

  const filtered = mediaList.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout
      title="Media Library"
      subtitle="Kelola seluruh asset gambar produk dan logo bisnis Anda."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          <label className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer shadow-sm transition">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Mengupload...' : 'Upload Media Baru'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs group">
              <div className="aspect-square bg-slate-100 overflow-hidden">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-700 truncate" title={item.name}>{item.name}</span>
                <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
