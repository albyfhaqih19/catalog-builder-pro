import React, { useState } from 'react';
import { Catalog } from '../../types/catalog';
import { generateAiPrompt } from '../../lib/promptGenerator';
import { Sparkles, Copy, ExternalLink, RefreshCw, Check, Info } from 'lucide-react';

interface StepPromptProps {
  catalog: Catalog;
}

export const StepPrompt: React.FC<StepPromptProps> = ({ catalog }) => {
  const [promptText, setPromptText] = useState<string>(() => generateAiPrompt(catalog));
  const [copied, setCopied] = useState(false);

  const handleRegenerate = () => {
    const fresh = generateAiPrompt(catalog);
    setPromptText(fresh);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <span>Generator AI Prompt Otomatis</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Sistem telah mengolah data produk & bisnis Anda menjadi prompt terstruktur dengan marker <code className="bg-slate-100 text-sky-700 px-1 py-0.5 rounded font-mono">data-cb-*</code>.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Cara Menggunakan Prompt Ini (Tanpa API Key):</p>
          <ol className="list-decimal list-inside space-y-0.5 text-amber-800">
            <li>Klik tombol <strong>"Copy AI Prompt"</strong> di bawah ini.</li>
            <li>Klik <strong>"Buka Gemini"</strong> atau <strong>"Buka ChatGPT"</strong> untuk membuka tab browser AI eksternal.</li>
            <li>Paste prompt tersebut lalu tekan Send di Gemini/ChatGPT.</li>
            <li>Copy seluruh kode HTML yang dihasilkan AI, lalu kembalilah ke step berikutnya (Step 05: Import HTML).</li>
          </ol>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            AI System Prompt Generated
          </span>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Prompt</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            readOnly
            rows={12}
            value={promptText}
            className="w-full p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none leading-relaxed"
          />

          {copied && (
            <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Prompt copied successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span>{copied ? 'Ter-Copy ke Clipboard!' : 'Copy AI Prompt'}</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-2xl text-xs font-bold transition shadow-xs"
          >
            <span>Buka Gemini</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-3 rounded-2xl text-xs font-bold transition shadow-xs"
          >
            <span>Buka ChatGPT</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
          </a>
        </div>
      </div>
    </div>
  );
};
