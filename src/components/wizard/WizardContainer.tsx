import React, { useState, useEffect } from 'react';
import { Catalog, Product, Category, ThemeConfig } from '../../types/catalog';
import { catalogRepository } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { parseCatalogHtml, syncCatalogDataToHtml } from '../../lib/parser';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Package, 
  Palette, 
  Sparkles, 
  FileCode, 
  Edit3, 
  Globe, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  Loader2
} from 'lucide-react';
import { StepBusiness } from './StepBusiness';
import { StepProducts } from './StepProducts';
import { StepTheme } from './StepTheme';
import { StepPrompt } from './StepPrompt';
import { StepImport } from './StepImport';
import { VisualEditor } from '../editor/VisualEditor';
import { StepPublish } from './StepPublish';
import { PREBUILT_THEMES } from '../../lib/themes';

const WIZARD_STEPS = [
  { id: '01', title: '01 Bisnis', icon: Building2 },
  { id: '02', title: '02 Produk', icon: Package },
  { id: '03', title: '03 Tema', icon: Palette },
  { id: '04', title: '04 Prompt AI', icon: Sparkles },
  { id: '05', title: '05 Import HTML', icon: FileCode },
  { id: '06', title: '06 Visual Editor', icon: Edit3 },
  { id: '07', title: '07 Publish', icon: Globe },
];

export const WizardContainer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogId = searchParams.get('id');
  const initialStep = searchParams.get('step') || '01';

  const [currentStep, setCurrentStep] = useState<string>(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [catalog, setCatalog] = useState<Catalog>({
    id: 'cat-' + Date.now().toString(36),
    name: 'Katalog Produk Baru',
    slug: 'katalog-produk-' + Date.now().toString(36).slice(-4),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    business: {
      name: '',
      category: 'Toko Online',
      description: '',
      logo: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      address: '',
      openingHours: '08.00 - 20.00 WIB',
      ctaText: 'Pesan via WhatsApp',
    },
    theme: PREBUILT_THEMES[0],
    categories: [
      { id: 'cat-1', name: 'Utama', displayOrder: 1 }
    ],
    products: [
      {
        id: 'prod-1',
        name: 'Produk Sampel Pertama',
        sku: 'PRD-001',
        categoryId: 'cat-1',
        price: 50000,
        description: 'Deskripsi lengkap produk Anda di sini.',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
        stockStatus: 'available',
        ctaText: 'Pesan Sekarang'
      }
    ],
  });

  useEffect(() => {
    const urlStep = searchParams.get('step');
    if (urlStep && urlStep !== currentStep && WIZARD_STEPS.some(s => s.id === urlStep)) {
      setCurrentStep(urlStep);
    }
  }, [searchParams]);

  useEffect(() => {
    if (catalogId) {
      catalogRepository.getCatalogById(catalogId).then(existing => {
        if (existing) setCatalog(existing);
      });
    }
  }, [catalogId]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const catalogToSave = {
        ...catalog,
        userEmail: catalog.userEmail || user?.email,
        userId: catalog.userId || user?.id,
      };
      const saved = await catalogRepository.saveCatalog(catalogToSave);
      setCatalog(saved);
      if (!catalogId) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('id', saved.id);
        newParams.set('step', currentStep);
        setSearchParams(newParams, { replace: true });
      }
    } catch (err) {
      console.error("Gagal simpan draft:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === '01' && !catalog.business.name.trim()) {
      alert("Nama Bisnis / Toko wajib diisi terlebih dahulu!");
      return;
    }
    if (currentStep === '05' && catalog.htmlContent && !catalog.sanitizedHtml) {
      const parsed = parseCatalogHtml(catalog.htmlContent, catalog);
      if (parsed.sanitizedHtml) {
        catalog.sanitizedHtml = syncCatalogDataToHtml(parsed.sanitizedHtml, catalog);
      }
    }

    const stepIdx = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    const nextId = stepIdx < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[stepIdx + 1].id : currentStep;

    // Pindah step lebih dulu di UI agar responsif seketika
    if (nextId !== currentStep) {
      setCurrentStep(nextId);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('id', catalog.id);
      newParams.set('step', nextId);
      setSearchParams(newParams, { replace: true });
    }

    // Jalankan simpan draft di background
    handleSaveDraft().catch(console.error);
  };

  const handlePrevStep = () => {
    const stepIdx = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    if (stepIdx > 0) {
      const prevId = WIZARD_STEPS[stepIdx - 1].id;
      setCurrentStep(prevId);
      setSearchParams({ id: catalog.id, step: prevId }, { replace: true });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Wizard Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Wizard Pembuat Katalog Digital</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikuti 7 langkah praktis untuk menghasilkan katalog profesional yang siap dipublish.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Draft</span>
          </button>

          {currentStep !== '01' && (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1 border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          )}

          {currentStep !== '07' && (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <span>Lanjut Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max justify-between px-2">
          {WIZARD_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = WIZARD_STEPS.findIndex(s => s.id === currentStep) > idx;
            const isCurrent = step.id === currentStep;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    setCurrentStep(step.id);
                    setSearchParams({ id: catalog.id, step: step.id });
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrent 
                      ? 'bg-sky-600 text-white shadow-sm'
                      : isDone
                        ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent ? 'bg-white text-sky-600 font-extrabold' : isDone ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span>{step.title.split(' ')[1]}</span>
                </button>
                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 rounded-full ${isDone ? 'bg-sky-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Step Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        {currentStep === '01' && (
          <StepBusiness catalog={catalog} onChange={(updated) => setCatalog(updated)} />
        )}
        {currentStep === '02' && (
          <StepProducts catalog={catalog} onChange={(updated) => setCatalog(updated)} />
        )}
        {currentStep === '03' && (
          <StepTheme catalog={catalog} onChange={(updated) => setCatalog(updated)} />
        )}
        {currentStep === '04' && (
          <StepPrompt catalog={catalog} />
        )}
        {currentStep === '05' && (
          <StepImport 
            catalog={catalog} 
            onImportSuccess={(updatedCatalog) => {
              setCatalog(updatedCatalog);
              setCurrentStep('06');
              setSearchParams({ id: updatedCatalog.id, step: '06' });
            }} 
          />
        )}
        {currentStep === '06' && (
          <VisualEditor 
            catalog={catalog} 
            onChange={(updated) => setCatalog(updated)} 
          />
        )}
        {currentStep === '07' && (
          <StepPublish 
            catalog={catalog} 
            onPublishSuccess={(publishedCatalog) => setCatalog(publishedCatalog)} 
          />
        )}
      </div>
    </div>
  );
};
