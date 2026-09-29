import React, { useState, useEffect } from 'react';
import { X, Upload, Search, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { mediaRepository } from '../../services';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    const items = await mediaRepository.getAllMedia();
    setMediaList(items);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const uploaded = await mediaRepository.uploadMedia(file);
      await loadMedia();
      setSelectedUrl(uploaded.url);
    } catch (err) {
      alert('Gagal mengupload gambar. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus gambar dari Media Library?')) {
      await mediaRepository.deleteMedia(id);
      await loadMedia();
      if (selectedUrl && mediaList.find(m => m.id === id)?.url === selectedUrl) {
        setSelectedUrl(null);
      }
    }
  };

  const filtered = mediaList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-lg">Media Library & Foto Produk</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari media gambar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <label className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer shadow-sm transition">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Mengupload...' : 'Upload Foto Baru'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">Belum ada gambar di simpan.</p>
              <p className="text-slate-400 text-xs mt-1">Upload gambar produk atau logo bisnis Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 bg-slate-100 ${
                      isSelected ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={item.url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white flex items-center justify-between border-t border-slate-100">
                      <p className="text-[11px] font-medium text-slate-700 truncate max-w-[120px]" title={item.name}>
                        {item.name}
                      </p>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition"
                        title="Hapus gambar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-500">
            {selectedUrl ? '1 gambar dipilih' : 'Pilih salah satu gambar'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              disabled={!selectedUrl}
              onClick={() => {
                if (selectedUrl) {
                  onSelectImage(selectedUrl);
                  onClose();
                }
              }}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              Gunakan Gambar Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
