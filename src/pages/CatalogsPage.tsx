import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Catalog } from '../types/catalog';
import { catalogRepository } from '../services';
import { Search, Plus, ExternalLink, Edit3, Trash2, Eye, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CatalogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setLoading(true);
    const list = await catalogRepository.getAllCatalogs();
    setCatalogs(list || []);
    setLoading(false);
  };

  const handleDeleteCatalog = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus katalog ini?')) {
      await catalogRepository.deleteCatalog(id);
      await loadCatalogs();
    }
  };

  // Safe null-handling catalog filter logic
  const filteredCatalogs = catalogs.filter(c => {
    const catalogName = (c?.name || (c as any)?.title || '').toLowerCase();
    const businessName = (c?.business?.name || (c as any)?.storeName || '').toLowerCase();
    const query = (search || '').toLowerCase();
    return catalogName.includes(query) || businessName.includes(query);
  });

  return (
    <MainLayout
      title="Daftar Katalog Saya"
      subtitle="Kelola dan publikasikan seluruh katalog produk digital Anda."
    >
      <div className="space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama katalog atau toko..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <button
            onClick={() => navigate('/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Katalog Baru</span>
          </button>
        </div>

        {/* Catalogs Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Memuat daftar katalog...</p>
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 max-w-md mx-auto space-y-4">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Tidak Ada Katalog Ditemukan</h3>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau buat katalog baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalogs.map(catalog => {
              const displayName = catalog?.name || (catalog as any)?.title || 'Katalog Tanpa Nama';
              const displayBiz = catalog?.business?.name || (catalog as any)?.storeName || 'Toko Tanpa Nama';
              const productCount = catalog?.products?.length || 0;

              return (
                <div key={catalog.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        catalog.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {catalog.status === 'published' ? '✓ Dipublikasikan' : 'Draft'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Eye className="w-3 h-3" /> {catalog.views || 0} Dilihat
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1">{displayName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{displayBiz} • {productCount} Produk</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/create?id=${catalog.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-bold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Visual</span>
                    </button>

                    {catalog.status === 'published' && (
                      <button
                        onClick={() => navigate(`/catalog/${catalog.slug}`)}
                        className="flex items-center justify-center p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
                        title="Buka Link Publik"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteCatalog(catalog.id)}
                      className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                      title="Hapus Katalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
