import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { 
  Users, 
  UserCheck, 
  UserX, 
  PlusCircle, 
  MessageCircle, 
  Search,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  getUsers, 
  approveUser, 
  rejectUser, 
  registerPendingUser,
  fetchUsersFromSupabase,
  UserPermission 
} from '../services/licenseService';
import { userService } from '../services/userService';

export const AdminPage: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const [users, setUsers] = useState<UserPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');

  // Form Input Manual User
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    // 1. Load local license users
    let currentUsers = getUsers();
    
    // 2. Fetch from Supabase license table if configured
    try {
      const remoteUsers = await fetchUsersFromSupabase();
      if (remoteUsers && remoteUsers.length > 0) {
        currentUsers = remoteUsers;
      }
    } catch (e) {
      console.warn('Failed fetching remote license users:', e);
    }

    // 3. Merge with registered users from userService
    try {
      const registeredUsers = await userService.getAllUsers();
      registeredUsers.forEach((reg) => {
        if (!currentUsers.some((u) => u.email.toLowerCase() === reg.email.toLowerCase())) {
          currentUsers.push({
            email: reg.email,
            name: reg.name,
            isPro: reg.role === 'admin' || reg.status === 'approved',
            approvalStatus: reg.status === 'approved' ? 'APPROVED' : (reg.status === 'rejected' ? 'REJECTED' : 'PENDING'),
            maxCatalogs: reg.status === 'approved' ? 999 : 1,
            maxProducts: reg.status === 'approved' ? 999 : 10,
            joinedAt: reg.createdAt ? reg.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          });
        }
      });
    } catch (e) {
      console.warn('Failed merging registered users:', e);
    }

    setUsers([...currentUsers]);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '190305' || adminPin === 'admin' || adminPin === 'alby') {
      setIsAdminAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleApprove = async (email: string) => {
    await approveUser(email, true);
    await userService.updateUserStatus(email, 'approved');
    await loadData();
  };

  const handleRejectOrRevoke = async (email: string) => {
    await rejectUser(email);
    await userService.updateUserStatus(email, 'rejected');
    await loadData();
  };

  const handleManualAddAndApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    registerPendingUser(newEmail, newName);
    approveUser(newEmail, true);
    setNewEmail('');
    setNewName('');
    loadData();
  };

  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING');
  const approvedUsers = users.filter((u) => u.approvalStatus === 'APPROVED');

  const displayedUsers = (activeTab === 'PENDING' ? pendingUsers : users).filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdminAuthenticated) {
    return (
      <MainLayout title="Admin Control Panel">
        <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Login Owner Admin Panel</h2>
          <p className="text-xs text-slate-500 mb-6">Masukkan PIN Owner Alby Fhaqih untuk meng-ACC akses pembeli.</p>
          
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Masukkan PIN Admin (190305)"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            {pinError && <p className="text-xs text-rose-500 font-semibold">PIN Salah! Silakan coba lagi.</p>}
            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              Masuk Dashboard Admin
            </button>
          </form>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Control Panel">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Owner Approval Portal
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">Panel Persetujuan (ACC) Pembeli</h1>
            <p className="text-xs text-slate-300">Setujui (ACC) pendaftaran pembeli baru untuk membuka akses fitur PRO Catalog Builder.</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Menunggu ACC Admin</p>
              <h3 className="text-xl font-bold text-amber-600">{pendingUsers.length} Pembeli</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">User PRO (Disetujui / ACC)</p>
              <h3 className="text-xl font-bold text-emerald-600">{approvedUsers.length} User</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total User Terdaftar</p>
              <h3 className="text-xl font-bold text-slate-900">{users.length} User</h3>
            </div>
          </div>
        </div>

        {/* Manual Add User Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
            <PlusCircle className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Tambah & Langsung ACC Pembeli Baru (Manual)</h2>
          </div>

          <form onSubmit={handleManualAddAndApprove} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Pembeli *</label>
              <input
                type="email"
                placeholder="Misal: pembeli@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Toko / Pembeli</label>
              <input
                type="text"
                placeholder="Misal: Toko Berkah"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Tambah & Langsung ACC PRO</span>
              </button>
            </div>
          </form>
        </div>

        {/* Approval Management Table & Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tab Filters */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Menunggu ACC ({pendingUsers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Semua User ({users.length})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari email / nama user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Pengguna / Pembeli</th>
                  <th className="py-3 px-6">Status Persetujuan (ACC)</th>
                  <th className="py-3 px-6">Paket Akses</th>
                  <th className="py-3 px-6">Tanggal Mendaftar</th>
                  <th className="py-3 px-6 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      Tidak ada user dalam kategori ini.
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((userItem, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div>
                          <div className="font-bold text-slate-900">{userItem.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{userItem.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {userItem.approvalStatus === 'APPROVED' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui (ACC PRO)
                          </span>
                        ) : userItem.approvalStatus === 'PENDING' ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full inline-flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> Menunggu ACC
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                            Ditolak / Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {userItem.isPro ? 'PRO Unlimited (999)' : 'Akses Terkunci'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {userItem.joinedAt}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {userItem.approvalStatus !== 'APPROVED' ? (
                          <button
                            onClick={() => handleApprove(userItem.email)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition inline-flex items-center gap-1.5"
                          >
                            <UserCheck className="w-4 h-4" /> ACC & Aktifkan PRO
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRejectOrRevoke(userItem.email)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-[11px] transition inline-flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" /> Cabut ACC
                          </button>
                        )}
                        
                        {/* Send WA Confirmation */}
                        <a
                          href={`https://wa.me/?text=Halo%20${encodeURIComponent(userItem.name)}%2C%20akun%20Catalog%20Builder%20PRO%20Anda%20dengan%20email%20*${encodeURIComponent(userItem.email)}*%20SUDAH%20DI-ACC%20oleh%20Admin%20Alby%20Fhaqih.%20Silakan%20login%20dan%20akses%20fitur%20PRO%20sekarang!`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[11px] transition inline-flex items-center gap-1"
                          title="Kirim Pesan WA Konfirmasi ACC"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AdminPage;
