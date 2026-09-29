import React, { useState } from 'react';
import { Catalog } from '../../types/catalog';
import { parseCatalogHtml, syncCatalogDataToHtml } from '../../lib/parser';
import { FileCode, ShieldCheck, Check, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';

interface StepImportProps {
  catalog: Catalog;
  onImportSuccess: (updatedCatalog: Catalog) => void;
}

export const StepImport: React.FC<StepImportProps> = ({ catalog, onImportSuccess }) => {
  const [rawHtmlInput, setRawHtmlInput] = useState<string>(catalog.htmlContent || '');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleImport = () => {
    if (!rawHtmlInput.trim()) {
      alert('Silakan paste kode HTML dari Gemini / ChatGPT terlebih dahulu.');
      return;
    }

    // Clean markdown codeblocks like ```html ... ``` if user copied with backticks
    let cleanedCode = rawHtmlInput.trim();
    if (cleanedCode.startsWith('```')) {
      cleanedCode = cleanedCode.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
    }

    const parseResult = parseCatalogHtml(cleanedCode, catalog);

    if (!parseResult.sanitizedHtml) {
      setImportStatus('error');
      setStatusMessage('HTML yang diimpor tidak valid atau berbahaya.');
      return;
    }

    // Sync current product structured data into parsed HTML
    const syncedHtml = syncCatalogDataToHtml(parseResult.sanitizedHtml, catalog);

    const updatedCatalog: Catalog = {
      ...catalog,
      htmlContent: cleanedCode,
      sanitizedHtml: syncedHtml,
    };

    if (parseResult.isFullyLinked || parseResult.linkedCount > 0) {
      setImportStatus('success');
      setStatusMessage(`Berhasil mengimpor dan memetakan ${parseResult.linkedCount} elemen ke katalog terstruktur!`);
    } else {
      setImportStatus('warning');
      setStatusMessage('Visual terimpor dengan aman. Beberapa elemen visual mungkin belum memiliki marker data-cb-* bawaan.');
    }

    onImportSuccess(updatedCatalog);
  };

  const handleClear = () => {
    setRawHtmlInput('');
    setImportStatus('idle');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-sky-600" />
          <span>Import & Sanitasi Kode HTML dari AI</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Paste kode HTML hasil dari Gemini atau ChatGPT di bawah. Sistem akan melakukan sanitasi keamanan DOMPurify secara otomatis.
        </p>
      </div>

      {/* Security Shield Indicator */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0" />
          <div>
            <p className="font-bold">Keamanan Sanitasi Terjamin (DOMPurify Engine Active)</p>
            <p className="text-slate-600 text-[11px]">
              Semua script eksternal, event handler mencurigakan, dan XSS vectors dibersihkan sebelum dirender di Live Canvas.
            </p>
          </div>
        </div>
      </div>

      {/* HTML Input Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Paste Hasil Kode HTML Gemini / ChatGPT Di Sini
          </span>
          {rawHtmlInput && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>

        <textarea
          rows={12}
          placeholder="<!DOCTYPE html>... atau <div class='catalog'>..."
          value={rawHtmlInput}
          onChange={(e) => setRawHtmlInput(e.target.value)}
          className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none leading-relaxed"
        />
      </div>

      {/* Status Feedback Banners */}
      {importStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-bold">{statusMessage}</p>
        </div>
      )}

      {importStatus === 'warning' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="font-bold">{statusMessage}</p>
        </div>
      )}

      {/* Action Import Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleImport}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95"
        >
          <span>Import HTML & Lanjut ke Visual Editor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
