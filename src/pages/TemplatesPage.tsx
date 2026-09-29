import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { CATALOG_TEMPLATES } from '../lib/templates';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Sparkles, ArrowRight } from 'lucide-react';
import { catalogRepository } from '../services';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUseTemplate = async (templateId: string) => {
    const template = CATALOG_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newCatalog = await catalogRepository.saveCatalog({
      id: 'cat-' + Date.now().toString(36),
      name: template.sampleCatalog.name || template.name,
      slug: await catalogRepository.generateUniqueSlug(template.name),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      business: {
        name: template.sampleCatalog.business?.name || 'Toko Saya',
        category: template.sampleCatalog.business?.category || 'Umum',
        description: template.sampleCatalog.business?.description || '',
        logo: template.sampleCatalog.business?.logo || '',
        phone: template.sampleCatalog.business?.phone || '',
        whatsapp: template.sampleCatalog.business?.whatsapp || '',
        email: template.sampleCatalog.business?.email || '',
        website: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        address: template.sampleCatalog.business?.address || '',
        openingHours: '08.00 - 20.00 WIB',
        ctaText: 'Pesan via WA',
      },
      theme: {
        themeId: template.themeId,
        themeName: template.name,
        primaryColor: '#0284c7',
        secondaryColor: '#e0f2fe',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        buttonColor: '#0284c7',
        fontFamily: 'Plus Jakarta Sans',
        cardStyle: 'shadow',
        headerStyle: 'hero',
      },
      categories: [
        { id: 'cat-1', name: 'Kategori Utama', displayOrder: 1 }
      ],
      products: [
        {
          id: 'prod-1',
          name: 'Produk Unggulan 1',
          sku: 'PRD-001',
          categoryId: 'cat-1',
          price: 35000,
          description: 'Deskripsi singkat mengenai keunggulan produk ini.',
          images: [template.previewImage],
          stockStatus: 'available',
          badge: 'Best Seller',
          ctaText: 'Pesan Sekarang',
        }
      ]
    });

    navigate(`/create?id=${newCatalog.id}&step=01`);
  };

  return (
    <MainLayout
      title="Template Catalog Siap Pakai"
      subtitle="Pilih dari koleksi starter template industri untuk membuat katalog lebih cepat."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOG_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={tpl.previewImage}
                  alt={tpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-bold">
                  {tpl.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>
                </div>

                <button
                  onClick={() => handleUseTemplate(tpl.id)}
                  className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gunakan Template Ini</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
