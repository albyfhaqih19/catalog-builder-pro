import React, { useState } from 'react';
import { X, Download, FileCode, Archive, FileText, Check, Loader2 } from 'lucide-react';
import { Catalog } from '../../types/catalog';
import { exportToZip, generateStandaloneHtml, exportToPdf } from '../../lib/exporter';

interface ExportModalProps {
  catalog: Catalog;
  isOpen: boolean;
  onClose: () => void;
  previewElementId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  catalog,
  isOpen,
  onClose,
  previewElementId = 'catalog-preview-container',
}) => {
  const [loadingType, setLoadingType] = useState<'html' | 'zip' | 'pdf' | null>(null);

  if (!isOpen) return null;

  const handleExportHtml = () => {
    setLoadingType('html');
    try {
      const htmlStr = generateStandaloneHtml(catalog);
      const blob = new Blob([htmlStr], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${catalog.slug}-catalog.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengeksport HTML');
    } finally {
      setLoadingType(null);
    }
  };

  const handleExportZip = async () => {
    setLoadingType('zip');
    try {
      const zipBlob = await exportToZip(catalog);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${catalog.slug}-website-bundle.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengeksport ZIP');
    } finally {
      setLoadingType(null);
    }
  };

  const handleExportPdf = async () => {
    setLoadingType('pdf');
    try {
      await exportToPdf(previewElementId, `${catalog.slug}-catalog.pdf`);
    } catch (e) {
      alert('Gagal membuat PDF. Pastikan preview katalog sedang ditampilkan.');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-lg">Export Katalog Produk</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Pilih format dokumen atau file website yang ingin Anda unduh:
          </p>

          {/* HTML Option */}
          <div 
            onClick={handleExportHtml}
            className="p-4 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 cursor-pointer transition flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Export File HTML Standalone
                {loadingType === 'html' && <Loader2 className="w-4 h-4 animate-spin text-sky-600" />}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Satu file <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">index.html</code> siap buka langsung di browser tanpa butuh server.
              </p>
            </div>
          </div>

          {/* ZIP Option */}
          <div 
            onClick={handleExportZip}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Archive className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Export Bundle ZIP Website
                {loadingType === 'zip' && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Arsip ZIP berisi HTML, CSS, dan panduan asset untuk di-upload ke server hosting Anda sendiri.
              </p>
            </div>
          </div>

          {/* PDF Option */}
          <div 
            onClick={handleExportPdf}
            className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer transition flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Export Dokumen PDF Print (A4)
                {loadingType === 'pdf' && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Buku katalog PDF resolusi tinggi siap dicetak atau dikirimkan langsung ke calon pembeli.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
