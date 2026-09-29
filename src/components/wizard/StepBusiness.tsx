import React, { useState } from 'react';
import { Catalog, BusinessInfo } from '../../types/catalog';
import { Building2, Image as ImageIcon, MapPin, Phone, Mail, Globe, Instagram, Facebook, Clock, Upload } from 'lucide-react';
import { MediaLibraryModal } from '../media/MediaLibraryModal';

interface StepBusinessProps {
  catalog: Catalog;
  onChange: (updated: Catalog) => void;
}

export const StepBusiness: React.FC<StepBusinessProps> = ({ catalog, onChange }) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const biz = catalog.business;

  const updateBiz = (field: keyof BusinessInfo, value: string) => {
    onChange({
      ...catalog,
      business: {
        ...catalog.business,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-600" />
          <span>Informasi Profil Bisnis & Toko</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi data bisnis Anda yang akan ditampilkan di header & kontak katalog produk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nama Bisnis / Toko <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Kopi Senja / Vogue Fashion Studio"
            value={biz.name}
            onChange={(e) => updateBiz('name', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Kategori Bisnis
          </label>
          <select
            value={biz.category}
            onChange={(e) => updateBiz('category', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="Cafe & Bakery">Cafe & Bakery</option>
            <option value="Restoran & Makanan">Restoran & Makanan</option>
            <option value="Fashion & Aksesoris">Fashion & Aksesoris</option>
            <option value="Skincare & Kecantikan">Skincare & Kecantikan</option>
            <option value="Gadget & Elektronik">Gadget & Elektronik</option>
            <option value="Jasa Professional">Jasa Professional</option>
            <option value="Event Organizer">Event Organizer</option>
            <option value="Toko Online Umum">Toko Online Umum</option>
          </select>
        </div>

        {/* Logo URL & Picker */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Logo Bisnis
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {biz.logo ? (
                <img src={biz.logo} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={biz.logo}
                onChange={(e) => updateBiz('logo', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setIsMediaOpen(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Media</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Deskripsi Singkat Bisnis
          </label>
          <textarea
            rows={3}
            placeholder="Jelaskan secara singkat mengenai keunggulan produk dan toko Anda..."
            value={biz.description}
            onChange={(e) => updateBiz('description', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* WhatsApp CTA Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nomor WhatsApp Pemesanan <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Contoh: 6281234567890"
              value={biz.whatsapp}
              onChange={(e) => updateBiz('whatsapp', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gunakan format internasional tanpa simbol (contoh: 628123...)</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Telepon Operasional
          </label>
          <input
            type="text"
            placeholder="081234567890"
            value={biz.phone}
            onChange={(e) => updateBiz('phone', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Resmi
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="order@bisnis.com"
              value={biz.email}
              onChange={(e) => updateBiz('email', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Website Toko
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="https://..."
              value={biz.website}
              onChange={(e) => updateBiz('website', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Instagram
          </label>
          <input
            type="text"
            placeholder="@namamerek"
            value={biz.instagram}
            onChange={(e) => updateBiz('instagram', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* TikTok */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            TikTok
          </label>
          <input
            type="text"
            placeholder="@namamerek.official"
            value={biz.tiktok}
            onChange={(e) => updateBiz('tiktok', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Alamat Fisik Toko
          </label>
          <input
            type="text"
            placeholder="Jl. Senopati No. 45, Jakarta Selatan"
            value={biz.address}
            onChange={(e) => updateBiz('address', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Opening Hours */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Jam Operasional
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Senin - Minggu: 08.00 - 22.00 WIB"
              value={biz.openingHours}
              onChange={(e) => updateBiz('openingHours', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* CTA Text */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Teks Tombol CTA Default
          </label>
          <input
            type="text"
            placeholder="Pesan via WhatsApp"
            value={biz.ctaText}
            onChange={(e) => updateBiz('ctaText', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelectImage={(url) => updateBiz('logo', url)}
      />
    </div>
  );
};
