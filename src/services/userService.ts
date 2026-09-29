import { isSupabaseConfigured, supabase } from './supabaseRepository';
import { isOwnerEmail, registerPendingUser } from './licenseService';

export type UserRole = 'admin' | 'seller';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  storeName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'cbp_users_list_v3';

function generateValidUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class UserService {
  private getStoredUsers(): UserProfile[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveStoredUsers(users: UserProfile[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const [profilesRes, permsRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('user_permissions').select('*')
        ]);

        const approvedEmails = new Set<string>();
        if (permsRes.data && Array.isArray(permsRes.data)) {
          permsRes.data.forEach((p: any) => {
            if (p.approval_status === 'APPROVED' || p.is_pro || p.is_owner) {
              approvedEmails.add(p.email.toLowerCase());
            }
          });
        }
        if (profilesRes.data && Array.isArray(profilesRes.data)) {
          profilesRes.data.forEach((d: any) => {
            if (d.status === 'approved' || d.plan === 'PRO' || d.role === 'admin') {
              approvedEmails.add(d.email.toLowerCase());
            }
          });
        }

        const remoteUsers: UserProfile[] = (profilesRes.data || []).map((d: any) => {
          const clean = (d.email || '').toLowerCase();
          const isOwner = isOwnerEmail(clean);
          const isApproved = isOwner || approvedEmails.has(clean);
          return {
            id: d.id,
            email: clean,
            name: d.full_name || d.name || clean.split('@')[0],
            storeName: d.store_name,
            avatar: d.avatar_url,
            role: (d.role || (isOwner ? 'admin' : 'seller')) as UserRole,
            status: (isApproved ? 'approved' : 'pending') as UserStatus,
            createdAt: d.created_at || new Date().toISOString(),
          };
        });

        // Also add users from user_permissions that might not be in profiles
        if (permsRes.data && Array.isArray(permsRes.data)) {
          permsRes.data.forEach((p: any) => {
            const clean = (p.email || '').toLowerCase();
            if (clean && !remoteUsers.some(u => u.email.toLowerCase() === clean)) {
              const isOwner = isOwnerEmail(clean);
              const isApproved = isOwner || p.approval_status === 'APPROVED' || approvedEmails.has(clean);
              remoteUsers.push({
                id: 'usr-' + clean,
                email: clean,
                name: p.name || clean.split('@')[0],
                storeName: p.name,
                role: (isOwner ? 'admin' : 'seller') as UserRole,
                status: (isApproved ? 'approved' : 'pending') as UserStatus,
                createdAt: p.joined_at || new Date().toISOString(),
              });
            }
          });
        }

        const localUsers = this.getStoredUsers();
        let localChanged = false;
        const merged = [...remoteUsers];

        for (const localUser of localUsers) {
          const cleanLocal = localUser.email.toLowerCase();
          const existingIdx = merged.findIndex(u => u.email.toLowerCase() === cleanLocal);
          
          if (approvedEmails.has(cleanLocal)) {
            if (localUser.status !== 'approved') {
              localUser.status = 'approved';
              localChanged = true;
            }
          }

          if (existingIdx < 0) {
            merged.push(localUser);
          } else if (approvedEmails.has(cleanLocal)) {
            merged[existingIdx].status = 'approved';
          }
        }

        if (localChanged) {
          this.saveStoredUsers(localUsers);
        }

        return merged;
      } catch (err) {
        console.warn('Supabase fetch profiles warning, falling back to local repository:', err);
      }
    }
    return this.getStoredUsers();
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async registerUser(name: string, email: string, storeName?: string, customId?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await this.getUserByEmail(cleanEmail);
    if (existing) {
      return existing;
    }

    const isOwner = isOwnerEmail(cleanEmail) ||
                    cleanEmail.startsWith('owner@') ||
                    cleanEmail.startsWith('admin@');

    let isAdmin = false;
    if (isOwner) {
      isAdmin = true;
    } else if (!isSupabaseConfigured) {
      const stored = this.getStoredUsers();
      if (stored.length === 0) {
        isAdmin = true;
      }
    }

    const role: UserRole = isAdmin ? 'admin' : 'seller';
    const status: UserStatus = isAdmin ? 'approved' : 'pending';

    const newUser: UserProfile = {
      id: customId || generateValidUUID(),
      email: cleanEmail,
      name,
      storeName: storeName || name,
      role,
      status,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          full_name: newUser.name,
          store_name: newUser.storeName,
          role: newUser.role,
          status: newUser.status,
          plan: isOwner ? 'PRO' : 'FREE',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        if (error) {
          console.error('Supabase profile upsert error:', error.message, error.details);
        } else {
          console.log('Supabase profile synced successfully for:', newUser.email);
        }
      } catch (err) {
        console.warn('Supabase profile upsert exception:', err);
      }
    }

    const users = this.getStoredUsers();
    users.unshift(newUser);
    this.saveStoredUsers(users);

    // Sync to licenseService so AdminPage sees this pending user in Supabase
    try {
      await registerPendingUser(cleanEmail, name);
    } catch (err) {
      console.warn('Sync to licenseService failed:', err);
    }

    return newUser;
  }

  async updateUserStatus(idOrEmail: string, newStatus: UserStatus): Promise<boolean> {
    const targetEmail = idOrEmail.includes('@') ? idOrEmail.toLowerCase() : '';

    if (isSupabaseConfigured && supabase) {
      try {
        if (targetEmail) {
          await supabase.from('profiles').update({ status: newStatus, plan: newStatus === 'approved' ? 'PRO' : 'FREE' }).eq('email', targetEmail);
        } else {
          await supabase.from('profiles').update({ status: newStatus, plan: newStatus === 'approved' ? 'PRO' : 'FREE' }).eq('id', idOrEmail);
        }
      } catch (err) {
        console.warn('Supabase update profile status exception:', err);
      }
    }

    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === idOrEmail || (targetEmail && u.email.toLowerCase() === targetEmail));
    if (index >= 0) {
      users[index].status = newStatus;
      this.saveStoredUsers(users);
      return true;
    }
    return false;
  }
}

export const userService = new UserService();
