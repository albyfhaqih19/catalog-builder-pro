import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Catalog, Product } from '../types/catalog';
import { catalogRepository } from '../services';
import { Phone, MapPin, Clock, MessageCircle, Search, ArrowLeft, Share2, Check, Lock, Download } from 'lucide-react';

export const PublicCatalogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      catalogRepository.getCatalogBySlug(slug).then(c => {
        setCatalog(c);
        setLoading(false);
        if (c && c.status === 'published') {
          catalogRepository.incrementViews(slug);
        }
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Memuat Katalog Produk...</p>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Katalog Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">URL katalog yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-sky-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Security Check: Block public access if status is draft
  if (catalog.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
        <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center max-w-md shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Katalog Belum Dipublikasikan</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Katalog <strong className="text-white">"{catalog.name}"</strong> masih berstatus <span className="text-amber-400 font-bold">Draft</span> dan belum dipublikasikan untuk umum.
          </p>
          <button
            onClick={() => navigate(`/create?id=${catalog.id}&step=07`)}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
          >
            Buka Editor untuk Publish
          </button>
        </div>
      </div>
    );
  }

  const { business, products, categories, theme } = catalog;

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getWaLink = (product: Product) => {
    const cleanWa = business.whatsapp ? business.whatsapp.replace(/[^0-9]/g, '') : '6281234567890';
    const text = encodeURIComponent(`Halo ${business.name}, saya berminat memesan produk *${product.name}* (Harga: Rp ${product.price.toLocaleString('id-ID')}). Apakah stok masih tersedia?`);
    return `https://wa.me/${cleanWa}?text=${text}`;
  };

  return (
    <div 
      className="min-h-screen pb-16 font-sans transition-colors"
      style={{ 
        backgroundColor: theme.backgroundColor || '#f8fafc',
        color: theme.textColor || '#0f172a' 
      }}
    >
      {/* Top Floating Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard Studio</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition print:hidden shadow-xs"
              title="Simpan / Cetak PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan PDF</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition print:hidden"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Ter-copy' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <header 
        className="py-12 px-4 text-center border-b border-slate-200/60 shadow-xs"
        style={{ backgroundColor: theme.primaryColor, color: '#ffffff' }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {business.logo && (
            <img
              src={business.logo}
              alt={business.name}
              className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-md"
            />
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{business.name}</h1>
            {business.description && (
              <p className="text-sm opacity-90 max-w-xl mx-auto mt-2 leading-relaxed">
                {business.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs opacity-85 pt-2">
            {business.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {business.address}</span>}
            {business.openingHours && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {business.openingHours}</span>}
            {business.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {business.phone}</span>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Search & Category Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCat === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Produk ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCat === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 text-sm font-medium">Tidak ada produk yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="relative">
                  <img
                    src={p.images[0] || 'https://via.placeholder.com/400'}
                    alt={p.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  {p.badge && (
                    <span 
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-xl font-extrabold" style={{ color: theme.primaryColor }}>
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>
                      {p.discountPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          Rp {p.discountPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={getWaLink(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: theme.buttonColor || '#0284c7' }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{p.ctaText || 'Pesan via WA'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
        <p>&copy; {new Date().getFullYear()} {business.name}. Powered by Catalog Builder Pro.</p>
        <p>Hubungi: {business.whatsapp || business.phone} | {business.email}</p>
      </footer>
    </div>
  );
};
