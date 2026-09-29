import { Catalog, Product } from '../types/catalog';
import { ParseResult } from '../types/editor';
import { sanitizeHtml } from './sanitizer';

export function parseCatalogHtml(rawHtml: string, catalog: Catalog): ParseResult {
  const sanitizedHtml = sanitizeHtml(rawHtml);
  if (!sanitizedHtml) {
    return {
      isFullyLinked: false,
      linkedCount: 0,
      totalElementsCount: 0,
      missingMarkers: [],
      sanitizedHtml: '',
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHtml, 'text/html');

  const markedElements = doc.querySelectorAll('[data-cb-type], [data-cb-field]');
  const totalElementsCount = markedElements.length;

  const productIds = new Set(catalog.products.map(p => p.id));
  const missingMarkers: string[] = [];
  let linkedCount = 0;

  markedElements.forEach(el => {
    const cbId = el.getAttribute('data-cb-id');
    const cbField = el.getAttribute('data-cb-field');

    if (cbId && productIds.has(cbId)) {
      linkedCount++;
    } else if (cbField && (cbField.startsWith('business-') || cbField === 'logo' || cbField === 'name')) {
      linkedCount++;
    } else {
      if (cbId) missingMarkers.push(`ID produk '${cbId}' tidak ditemukan di katalog`);
    }
  });

  const isFullyLinked = totalElementsCount > 0 && linkedCount >= Math.min(totalElementsCount, catalog.products.length);

  return {
    isFullyLinked,
    linkedCount,
    totalElementsCount,
    missingMarkers,
    sanitizedHtml,
  };
}

export function syncCatalogDataToHtml(html: string, catalog: Catalog): string {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Sync Business Information
  const bizLogo = doc.querySelectorAll('[data-cb-field="business-logo"], [data-cb-field="logo"]');
  bizLogo.forEach(el => {
    if (el.tagName.toLowerCase() === 'img' && catalog.business.logo) {
      el.setAttribute('src', catalog.business.logo);
    }
  });

  const bizName = doc.querySelectorAll('[data-cb-field="business-name"]');
  bizName.forEach(el => {
    el.textContent = catalog.business.name;
  });

  const bizDesc = doc.querySelectorAll('[data-cb-field="business-description"]');
  bizDesc.forEach(el => {
    el.textContent = catalog.business.description;
  });

  // Sync Products
  catalog.products.forEach(product => {
    const pId = product.id;

    // Name
    const nameEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="name"]`);
    nameEls.forEach(el => { el.textContent = product.name; });

    // Price
    const priceEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="price"]`);
    priceEls.forEach(el => {
      el.textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
    });

    // Discount Price
    const discEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="discountPrice"]`);
    discEls.forEach(el => {
      if (product.discountPrice) {
        el.textContent = `Rp ${product.discountPrice.toLocaleString('id-ID')}`;
        (el as HTMLElement).style.display = '';
      } else {
        (el as HTMLElement).style.display = 'none';
      }
    });

    // Description
    const descEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="description"]`);
    descEls.forEach(el => { el.textContent = product.description; });

    // Image
    const imgEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="image"]`);
    imgEls.forEach(el => {
      if (el.tagName.toLowerCase() === 'img' && product.images[0]) {
        el.setAttribute('src', product.images[0]);
      }
    });

    // Badge
    const badgeEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="badge"]`);
    badgeEls.forEach(el => {
      if (product.badge) {
        el.textContent = product.badge;
        (el as HTMLElement).style.display = '';
      } else {
        (el as HTMLElement).style.display = 'none';
      }
    });

    // CTA
    const ctaEls = doc.querySelectorAll(`[data-cb-id="${pId}"][data-cb-field="cta"]`);
    ctaEls.forEach(el => {
      if (product.ctaText) el.textContent = product.ctaText;
      if (product.ctaUrl) el.setAttribute('href', product.ctaUrl);
    });
  });

  return doc.body.innerHTML;
}
