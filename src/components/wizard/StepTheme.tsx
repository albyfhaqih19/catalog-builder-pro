import React from 'react';
import { Catalog, ThemeConfig } from '../../types/catalog';
import { Palette, Check, Sparkles } from 'lucide-react';
import { PREBUILT_THEMES } from '../../lib/themes';

interface StepThemeProps {
  catalog: Catalog;
  onChange: (updated: Catalog) => void;
}

export const StepTheme: React.FC<StepThemeProps> = ({ catalog, onChange }) => {
  const currentTheme = catalog.theme;

  const handleSelectPrebuilt = (theme: ThemeConfig) => {
    onChange({
      ...catalog,
      theme: { ...theme },
    });
  };

  const updateColor = (field: keyof ThemeConfig, value: string) => {
    onChange({
      ...catalog,
      theme: {
        ...catalog.theme,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-5 h-5 text-sky-600" />
          <span>Pilih & Kustomisasi Tema Visual</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Pilih tema desain katalog atau atur palet warna utama, warna tombol, dan gaya font sendiri.
        </p>
      </div>

      {/* Prebuilt Themes Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Pilihan Tema Siap Pakai (10 Theme Presets)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PREBUILT_THEMES.map((theme) => {
            const isSelected = currentTheme.themeId === theme.themeId;
            return (
              <div
                key={theme.themeId}
                onClick={() => handleSelectPrebuilt(theme)}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between ${
                  isSelected ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-md scale-102' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="h-14 rounded-xl flex items-center justify-center p-2" style={{ backgroundColor: theme.backgroundColor }}>
                    <div className="w-full h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: theme.primaryColor, color: '#ffffff' }}>
                      Aa
                    </div>
                  </div>
                  <h5 className="font-bold text-slate-800 text-xs text-center">{theme.themeName}</h5>
                </div>

                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: theme.primaryColor }} />
                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: theme.secondaryColor }} />
                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: theme.backgroundColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fine-Tune Colors & Fonts */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Kustomisasi Palet Warna & Font Detail</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Warna Utama</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTheme.primaryColor}
                onChange={(e) => updateColor('primaryColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{currentTheme.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Warna Sekunder</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTheme.secondaryColor}
                onChange={(e) => updateColor('secondaryColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{currentTheme.secondaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Latar Belakang</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTheme.backgroundColor}
                onChange={(e) => updateColor('backgroundColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{currentTheme.backgroundColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Warna Teks</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTheme.textColor}
                onChange={(e) => updateColor('textColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{currentTheme.textColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Warna Tombol CTA</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTheme.buttonColor}
                onChange={(e) => updateColor('buttonColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{currentTheme.buttonColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Font Family</label>
            <select
              value={currentTheme.fontFamily}
              onChange={(e) => updateColor('fontFamily', e.target.value)}
              className="w-full py-2 px-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
