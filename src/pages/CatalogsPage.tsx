import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Catalog } from '../types/catalog';
import { catalogRepository } from '../services';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Globe, Trash2, BookOpen, Search } from 'lucide-react';

export const CatalogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    const list = await catalogRepository.getAllCatalogs();
    setCatalogs(list);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus katalog ini secara permanen?')) {
      await catalogRepository.deleteCatalog(id);
      await loadCatalogs();
    }
  };

  const filtered = catalogs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.business.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout title="Katalog Saya" subtitle="Kelola seluruh daftar katalog produk digital yang telah Anda buat.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari katalog atau nama toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Katalog Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex gap-4">
                <img
                  src={cat.business.logo || cat.products[0]?.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80'}
                  alt={cat.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    cat.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cat.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base truncate mt-1">{cat.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{cat.business.name} &bull; {cat.products?.length || 0} Produk</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => navigate(`/create?id=${cat.id}&step=06`)}
                  className="flex items-center gap-1 font-semibold text-sky-600 hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Editor</span>
                </button>

                {cat.status === 'published' && (
                  <button
                    onClick={() => navigate(`/catalog/${cat.slug}`)}
                    className="flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Halaman Publik</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
