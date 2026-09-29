import React, { useState, useEffect } from 'react';
import { Catalog, Product } from '../../types/catalog';
import { DeviceMode, SelectedElement } from '../../types/editor';
import { generateDefaultCatalogHtml } from '../../lib/exporter';
import { syncCatalogDataToHtml } from '../../lib/parser';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Layers, 
  Package, 
  Palette, 
  Image as ImageIcon, 
  Edit3, 
  Upload, 
  Save, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MediaLibraryModal } from '../media/MediaLibraryModal';

interface VisualEditorProps {
  catalog: Catalog;
  onChange: (updated: Catalog) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ catalog, onChange }) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [activeTab, setActiveTab] = useState<'products' | 'business' | 'theme'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(catalog.products[0] || null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Generate current HTML view
  const currentBodyHtml = catalog.sanitizedHtml
    ? syncCatalogDataToHtml(catalog.sanitizedHtml, catalog)
    : generateDefaultCatalogHtml(catalog);

  const fullFrameHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: ${catalog.theme.primaryColor};
          --secondary: ${catalog.theme.secondaryColor};
          --bg: ${catalog.theme.backgroundColor};
          --text: ${catalog.theme.textColor};
          --button: ${catalog.theme.buttonColor};
          --font: '${catalog.theme.fontFamily}', sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font); background-color: var(--bg); color: var(--text); padding: 20px; line-height: 1.5; }
        img { max-width: 100%; height: auto; }
        [data-cb-type="product-card"] { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        [data-cb-type="product-card"]:hover { outline: 2px solid ${catalog.theme.primaryColor}; }
      </style>
    </head>
    <body>
      ${currentBodyHtml}
    </body>
    </html>
  `;

  // Update product helper
  const handleUpdateProduct = (field: keyof Product, value: any) => {
    if (!selectedProduct) return;
    const updatedProd = { ...selectedProduct, [field]: value };
    setSelectedProduct(updatedProd);

    const updatedProducts = catalog.products.map(p => p.id === updatedProd.id ? updatedProd : p);
    onChange({
      ...catalog,
      products: updatedProducts,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[750px] bg-slate-100 rounded-2xl border border-slate-300 overflow-hidden shadow-inner">
      {/* LEFT SIDEBAR: Navigator */}
      <div className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Navigasi Editor</h4>
        </div>

        <div className="flex lg:flex-col border-b lg:border-b-0 border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition flex-1 text-left ${
              activeTab === 'products' ? 'bg-sky-50 text-sky-600 border-l-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produk Katalog ({catalog.products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition flex-1 text-left ${
              activeTab === 'business' ? 'bg-sky-50 text-sky-600 border-l-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Profil Bisnis</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition flex-1 text-left ${
              activeTab === 'theme' ? 'bg-sky-50 text-sky-600 border-l-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Gaya Tema</span>
          </button>
        </div>

        {/* Tab Content: Products List selector */}
        {activeTab === 'products' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Klik Produk Untuk Edit</span>
            {catalog.products.map(p => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-sky-600 text-white font-bold shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <img src={p.images[0] || 'https://via.placeholder.com/50'} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate">{p.name}</p>
                    <p className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                      Rp {p.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CENTER CANVAS: Responsive Live Preview Frame */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/90 overflow-hidden">
        {/* Device Mode Switcher Toolbar */}
        <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceMode === 'desktop' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceMode === 'tablet' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceMode === 'mobile' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            <span>Mode: {deviceMode === 'desktop' ? '100% Full' : deviceMode === 'tablet' ? '768px' : '375px'}</span>
          </div>
        </div>

        {/* Live Canvas Viewport */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
          <div
            className="h-full bg-white transition-all duration-300 shadow-2xl overflow-hidden rounded-xl"
            style={{
              width: deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '768px' : '375px',
              maxWidth: '100%',
            }}
          >
            <iframe
              title="Catalog Live Preview"
              srcDoc={fullFrameHtml}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>

      {/* RIGHT INSPECTOR PANEL: Properties */}
      <div className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
        <div className="pb-3 border-b border-slate-200">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-sky-600" />
            <span>Inspector Elemen</span>
          </h4>
        </div>

        {selectedProduct ? (
          <div className="space-y-4">
            <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 flex items-center gap-3">
              <img src={selectedProduct.images[0]} className="w-10 h-10 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="font-bold text-xs text-sky-900 truncate">{selectedProduct.name}</p>
                <p className="text-[10px] text-sky-700">SKU: {selectedProduct.sku}</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nama Produk</label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={(e) => handleUpdateProduct('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Harga Produk (Rp)</label>
              <input
                type="number"
                value={selectedProduct.price}
                onChange={(e) => handleUpdateProduct('price', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-sky-600 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Harga Diskon / Coret (Rp)</label>
              <input
                type="number"
                value={selectedProduct.discountPrice || ''}
                onChange={(e) => handleUpdateProduct('discountPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Badge</label>
              <input
                type="text"
                value={selectedProduct.badge || ''}
                onChange={(e) => handleUpdateProduct('badge', e.target.value)}
                placeholder="Best Seller / Promo / New"
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Foto Produk</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedProduct.images[0] || ''}
                  onChange={(e) => handleUpdateProduct('images', [e.target.value])}
                  className="flex-1 px-3 py-2 border rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaOpen(true)}
                  className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
                >
                  Media
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Deskripsi</label>
              <textarea
                rows={4}
                value={selectedProduct.description}
                onChange={(e) => handleUpdateProduct('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Pilih salah satu produk di sidebar kiri untuk mulai mengedit.
          </div>
        )}
      </div>

      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelectImage={(url) => {
          if (selectedProduct) {
            handleUpdateProduct('images', [url]);
          }
        }}
      />
    </div>
  );
};
