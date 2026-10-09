import { Catalog, Product, Category } from '../types/catalog';
import { MediaItem } from '../types/media';
import { ICatalogRepository, IProductRepository, IMediaRepository } from './repository';

const CATALOGS_STORAGE_KEY = 'cbp_catalogs_v1';
const MEDIA_STORAGE_KEY = 'cbp_media_v1';

export const INITIAL_DEMO_CATALOG: Catalog = {
  id: 'cat-kopi-senja',
  name: 'Menu Spesial Kopi Senja',
  slug: 'kopi-senja',
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  views: 142,
  business: {
    name: 'Kopi Senja',
    category: 'Cafe & Bakery',
    description: 'Menyajikan racikan kopi biji pilihan Nusantara dan pastry segar setiap hari.',
    logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80',
    phone: '081234567890',
    whatsapp: '6281234567890',
    email: 'order@kopisenja.com',
    website: 'https://kopisenja.com',
    instagram: '@kopisenja.id',
    facebook: 'KopiSenjaOfficial',
    tiktok: '@kopisenja.official',
    address: 'Jl. Senopati No. 45, Jakarta Selatan',
    openingHours: 'Senin - Minggu: 07.00 - 22.00 WIB',
    mapsUrl: 'https://maps.google.com',
    ctaText: 'Pesan via WhatsApp',
  },
  theme: {
    themeId: 'cafe',
    themeName: 'Cafe Warm',
    primaryColor: '#78350f',
    secondaryColor: '#fef3c7',
    backgroundColor: '#fffbe6',
    textColor: '#1c1917',
    buttonColor: '#92400e',
    fontFamily: 'Plus Jakarta Sans',
    cardStyle: 'shadow',
    headerStyle: 'hero',
  },
  categories: [
    { id: 'cat-espresso', name: 'Espresso Based', displayOrder: 1 },
    { id: 'cat-non-kopi', name: 'Non-Kopi', displayOrder: 2 },
    { id: 'cat-pastry', name: 'Pastry & Snacks', displayOrder: 3 },
  ],
  products: [
    {
      id: 'prod-es-kopi-susu',
      name: 'Es Kopi Susu Senja',
      sku: 'KS-001',
      categoryId: 'cat-espresso',
      price: 22000,
      discountPrice: 18000,
      description: 'Espresso ganda disadarkan dengan gula aren alami dan susu segar creamy.',
      shortDescription: 'Best Seller Kopi Susu Aren',
      images: ['https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80'],
      badge: 'Best Seller',
      stockStatus: 'available',
      ctaText: 'Pesan Sekarang',
    },
    {
      id: 'prod-americano',
      name: 'Americano Ice/Hot',
      sku: 'KS-002',
      categoryId: 'cat-espresso',
      price: 20000,
      description: 'Double shot espresso biji Arabika Aceh Gayo dengan rasa buah yang segar.',
      shortDescription: 'Kopi Hitam Segar',
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'],
      badge: 'Recommended',
      stockStatus: 'available',
      ctaText: 'Pesan Sekarang',
    },
    {
      id: 'prod-cappuccino',
      name: 'Cappuccino Latte Art',
      sku: 'KS-003',
      categoryId: 'cat-espresso',
      price: 26000,
      discountPrice: 24000,
      description: 'Perpaduan seimbang espresso, steamed milk, dan foam lembut di atasnya.',
      shortDescription: 'Klasik Cappuccino Soft Foam',
      images: ['https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&q=80'],
      stockStatus: 'available',
      ctaText: 'Pesan Sekarang',
    },
    {
      id: 'prod-matcha-latte',
      name: 'Matcha Latte Uji Premium',
      sku: 'KS-004',
      categoryId: 'cat-non-kopi',
      price: 28000,
      discountPrice: 25000,
      description: 'Bubuk Matcha Uji Kyoto pilihan yang diseduh dengan susu segar kaya rasa.',
      shortDescription: 'Matcha Asli Kyoto',
      images: ['https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80'],
      badge: 'New',
      stockStatus: 'available',
      ctaText: 'Pesan Sekarang',
    },
    {
      id: 'prod-croissant',
      name: 'Butter Croissant Warm',
      sku: 'KS-005',
      categoryId: 'cat-pastry',
      price: 24000,
      description: 'Croissant renyah berkulit emas dengan mentega Prancis yang lumer di mulut.',
      shortDescription: 'French Butter Croissant',
      images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'],
      badge: 'Best Seller',
      stockStatus: 'available',
      ctaText: 'Pesan Pastry',
    }
  ],
  htmlContent: '',
  sanitizedHtml: '',
};

export class LocalCatalogRepository implements ICatalogRepository {
  private getStoredCatalogs(): Catalog[] {
    try {
      if (typeof localStorage === 'undefined') return [INITIAL_DEMO_CATALOG];
      const data = localStorage.getItem(CATALOGS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify([INITIAL_DEMO_CATALOG]));
        return [INITIAL_DEMO_CATALOG];
      }
      return JSON.parse(data);
    } catch {
      return [INITIAL_DEMO_CATALOG];
    }
  }

  private saveStoredCatalogs(catalogs: Catalog[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(catalogs));
    }
  }

  async getAllCatalogs(userEmail?: string): Promise<Catalog[]> {
    const list = this.getStoredCatalogs();
    if (!userEmail) return list;
    return list.filter(c => !c.userEmail || c.userEmail === userEmail);
  }

  async getCatalogById(id: string): Promise<Catalog | null> {
    const catalogs = this.getStoredCatalogs();
    return catalogs.find(c => c.id === id) || null;
  }

  async getCatalogBySlug(slug: string): Promise<Catalog | null> {
    const catalogs = this.getStoredCatalogs();
    return catalogs.find(c => c.slug === slug) || null;
  }

  async saveCatalog(catalog: Catalog): Promise<Catalog> {
    const catalogs = this.getStoredCatalogs();
    const index = catalogs.findIndex(c => c.id === catalog.id);
    const updated = { ...catalog, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      catalogs[index] = updated;
    } else {
      catalogs.unshift(updated);
    }
    this.saveStoredCatalogs(catalogs);
    return updated;
  }

  async deleteCatalog(id: string): Promise<boolean> {
    const catalogs = this.getStoredCatalogs();
    const filtered = catalogs.filter(c => c.id !== id);
    this.saveStoredCatalogs(filtered);
    return true;
  }

  async generateUniqueSlug(baseName: string, currentId?: string): Promise<string> {
    let slug = baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    if (!slug) slug = 'catalog-' + Date.now().toString(36);

    const catalogs = this.getStoredCatalogs();
    let uniqueSlug = slug;
    let counter = 1;

    while (catalogs.some(c => c.slug === uniqueSlug && c.id !== currentId)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async publishCatalog(id: string, slug: string): Promise<Catalog> {
    const catalog = await this.getCatalogById(id);
    if (!catalog) throw new Error('Katalog tidak ditemukan');
    catalog.status = 'published';
    catalog.slug = slug;
    catalog.updatedAt = new Date().toISOString();
    return this.saveCatalog(catalog);
  }

  async incrementViews(slug: string): Promise<number> {
    const catalog = await this.getCatalogBySlug(slug);
    if (!catalog) return 0;
    catalog.views = (catalog.views || 0) + 1;
    await this.saveCatalog(catalog);
    return catalog.views;
  }
}

export class LocalProductRepository implements IProductRepository {
  private catalogRepo = new LocalCatalogRepository();

  async getProductsByCatalogId(catalogId: string): Promise<Product[]> {
    const catalog = await this.catalogRepo.getCatalogById(catalogId);
    return catalog ? catalog.products : [];
  }

  async saveProduct(catalogId: string, product: Product): Promise<Product> {
    const catalog = await this.catalogRepo.getCatalogById(catalogId);
    if (!catalog) throw new Error('Katalog tidak ditemukan');

    const index = catalog.products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      catalog.products[index] = product;
    } else {
      catalog.products.push(product);
    }
    await this.catalogRepo.saveCatalog(catalog);
    return product;
  }

  async deleteProduct(catalogId: string, productId: string): Promise<boolean> {
    const catalog = await this.catalogRepo.getCatalogById(catalogId);
    if (!catalog) return false;
    catalog.products = catalog.products.filter(p => p.id !== productId);
    await this.catalogRepo.saveCatalog(catalog);
    return true;
  }

  async reorderProducts(catalogId: string, productIds: string[]): Promise<Product[]> {
    const catalog = await this.catalogRepo.getCatalogById(catalogId);
    if (!catalog) return [];
    const productMap = new Map(catalog.products.map(p => [p.id, p]));
    const reordered: Product[] = [];
    productIds.forEach(id => {
      const p = productMap.get(id);
      if (p) reordered.push(p);
    });
    catalog.products.forEach(p => {
      if (!productIds.includes(p.id)) reordered.push(p);
    });
    catalog.products = reordered;
    await this.catalogRepo.saveCatalog(catalog);
    return reordered;
  }
}

export class LocalMediaRepository implements IMediaRepository {
  private getStoredMedia(): MediaItem[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (!data) {
        const defaultMedia: MediaItem[] = [
          {
            id: 'med-1',
            name: 'kopi-senja-logo.jpg',
            url: INITIAL_DEMO_CATALOG.business.logo,
            size: 48500,
            dimensions: '300x300',
            type: 'image/jpeg',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'med-2',
            name: 'es-kopi-susu.jpg',
            url: INITIAL_DEMO_CATALOG.products[0].images[0],
            size: 124000,
            dimensions: '600x600',
            type: 'image/jpeg',
            createdAt: new Date().toISOString(),
          }
        ];
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(defaultMedia));
        return defaultMedia;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveStoredMedia(items: MediaItem[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
    }
  }

  async getAllMedia(): Promise<MediaItem[]> {
    return this.getStoredMedia();
  }

  async uploadMedia(file: File): Promise<MediaItem> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const item: MediaItem = {
          id: 'med-' + Date.now().toString(36),
          name: file.name,
          url: base64,
          size: file.size,
          type: file.type,
          createdAt: new Date().toISOString(),
        };
        const items = this.getStoredMedia();
        items.unshift(item);
        this.saveStoredMedia(items);
        resolve(item);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async uploadBase64(name: string, base64: string): Promise<MediaItem> {
    const item: MediaItem = {
      id: 'med-' + Date.now().toString(36),
      name,
      url: base64,
      size: Math.round(base64.length * 0.75),
      type: 'image/png',
      createdAt: new Date().toISOString(),
    };
    const items = this.getStoredMedia();
    items.unshift(item);
    this.saveStoredMedia(items);
    return item;
  }

  async deleteMedia(id: string): Promise<boolean> {
    const items = this.getStoredMedia();
    const filtered = items.filter(m => m.id !== id);
    this.saveStoredMedia(filtered);
    return true;
  }
}
