import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Database, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout title="Pengaturan Aplikasi" subtitle="Konfigurasi penyimpanan database, akun, dan preferensi aplikasi.">
      <div className="space-y-6 max-w-3xl">
        {/* Database Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Status Persistence Repository</h3>
              <p className="text-xs text-slate-500">Penyimpanan data katalog & media produk.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Mode Persistence Aktif:</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 size={12} /> Supabase Cloud Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Sistem database terhubung secara otomatis ke Supabase Engine (<code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700">zzcbqkmwkfmttztriufv.supabase.co</code>) untuk mengamankan seluruh data katalog & pesanan produk Anda.
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Profil Akun Seller</h3>
              <p className="text-xs text-slate-500">Informasi pengguna yang sedang login.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Pemilik</label>
              <input type="text" readOnly value={user?.name || 'Alby Fhaqih (Owner)'} className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input type="text" readOnly value={user?.email || 'alfhaqihalby@gmail.com'} className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Toko / Bisnis</label>
              <input type="text" readOnly value={user?.storeName || 'Catalog Builder Pro'} className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Lisensi</label>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                  <ShieldCheck size={14} /> PRO UNLIMITED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
