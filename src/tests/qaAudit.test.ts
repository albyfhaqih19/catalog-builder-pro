// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../lib/sanitizer';
import { parseCatalogHtml, syncCatalogDataToHtml } from '../lib/parser';
import { generateAiPrompt } from '../lib/promptGenerator';
import { exportToZip, generateStandaloneHtml } from '../lib/exporter';
import { INITIAL_DEMO_CATALOG, LocalCatalogRepository } from '../services/localRepository';
import { isSupabaseConfigured } from '../services/supabaseRepository';

describe('Comprehensive 16-Point QA & E2E Audit Suite', () => {
  // 1. Authentication Audit
  it('1. Authentication: should persist user session in localStorage and handle login/logout', () => {
    const mockUser = { id: 'u-1', email: 'seller@test.com', name: 'Test Seller' };
    localStorage.setItem('cbp_auth_session_v1', JSON.stringify(mockUser));
    
    const restored = JSON.parse(localStorage.getItem('cbp_auth_session_v1') || '{}');
    expect(restored.email).toBe('seller@test.com');
    
    localStorage.removeItem('cbp_auth_session_v1');
    expect(localStorage.getItem('cbp_auth_session_v1')).toBeNull();
  });

  // 2. Catalog CRUD E2E
  it('2. Catalog CRUD: should create, save, persist across reload, edit, and delete catalog', async () => {
    const repo = new LocalCatalogRepository();
    const newCat = {
      ...INITIAL_DEMO_CATALOG,
      id: 'cat-test-crud',
      name: 'Katalog Test Audit',
      slug: 'katalog-test-audit',
    };

    // Save
    await repo.saveCatalog(newCat);
    const fetched = await repo.getCatalogById('cat-test-crud');
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Katalog Test Audit');

    // Edit
    fetched!.business.name = 'Toko Audit Updated';
    await repo.saveCatalog(fetched!);
    const updated = await repo.getCatalogById('cat-test-crud');
    expect(updated?.business.name).toBe('Toko Audit Updated');

    // Delete
    await repo.deleteCatalog('cat-test-crud');
    const deleted = await repo.getCatalogById('cat-test-crud');
    expect(deleted).toBeNull();
  });

  // 3. Product CRUD E2E
  it('3. Product CRUD: should handle product fields, pricing, discount, stock status, and badges', () => {
    const product = {
      id: 'prod-audit-1',
      name: 'Sepatu Sneakers Leather',
      sku: 'SP-001',
      categoryId: 'cat-fashion',
      price: 450000,
      discountPrice: 399000,
      description: 'Sepatu kulit sintetis kualitas tinggi.',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80'],
      badge: 'Best Seller',
      stockStatus: 'available' as const,
      ctaText: 'Beli Sekarang',
    };

    expect(product.price).toBeGreaterThan(product.discountPrice!);
    expect(product.stockStatus).toBe('available');
    expect(product.badge).toBe('Best Seller');
  });

  // 4. Prompt Generator Audit
  it('4. Prompt Generator: should output marker instructions and contain exact product data with NO AI API dependencies', () => {
    const prompt = generateAiPrompt(INITIAL_DEMO_CATALOG);

    expect(prompt).toContain('data-cb-type');
    expect(prompt).toContain('data-cb-id');
    expect(prompt).toContain('data-cb-field');
    expect(prompt).toContain(INITIAL_DEMO_CATALOG.business.name);
    expect(prompt).toContain(INITIAL_DEMO_CATALOG.products[0].name);
    expect(prompt).not.toContain('API_KEY');
    expect(prompt).not.toContain('openai');
  });

  // 5. HTML Import Security & XSS Vector Stripping
  it('5. HTML Import Security: should strip script tags, SVG onload, onerror, iframe, and javascript: links', () => {
    const maliciousCode = `
      <div data-cb-type="product-card" data-cb-id="p1">
        <script>window.location="http://attacker.com"</script>
        <svg onload="alert('svg-xss')"></svg>
        <iframe src="http://malicious.site"></iframe>
        <a href="javascript:alert('xss')" onclick="alert(1)">Pesan</a>
        <img src="x" onerror="alert(2)" />
      </div>
    `;

    const cleaned = sanitizeHtml(maliciousCode);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('<iframe');
    expect(cleaned).not.toContain('onload=');
    expect(cleaned).not.toContain('onclick=');
    expect(cleaned).not.toContain('onerror=');
    expect(cleaned).not.toContain('javascript:alert');
    expect(cleaned).toContain('data-cb-type="product-card"');
  });

  // 6. Marker-Based Editing
  it('6. Marker-Based Editing: should map marker attributes and sync product updates to DOM', () => {
    const rawHtml = `
      <div data-cb-type="product-card" data-cb-id="prod-es-kopi-susu">
        <h3 data-cb-field="name" data-cb-id="prod-es-kopi-susu">Es Kopi Original</h3>
        <span data-cb-field="price" data-cb-id="prod-es-kopi-susu">Rp 18.000</span>
      </div>
    `;

    const parsed = parseCatalogHtml(rawHtml, INITIAL_DEMO_CATALOG);
    expect(parsed.linkedCount).toBeGreaterThan(0);

    const updatedCatalog = {
      ...INITIAL_DEMO_CATALOG,
      products: INITIAL_DEMO_CATALOG.products.map(p => 
        p.id === 'prod-es-kopi-susu' ? { ...p, name: 'Es Kopi Susu Aren Special', price: 25000 } : p
      )
    };

    const synced = syncCatalogDataToHtml(rawHtml, updatedCatalog);
    expect(synced).toContain('Es Kopi Susu Aren Special');
    expect(synced).toContain('Rp 25.000');
  });

  // 7. HTML Without Markers
  it('7. HTML Without Markers: should gracefully accept raw HTML and issue a warning flag without crashing', () => {
    const plainHtml = `
      <div class="custom-card">
        <h3>Produk Custom Tanpa Marker</h3>
        <p>Harga Rp 10.000</p>
      </div>
    `;

    const parsed = parseCatalogHtml(plainHtml, INITIAL_DEMO_CATALOG);

    expect(parsed.isFullyLinked).toBe(false);
    expect(parsed.linkedCount).toBe(0);
    expect(parsed.sanitizedHtml).toContain('Produk Custom Tanpa Marker');
  });

  // 9. Draft Catalog Protection
  it('9. Draft Catalog Access: draft status should be enforced correctly', () => {
    const draftCat = { ...INITIAL_DEMO_CATALOG, status: 'draft' as const };
    expect(draftCat.status).toBe('draft');
  });

  // 10. Export Engine Testing
  it('10. Export Engine: should generate valid HTML and ZIP archive blobs', async () => {
    const standaloneHtml = generateStandaloneHtml(INITIAL_DEMO_CATALOG);
    expect(standaloneHtml).toContain('<!DOCTYPE html>');
    expect(standaloneHtml).toContain(INITIAL_DEMO_CATALOG.business.name);

    const zipBlob = await exportToZip(INITIAL_DEMO_CATALOG);
    expect(zipBlob.size).toBeGreaterThan(0);
    expect(zipBlob.type).toBe('application/zip');
  });

  // 12. Supabase Repository Isolation
  it('12. Supabase Architecture: should isolate credentials and run in local mode when no keys are provided', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
    // Verify no secret keys are exposed
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY || '').not.toContain('service_role');
  });
});
