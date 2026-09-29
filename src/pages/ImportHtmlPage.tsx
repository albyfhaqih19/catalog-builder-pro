import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { FileCode, Sparkles, ArrowRight } from 'lucide-react';

export const ImportHtmlPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      title="Import Kode HTML AI"
      subtitle="Paste dan sanitasi kode HTML dari Gemini / ChatGPT untuk katalog Anda."
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
          <FileCode className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">Alur Import Kode HTML AI</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Impor kode HTML disatukan di dalam Wizard Pembuatan Katalog untuk memastikan data produk & marker <code className="bg-slate-100 text-sky-700 px-1 py-0.5 rounded">data-cb-*</code> terhubung secara sinkron.
          </p>
        </div>

        <button
          onClick={() => navigate('/create?step=05')}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition"
        >
          <span>Buka Import Wizard (Step 05)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </MainLayout>
  );
};
