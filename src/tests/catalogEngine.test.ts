// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../lib/sanitizer';
import { parseCatalogHtml, syncCatalogDataToHtml } from '../lib/parser';
import { generateAiPrompt } from '../lib/promptGenerator';
import { INITIAL_DEMO_CATALOG, LocalCatalogRepository } from '../services/localRepository';

describe('Catalog Builder Pro Core Engine Tests', () => {
  it('should sanitize untrusted HTML and strip script tags while preserving data-cb-* markers', () => {
    const maliciousHtml = `
      <div data-cb-type="product-card" data-cb-id="prod-1">
        <h3 data-cb-field="name" data-cb-id="prod-1">Kopi Susu</h3>
        <script>alert("xss")</script>
        <a href="javascript:alert(1)">Click Me</a>
      </div>
    `;

    const cleaned = sanitizeHtml(maliciousHtml);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('javascript:alert');
    expect(cleaned).toContain('data-cb-type="product-card"');
    expect(cleaned).toContain('data-cb-field="name"');
  });

  it('should correctly parse catalog markers and identify linked elements', () => {
    const sampleHtml = `
      <div data-cb-type="product-card" data-cb-id="prod-es-kopi-susu">
        <h3 data-cb-field="name" data-cb-id="prod-es-kopi-susu">Es Kopi Susu Senja</h3>
        <span data-cb-field="price" data-cb-id="prod-es-kopi-susu">Rp 22.000</span>
      </div>
    `;

    const result = parseCatalogHtml(sampleHtml, INITIAL_DEMO_CATALOG);

    expect(result.linkedCount).toBeGreaterThan(0);
    expect(result.sanitizedHtml).toContain('data-cb-id="prod-es-kopi-susu"');
  });

  it('should generate structured AI system prompt with marker instructions', () => {
    const prompt = generateAiPrompt(INITIAL_DEMO_CATALOG);

    expect(prompt).toContain('Kopi Senja');
    expect(prompt).toContain('data-cb-type');
    expect(prompt).toContain('data-cb-id');
    expect(prompt).toContain('data-cb-field');
    expect(prompt).toContain('TIDAK BOLEH menggunakan JavaScript');
  });

  it('should generate unique slugs without collisions for new brands', async () => {
    const repo = new LocalCatalogRepository();
    const slug1 = await repo.generateUniqueSlug('Toko Baru Nusantara');
    expect(slug1).toBe('toko-baru-nusantara');
  });

  it('should synchronize updated product price into parsed DOM', () => {
    const sampleHtml = `
      <div data-cb-type="product-card" data-cb-id="prod-es-kopi-susu">
        <span data-cb-field="price" data-cb-id="prod-es-kopi-susu">Rp 22.000</span>
      </div>
    `;

    const updatedCatalog = {
      ...INITIAL_DEMO_CATALOG,
      products: INITIAL_DEMO_CATALOG.products.map(p => 
        p.id === 'prod-es-kopi-susu' ? { ...p, price: 25000 } : p
      ),
    };

    const synced = syncCatalogDataToHtml(sampleHtml, updatedCatalog);

    expect(synced).toContain('Rp 25.000');
  });
});
