import React, { useState } from 'react';
import { Catalog, Product, Category, StockStatus, BadgeType } from '../../types/catalog';
import { Package, Plus, Trash2, Edit3, Copy, Search, Tag, Image as ImageIcon, Check } from 'lucide-react';
import { MediaLibraryModal } from '../media/MediaLibraryModal';

interface StepProductsProps {
  catalog: Catalog;
  onChange: (updated: Catalog) => void;
}

export const StepProducts: React.FC<StepProductsProps> = ({ catalog, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Category Actions
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: 'cat-' + Date.now().toString(36),
      name: newCatName.trim(),
      displayOrder: catalog.categories.length + 1,
    };
    onChange({
      ...catalog,
      categories: [...catalog.categories, newCat],
    });
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (catalog.categories.length <= 1) {
      alert('Katalog harus memiliki minimal 1 kategori.');
      return;
    }
    if (confirm('Hapus kategori ini? Produk di kategori ini akan dipindahkan ke kategori pertama.')) {
      const remainingCats = catalog.categories.filter(c => c.id !== catId);
      const fallbackId = remainingCats[0].id;
      const updatedProds = catalog.products.map(p => p.categoryId === catId ? { ...p, categoryId: fallbackId } : p);
      onChange({
        ...catalog,
        categories: remainingCats,
        products: updatedProds,
      });
    }
  };

  // Product Actions
  const handleAddProduct = () => {
    const newProd: Product = {
      id: 'prod-' + Date.now().toString(36),
      name: 'Produk Baru ' + (catalog.products.length + 1),
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      categoryId: catalog.categories[0]?.id || 'cat-1',
      price: 25000,
      description: 'Deskripsi singkat mengenai rasa, kualitas, dan manfaat produk ini.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
      stockStatus: 'available',
      badge: 'Best Seller',
      ctaText: catalog.business.ctaText || 'Pesan Sekarang',
    };
    onChange({
      ...catalog,
      products: [...catalog.products, newProd],
    });
    setEditingProduct(newProd);
  };

  const handleDuplicateProduct = (prod: Product) => {
    const dup: Product = {
      ...prod,
      id: 'prod-' + Date.now().toString(36),
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-COPY`,
    };
    onChange({
      ...catalog,
      products: [...catalog.products, dup],
    });
  };

  const handleDeleteProduct = (prodId: string) => {
    if (confirm('Hapus produk dari katalog?')) {
      onChange({
        ...catalog,
        products: catalog.products.filter(p => p.id !== prodId),
      });
      if (editingProduct?.id === prodId) setEditingProduct(null);
    }
  };

  const handleSaveProductEdit = (updated: Product) => {
    const updatedList = catalog.products.map(p => p.id === updated.id ? updated : p);
    onChange({
      ...catalog,
      products: updatedList,
    });
    setEditingProduct(null);
  };

  const filteredProducts = catalog.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCatFilter === 'all' || p.categoryId === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Category Manager Section */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-sky-600" />
            <span>Kategori Produk ({catalog.categories.length})</span>
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {catalog.categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <span>{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-slate-400 hover:text-red-600 transition"
              >
                &times;
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="+ Kategori Baru..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
            <button
              onClick={handleAddCategory}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-900 transition"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar & Product List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" />
              <span>Daftar Produk ({catalog.products.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tambah dan atur detail produk, foto, harga, dan badge.</p>
          </div>

          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Produk</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari produk atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="all">Semua Kategori</option>
            {catalog.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="flex gap-4">
                <img
                  src={p.images[0] || 'https://via.placeholder.com/150'}
                  alt={p.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{p.sku}</span>
                    {p.badge && (
                      <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate mt-0.5">{p.name}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-extrabold text-sky-600 text-sm">
                      Rp {p.price.toLocaleString('id-ID')}
                    </span>
                    {p.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp {p.discountPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">{p.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingProduct(p)}
                  className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                  title="Edit Produk"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicateProduct(p)}
                  className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                  title="Duplikat Produk"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Edit Detail Produk</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Produk</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SKU Produk</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    {catalog.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Stok</label>
                  <select
                    value={editingProduct.stockStatus}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockStatus: e.target.value as StockStatus })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value="available">Tersedia (Ready)</option>
                    <option value="out_of_stock">Stok Habis</option>
                    <option value="pre_order">Pre-Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga Normal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga Diskon / Coret (Rp)</label>
                  <input
                    type="number"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Badge Produk</label>
                  <select
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value as BadgeType })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value="">Tanpa Badge</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="New">New</option>
                    <option value="Promo">Promo</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teks Tombol CTA</label>
                  <input
                    type="text"
                    value={editingProduct.ctaText}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Image Input & Media Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Gambar Produk</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.images[0] || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaOpen(true)}
                    className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-900 transition"
                  >
                    Buka Media
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi Lengkap Produk</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveProductEdit(editingProduct)}
                className="px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 shadow-xs"
              >
                Simpan Produk
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelectImage={(url) => {
          if (editingProduct) {
            setEditingProduct({ ...editingProduct, images: [url] });
          }
        }}
      />
    </div>
  );
};
