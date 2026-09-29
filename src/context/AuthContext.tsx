import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabaseRepository';
import { userService, UserProfile, UserRole, UserStatus } from '../services/userService';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  storeName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
}

export interface LoginResult {
  success: boolean;
  reason?: 'pending' | 'rejected' | 'invalid_credentials' | 'not_found' | 'unknown';
  message?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<LoginResult>;
  register: (name: string, email: string, password?: string, storeName?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'cbp_auth_session_v3';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({} as UserProfile),
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const profile = await userService.getUserByEmail(data.session.user.email || '');
          if (profile && profile.status === 'approved') {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              storeName: profile.storeName,
              avatar: profile.avatar,
              role: profile.role,
              status: profile.status,
            });
            setIsLoading(false);
            return;
          }
        }
      }

      // Local storage session check
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: UserSession = JSON.parse(stored);
        const latestProfile = await userService.getUserByEmail(parsed.email);
        if (latestProfile && latestProfile.status === 'approved') {
          setUser({
            ...parsed,
            role: latestProfile.role,
            status: latestProfile.status,
          });
        } else {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    const latest = await userService.getUserByEmail(user.email);
    if (latest) {
      if (latest.status !== 'approved') {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        const updatedSession: UserSession = {
          ...user,
          name: latest.name,
          storeName: latest.storeName,
          role: latest.role,
          status: latest.status,
        };
        setUser(updatedSession);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
      }
    }
  };

  const login = async (email: string, password?: string): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase && password) {
      try {
        await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      } catch (e) {
        console.warn('Supabase login notice:', e);
      }
    }

    const profile = await userService.getUserByEmail(cleanEmail);

    if (!profile) {
      return {
        success: false,
        reason: 'not_found',
        message: 'Email belum terdaftar. Silakan lakukan Pendaftaran Akun Baru terlebih dahulu.',
      };
    }

    if (profile.status === 'pending') {
      return {
        success: false,
        reason: 'pending',
        message: 'Akun Anda sedang menunggu persetujuan (ACC) dari Admin. Silakan hubungi Admin atau tunggu persetujuan.',
      };
    }

    if (profile.status === 'rejected') {
      return {
        success: false,
        reason: 'rejected',
        message: 'Pendaftaran akun Anda ditolak oleh Admin.',
      };
    }

    const session: UserSession = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      storeName: profile.storeName,
      avatar: profile.avatar,
      role: profile.role,
      status: profile.status,
    };

    setUser(session);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    return { success: true };
  };

  const register = async (name: string, email: string, password?: string, storeName?: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    let supabaseUserId: string | undefined;

    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name, storeName }
          }
        });
        if (!error && data?.user) {
          supabaseUserId = data.user.id;
        } else if (error) {
          console.warn('Supabase Auth signUp notice:', error.message);
        }
      } catch (e) {
        console.warn('Supabase auth signup notice:', e);
      }
    }

    const profile = await userService.registerUser(name, cleanEmail, storeName, supabaseUserId);
    return profile;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && user.status === 'approved'),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
