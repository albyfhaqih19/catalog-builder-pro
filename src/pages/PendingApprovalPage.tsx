import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, MessageCircle, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PendingApprovalPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [checkSuccess, setCheckSuccess] = useState(false);

  const checkStatusNow = async () => {
    setIsChecking(true);
    try {
      await refreshUser();
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Auto-poll approval status every 3 seconds
    const interval = setInterval(async () => {
      await refreshUser();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-center relative z-10">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30 inline-flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Menunggu Persetujuan Admin (ACC)
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Akun Anda Dalam Antrean Verifikasi</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Terima kasih telah mendaftar di <strong className="text-sky-400">Catalog Builder PRO</strong>. Akun pembeli baru memerlukan persetujuan (ACC) langsung dari Admin.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl text-left text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Email Mendaftar:</span>
            <span className="font-mono text-white font-bold">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Status Akun:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending ACC Admin
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-400">Pemeriksaan Otomatis:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Auto-Checking Cloud DB...
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={checkStatusNow}
            disabled={isChecking}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Memeriksa ke Cloud Database...' : 'Cek Status ACC Sekarang'}</span>
          </button>

          <a
            href={`https://wa.me/628123456789?text=Halo%20Admin%20Alby%20Fhaqih%2C%20saya%20sudah%20membeli%20dan%20mendaftar%20akun%20Catalog%20Builder%20PRO%20dengan%20email%3A%20*${encodeURIComponent(user?.email || '')}*%0A%0AMohon%20bantu%20ACC%20dan%20aktifkan%20akses%20PRO%20saya.%20Terima%20kasih!`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2.5 text-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Konfirmasi & Minta ACC via WhatsApp</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          *Sistem secara otomatis mengecek persetujuan dari Admin. Begitu Admin menekan <strong className="text-slate-300">ACC</strong>, halaman ini akan otomatis masuk ke Studio.
        </p>
      </div>
    </div>
  );
};
