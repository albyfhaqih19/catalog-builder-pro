import React from 'react';
import { Menu, Plus, Bell, Search, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onOpenMobileSidebar,
  title = "Dashboard Katalog",
  subtitle = "Kelola katalog produk digital Anda dengan MUDAH & CEPAT."
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Quick Banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
          <span>Gemini & ChatGPT Prompt Ready</span>
        </div>

        {/* Create Catalog CTA */}
        <button
          onClick={() => navigate('/create')}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-sky-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Katalog Baru</span>
        </button>
      </div>
    </header>
  );
};
