import { supabase, isSupabaseConfigured } from './supabaseRepository';

export interface LicenseKey {
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  plan: 'PRO_LIFETIME' | 'PRO_MONTHLY';
  status: 'ACTIVE' | 'UNUSED' | 'REVOKED';
  createdAt: string;
  activatedAt?: string;
}

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface UserPermission {
  email: string;
  name: string;
  isPro: boolean;
  isOwner?: boolean;
  approvalStatus: ApprovalStatus;
  maxCatalogs: number;
  maxProducts: number;
  activatedKey?: string;
  joinedAt: string;
}

const STORAGE_KEYS = {
  LICENSES: 'cbp_admin_licenses_v1',
  USERS: 'cbp_admin_users_v1',
  CURRENT_USER_PRO: 'cbp_user_pro_status_v1',
};

export const OWNER_EMAILS = [
  'alfhaqihalby@gmail.com',
  'albyfhaqih19@gmail.com',
  'albyfhaqih@gmail.com',
  'admin@catalogpro.com',
  'alby@owner.com',
];

export const isOwnerEmail = (email: string): boolean => {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return OWNER_EMAILS.some((owner) => lower.includes(owner) || lower.includes('alby') || lower.includes('alfhaqih'));
};

// Initial Mock Data
const INITIAL_LICENSES: LicenseKey[] = [
  {
    code: 'PRO-2026-HVAC-99K',
    customerName: 'Budi MEP Engineer',
    customerEmail: 'budi.hvac@gmail.com',
    customerPhone: '628123456789',
    plan: 'PRO_LIFETIME',
    status: 'ACTIVE',
    createdAt: '2026-09-20',
    activatedAt: '2026-09-20',
  },
  {
    code: 'PRO-2026-VIP-8812',
    customerName: 'Kopi Senja Cafe',
    customerEmail: 'pro@kopisenja.com',
    customerPhone: '628987654321',
    plan: 'PRO_LIFETIME',
    status: 'ACTIVE',
    createdAt: '2026-09-22',
    activatedAt: '2026-09-22',
  },
];

const INITIAL_USERS: UserPermission[] = [
  {
    email: 'alfhaqihalby@gmail.com',
    name: 'Alby Fhaqih (Owner & Creator)',
    isPro: true,
    isOwner: true,
    approvalStatus: 'APPROVED',
    maxCatalogs: 9999,
    maxProducts: 9999,
    joinedAt: '2026-09-01',
  },
  {
    email: 'pro@kopisenja.com',
    name: 'Kopi Senja Cafe',
    isPro: true,
    approvalStatus: 'APPROVED',
    maxCatalogs: 999,
    maxProducts: 999,
    activatedKey: 'PRO-2026-VIP-8812',
    joinedAt: '2026-09-20',
  },
  {
    email: 'pembeli.baru@gmail.com',
    name: 'Toko Olshop Indonesia',
    isPro: false,
    approvalStatus: 'PENDING',
    maxCatalogs: 1,
    maxProducts: 10,
    joinedAt: '2026-09-23',
  },
];

export const getLicenses = (): LicenseKey[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LICENSES);
    return raw ? JSON.parse(raw) : INITIAL_LICENSES;
  } catch {
    return INITIAL_LICENSES;
  }
};

export const saveLicenses = (licenses: LicenseKey[]) => {
  localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
};

export const getUsers = (): UserPermission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

export const fetchUsersFromSupabase = async (): Promise<UserPermission[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('user_permissions').select('*');
      if (!error && data && data.length > 0) {
        const mapped: UserPermission[] = data.map((row: any) => ({
          email: row.email,
          name: row.name,
          isPro: row.is_pro,
          isOwner: row.is_owner,
          approvalStatus: row.approval_status as ApprovalStatus,
          maxCatalogs: row.max_catalogs || (row.is_pro ? 999 : 1),
          maxProducts: row.max_products || (row.is_pro ? 999 : 10),
          activatedKey: row.activated_key,
          joinedAt: row.joined_at || new Date().toISOString().split('T')[0],
        }));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mapped));
        return mapped;
      }
    } catch {
      // Fallback
    }
  }
  return getUsers();
};

export const saveUsers = async (users: UserPermission[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = users.map((u) => ({
        email: u.email.toLowerCase(),
        name: u.name,
        is_pro: u.isPro,
        is_owner: Boolean(u.isOwner),
        approval_status: u.approvalStatus,
        max_catalogs: u.maxCatalogs,
        max_products: u.maxProducts,
        activated_key: u.activatedKey || null,
        joined_at: u.joinedAt,
      }));
      const { error } = await supabase.from('user_permissions').upsert(dbPayload, { onConflict: 'email' });
      if (error) {
        console.error('Supabase user_permissions upsert error:', error.message, error.details);
      }
    } catch (e) {
      console.warn('Supabase saveUsers exception:', e);
    }
  }
};

export const getUserPermission = (email: string): UserPermission => {
  if (isOwnerEmail(email)) {
    return {
      email,
      name: 'Alby Fhaqih (Owner & Creator)',
      isPro: true,
      isOwner: true,
      approvalStatus: 'APPROVED',
      maxCatalogs: 9999,
      maxProducts: 9999,
      joinedAt: '2026-09-01',
    };
  }

  const users = getUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (found) return found;

  const newUser: UserPermission = {
    email: email.toLowerCase(),
    name: email.split('@')[0].toUpperCase() + ' Store',
    isPro: false,
    approvalStatus: 'PENDING',
    maxCatalogs: 1,
    maxProducts: 10,
    joinedAt: new Date().toISOString().split('T')[0],
  };

  saveUsers([newUser, ...users]).catch(() => {});
  return newUser;
};

export const registerPendingUser = async (email: string, name?: string): Promise<UserPermission> => {
  if (isOwnerEmail(email)) {
    return {
      email,
      name: 'Alby Fhaqih (Owner & Creator)',
      isPro: true,
      isOwner: true,
      approvalStatus: 'APPROVED',
      maxCatalogs: 9999,
      maxProducts: 9999,
      joinedAt: '2026-09-01',
    };
  }

  const users = getUsers();
  const cleanEmail = email.toLowerCase().trim();
  const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  let userToSave: UserPermission;
  if (index >= 0) {
    userToSave = {
      ...users[index],
      name: name || users[index].name,
    };
    users[index] = userToSave;
  } else {
    userToSave = {
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0].toUpperCase() + ' Store',
      isPro: false,
      approvalStatus: 'PENDING',
      maxCatalogs: 1,
      maxProducts: 10,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    users.unshift(userToSave);
  }

  await saveUsers(users);
  return userToSave;
};

export const approveUser = async (email: string, isPro: boolean = true) => {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();
  const updated = users.map((u) => {
    if (u.email.toLowerCase() === cleanEmail) {
      return {
        ...u,
        approvalStatus: 'APPROVED' as ApprovalStatus,
        isPro,
        maxCatalogs: isPro ? 999 : 1,
        maxProducts: isPro ? 999 : 10,
      };
    }
    return u;
  });
  await saveUsers(updated);
};

export const rejectUser = async (email: string) => {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();
  const updated = users.map((u) => {
    if (u.email.toLowerCase() === cleanEmail) {
      return {
        ...u,
        approvalStatus: 'REJECTED' as ApprovalStatus,
        isPro: false,
      };
    }
    return u;
  });
  await saveUsers(updated);
};

export const generateLicenseKey = (
  customerName: string,
  customerEmail: string,
  customerPhone?: string,
  plan: 'PRO_LIFETIME' | 'PRO_MONTHLY' = 'PRO_LIFETIME'
): LicenseKey => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `PRO-2026-${randomSuffix}`;
  const newKey: LicenseKey = {
    code,
    customerName,
    customerEmail,
    customerPhone,
    plan,
    status: 'UNUSED',
    createdAt: new Date().toISOString().split('T')[0],
  };

  const current = getLicenses();
  saveLicenses([newKey, ...current]);

  // Auto approve and upgrade user permissions
  approveUser(customerEmail, true);

  return newKey;
};

export const toggleUserProStatus = (email: string, isPro: boolean) => {
  if (isPro) {
    approveUser(email, true);
  } else {
    const users = getUsers();
    const updated = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return {
          ...u,
          isPro: false,
          approvalStatus: 'PENDING' as ApprovalStatus,
        };
      }
      return u;
    });
    saveUsers(updated);
  }
};

export const redeemLicenseCode = (code: string, userEmail: string): { success: boolean; message: string } => {
  const licenses = getLicenses();
  const keyObj = licenses.find((k) => k.code.trim().toUpperCase() === code.trim().toUpperCase());

  if (!keyObj) {
    return { success: false, message: 'Kode lisensi tidak valid atau tidak ditemukan!' };
  }

  if (keyObj.status === 'REVOKED') {
    return { success: false, message: 'Kode lisensi telah dicabut/nonaktif.' };
  }

  keyObj.status = 'ACTIVE';
  keyObj.activatedAt = new Date().toISOString().split('T')[0];
  saveLicenses(licenses);

  approveUser(userEmail, true);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_PRO, 'true');

  return { success: true, message: 'Selamat! Lisensi PRO Anda berhasil diaktifkan 100%.' };
};
