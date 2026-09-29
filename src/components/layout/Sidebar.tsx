import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  LayoutTemplate, 
  FileCode, 
  Image as ImageIcon, 
  Settings, 
  HelpCircle, 
  UserCircle,
  Sparkles,
  X,
  LogOut,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mainNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Katalog Saya', path: '/catalogs', icon: BookOpen },
    { name: 'Buat Katalog Baru', path: '/create', icon: PlusCircle, highlight: true },
    { name: 'Template Catalog', path: '/templates', icon: LayoutTemplate },
    { name: 'Import HTML AI', path: '/import-html', icon: FileCode },
    { name: 'Media Library', path: '/media', icon: ImageIcon },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    mainNav.splice(1, 0, {
      name: 'Persetujuan User (ACC)',
      path: '/admin',
      icon: UserCheck,
    } as any);
  }

  const handleLogout = async () => {
    if (confirm('Keluar dari akun Anda?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                CATALOG<span className="text-sky-400">PRO</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-medium">Catalog Builder SaaS</span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>
          {mainNav.map((item: any) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive: linkActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  (linkActive || isActive) 
                    ? "bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20" 
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                  item.highlight && !(linkActive || isActive) && "text-sky-300 bg-sky-900/20 hover:bg-sky-900/40"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", (isActive) ? "text-sky-400" : "text-slate-400")} />
                <span>{item.name}</span>
                {item.badgeCount > 0 && (
                  <span className="ml-auto bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {item.badgeCount} ACC
                  </span>
                )}
                {item.highlight && !item.badgeCount && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Profile Card & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <div className="px-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-xs border border-sky-400 shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SE'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate flex items-center gap-1">
                  <span>{user?.name || 'Seller Pro'}</span>
                  {user?.role === 'admin' && (
                    <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1 rounded font-bold">ADMIN</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'pro@kopisenja.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition shrink-0"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
