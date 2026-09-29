import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isOwnerEmail } from '../services/licenseService';
import { Sparkles, Mail, Lock, LogIn, UserPlus, AlertCircle, Clock, CheckCircle2, Store, User, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, register } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || isOwnerEmail(user.email)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusReason, setStatusReason] = useState<'pending' | 'rejected' | 'not_found' | null>(null);
  const [registerResult, setRegisterResult] = useState<{ isOwner: boolean; name: string } | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusReason(null);

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 50);
      } else {
        if (result.reason === 'pending' || result.reason === 'rejected' || result.reason === 'not_found') {
          setStatusReason(result.reason);
        }
        setErrorMessage(result.message || 'Gagal login. Periksa email atau kata sandi Anda.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setRegisterResult(null);

    try {
      const profile = await register(regName, regEmail, regPassword, regStoreName);
      setRegisterResult({
        isOwner: profile.role === 'admin',
        name: profile.name,
      });
      setLoginEmail(regEmail);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegStoreName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            CATALOG<span className="text-sky-400">PRO</span>
          </h1>
          <p className="text-xs text-slate-400">
            Platform Pembuat Katalog Digital & Sistem Persetujuan Admin (ACC)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setStatusReason(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setRegisterResult(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'register' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun Baru</span>
          </button>
        </div>

        {/* Status Messages */}
        {statusReason === 'pending' && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <Clock className="w-5 h-5 shrink-0" />
              <span>Menunggu Persetujuan Admin (ACC)</span>
            </div>
            <p className="text-amber-200/90 text-[11px] leading-relaxed">
              Akun Anda telah terdaftar tetapi <strong>belum disetujui oleh Admin / Pemilik Aplikasi</strong>. Silakan hubungi Admin atau tunggu persetujuan ACC sebelum masuk ke Dashboard.
            </p>
          </div>
        )}

        {statusReason === 'rejected' && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 text-xs text-red-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Pendaftaran Ditolak</span>
            </div>
            <p className="text-red-200/90 text-[11px] leading-relaxed">
              Permohonan pendaftaran akun Anda telah ditolak oleh Admin.
            </p>
          </div>
        )}

        {statusReason === 'not_found' && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Email Belum Terdaftar</span>
            </div>
            <p className="text-amber-200/90 text-[11px] leading-relaxed">
              Email yang Anda masukkan belum terdaftar di aplikasi. Silakan pindah ke tab <strong>"Daftar Akun Baru"</strong> untuk mendaftarkan akun Anda.
            </p>
            <button
              onClick={() => { setActiveTab('register'); setStatusReason(null); setErrorMessage(''); }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              Daftar Sekarang &rarr;
            </button>
          </div>
        )}

        {errorMessage && !statusReason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {registerResult && (
          <div className={`p-4 rounded-2xl text-xs space-y-1 ${
            registerResult.isOwner 
              ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {registerResult.isOwner ? <ShieldCheck className="w-5 h-5 text-purple-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              <span>{registerResult.isOwner ? 'Terdaftar Sebagai Pemilik / Admin Utama!' : 'Pendaftaran Berhasil!'}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {registerResult.isOwner ? (
                <>Selamat <strong>{registerResult.name}</strong>! Anda adalah pendaftar pertama sehingga akun Anda otomatis menjadi <strong className="text-purple-300">ADMIN UTAMA (Approved)</strong>. Anda dapat langsung Masuk sekarang.</>
              ) : (
                <>Akun Anda berhasil didaftarkan. Status akun saat ini: <strong className="text-amber-300 font-bold">PENDING</strong>. Silakan tunggu hingga Admin / Pemilik menyetujui (ACC) akun Anda.</>
              )}
            </p>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Akun Anda
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="email.anda@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Masuk Akun'}</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nama Lengkap Pemilik <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nama Toko / Usaha
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Nama Usaha Anda"
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Pendaftaran Resmi <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="email.resmi@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Kata Sandi <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Mendaftarkan...' : 'Kirim Pendaftaran Akun'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
