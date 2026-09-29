import React, { useState } from 'react';
import { Catalog } from '../../types/catalog';
import { catalogRepository } from '../../services';
import { Globe, Download, ExternalLink, Check, Copy, Sparkles, Loader2 } from 'lucide-react';
import { ExportModal } from '../export/ExportModal';

interface StepPublishProps {
  catalog: Catalog;
  onPublishSuccess: (updated: Catalog) => void;
}

export const StepPublish: React.FC<StepPublishProps> = ({ catalog, onPublishSuccess }) => {
  const [slug, setSlug] = useState(catalog.slug || '');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const publicUrl = `${window.location.origin}/catalog/${catalog.slug}`;

  const handlePublish = async () => {
    setIsPublishing(true);
    setErrorMsg('');
    try {
      const uniqueSlug = await catalogRepository.generateUniqueSlug(slug, catalog.id);
      const catalogToSave: Catalog = {
        ...catalog,
        status: 'published',
        slug: uniqueSlug,
        updatedAt: new Date().toISOString()
      };
      await catalogRepository.saveCatalog(catalogToSave);
      const published = await catalogRepository.publishCatalog(catalog.id, uniqueSlug);
      setSlug(uniqueSlug);
      onPublishSuccess(published || catalogToSave);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mempublikasikan katalog');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <Globe className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900">Publikasikan Katalog Digital Anda</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Katalog Anda akan dapat diakses secara publik dan siap dibagikan ke calon pelanggan via WhatsApp atau Social Media.
        </p>
      </div>

      {/* Published URL Card */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            URL Slug Katalog Kustom
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-white border border-slate-200 px-3 py-2.5 rounded-xl">
              /catalog/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-red-600">{errorMsg}</p>
        )}

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
        >
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{catalog.status === 'published' ? 'Update & Simpan Publikasi' : 'Publikasikan Sekarang'}</span>
        </button>
      </div>

      {/* Live Public Link Share Bar */}
      {catalog.status === 'published' && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4 text-emerald-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">Katalog Berhasil Dipublikasikan!</h4>
            </div>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              ONLINE
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-200">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 text-xs font-mono text-slate-700 bg-transparent focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Ter-copy!' : 'Copy Link'}</span>
            </button>
            <a
              href={`/catalog/${catalog.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
              title="Buka Halaman Publik"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Export Options CTA */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Unduh File Offline</h4>
          <p className="text-xs text-slate-500">Export katalog Anda ke format PDF, HTML, atau ZIP.</p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF / HTML / ZIP</span>
        </button>
      </div>

      <ExportModal
        catalog={catalog}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
