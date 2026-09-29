import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { userService, UserProfile, UserStatus } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Search, RefreshCw, UserCheck } from 'lucide-react';

export const AdminApprovalPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    const interval = setInterval(() => {
      loadUsers();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await userService.getAllUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (user: UserProfile, newStatus: UserStatus) => {
    const actionText = newStatus === 'approved' ? 'menyetujui (ACC)' : 'menolak';
    if (confirm(`Apakah Anda yakin ingin ${actionText} akun ${user.name} (${user.email})?`)) {
      await userService.updateUserStatus(user.id, newStatus);
      await loadUsers();
      await refreshUser();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.storeName && u.storeName.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <MainLayout
      title="Persetujuan Akun User (Admin ACC Panel)"
      subtitle="Kelola persetujuan dan verifikasi pendaftaran akun seller baru di platform Catalog Builder Pro."
    >
      <div className="space-y-6">
        {/* Pending Counter Alert Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 p-6 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {pendingCount > 0 ? `${pendingCount} Akun Permohonan Menunggu ACC` : 'Semua Permohonan Akun Telah Diproses'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Persetujuan Admin diperlukan sebelum akun seller baru dapat masuk dan membuat katalog produk.
              </p>
            </div>
          </div>

          <button
            onClick={loadUsers}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua User ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ACC ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disetujui ({users.filter(u => u.status === 'approved').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'rejected' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ditolak ({users.filter(u => u.status === 'rejected').length})</span>
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari email, nama, atau toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">User & Nama Toko</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status ACC</th>
                  <th className="p-4 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Tidak ada data user yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-semibold text-slate-900">
                        <div>
                          <p className="font-bold">{u.name}</p>
                          {u.storeName && <p className="text-[11px] text-slate-400 font-normal">{u.storeName}</p>}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <Clock className="w-3 h-3" /> Pending ACC
                          </span>
                        )}
                        {u.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui (ACC)
                          </span>
                        )}
                        {u.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            {u.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(u, 'approved')}
                                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui (ACC)</span>
                              </button>
                            )}

                            {u.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(u, 'rejected')}
                                className="flex items-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            )}
                          </div>
                        )}
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
