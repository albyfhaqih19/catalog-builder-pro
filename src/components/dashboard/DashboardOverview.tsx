import React from 'react';
import { Catalog } from '../../types/catalog';
import { BookOpen, CheckCircle2, Package, Eye, Plus, ExternalLink, Edit3, Trash2, Globe, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardOverviewProps {
  catalogs: Catalog[];
  onDeleteCatalog: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ catalogs, onDeleteCatalog }) => {
  const navigate = useNavigate();

  const totalCatalogs = catalogs.length;
  const publishedCatalogs = catalogs.filter(c => c.status === 'published').length;
  const totalProducts = catalogs.reduce((acc, c) => acc + (c.products?.length || 0), 0);
  const totalViews = catalogs.reduce((acc, c) => acc + (c.views || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Sparkles className="w-64 h-64 text-sky-400" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs font-semibold border border-sky-400/20 mb-2">
            <span>Selamat Datang 👋</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Catalog Builder Pro Studio</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Buat, edit tampilan secara visual, impor dari AI Gemini/ChatGPT, dan publikasikan katalog produk profesional tanpa coding.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>+ Buat Katalog Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Katalog</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCatalogs}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Dipublikasikan</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{publishedCatalogs}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Produk</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Dilihat</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalViews}</h3>
          </div>
        </div>
      </div>

      {/* Recent Catalogs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Daftar Katalog Terbaru</h2>
          {catalogs.length > 0 && (
            <button
              onClick={() => navigate('/catalogs')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Lihat Semua ({catalogs.length})
            </button>
          )}
        </div>

        {catalogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 max-w-lg mx-auto my-8 space-y-4">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Belum Memiliki Katalog Produk</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mulai buat katalog produk digital profesional pertama Anda untuk mempermudah penjualan.
              </p>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Katalog Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Header Thumbnail / Cover */}
                <div className="h-40 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <img
                    src={cat.business.logo || cat.products[0]?.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs ${
                      cat.status === 'published' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {cat.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600">
                      {cat.business.category || 'Toko Digital'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5 line-clamp-1 group-hover:text-sky-600 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {cat.business.name} &bull; {cat.products?.length || 0} Produk
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => navigate(`/create?id=${cat.id}&step=06`)}
                      className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-sky-600 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Editor</span>
                    </button>

                    {cat.status === 'published' && (
                      <button
                        onClick={() => navigate(`/catalog/${cat.slug}`)}
                        className="flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Lihat Publik</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Hapus katalog '${cat.name}'?`)) {
                          onDeleteCatalog(cat.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                      title="Hapus Katalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
