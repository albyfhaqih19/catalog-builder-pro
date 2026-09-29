// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { userService } from '../services/userService';

describe('Auth & Admin Approval (ACC) Workflow Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. First registered user should become Owner / Admin (Approved)', async () => {
    const owner = await userService.registerUser('Owner Utama', 'owner@realbrand.com', 'Toko Utama');
    expect(owner.email).toBe('owner@realbrand.com');
    expect(owner.role).toBe('admin');
    expect(owner.status).toBe('approved');
  });

  it('2. Subsequent registered users should become Sellers with status "pending"', async () => {
    // First user = admin
    await userService.registerUser('Owner Utama', 'owner@realbrand.com', 'Toko Utama');

    // Second user = seller pending
    const seller = await userService.registerUser('Mitra Reseller', 'mitra@reseller.com', 'Toko Mitra');
    expect(seller.email).toBe('mitra@reseller.com');
    expect(seller.role).toBe('seller');
    expect(seller.status).toBe('pending');
  });

  it('3. Owner (Admin) should be able to approve (ACC) pending users', async () => {
    await userService.registerUser('Owner Utama', 'owner@realbrand.com', 'Toko Utama');
    const seller = await userService.registerUser('Budi Dropship', 'budi@dropship.com', 'Budi Store');
    expect(seller.status).toBe('pending');

    // Admin approves account
    const updated = await userService.updateUserStatus(seller.id, 'approved');
    expect(updated).toBe(true);

    const fetched = await userService.getUserByEmail('budi@dropship.com');
    expect(fetched?.status).toBe('approved');
  });

  it('4. Owner (Admin) should be able to reject pending users', async () => {
    await userService.registerUser('Owner Utama', 'owner@realbrand.com', 'Toko Utama');
    const seller = await userService.registerUser('Spammer User', 'spam@fake.com', 'Spam Store');
    expect(seller.status).toBe('pending');

    // Admin rejects account
    await userService.updateUserStatus(seller.id, 'rejected');

    const fetched = await userService.getUserByEmail('spam@fake.com');
    expect(fetched?.status).toBe('rejected');
  });
});
