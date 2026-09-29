import { Catalog } from '../types/catalog';
import { PREBUILT_THEMES } from './themes';

export interface CatalogTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  themeId: string;
  previewImage: string;
  sampleCatalog: Partial<Catalog>;
}

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'tpl-cafe',
    name: 'Cafe & Coffee Shop',
    description: 'Template ideal untuk warkop, cafe modern, dan kedai minuman kekinian.',
    category: 'Cafe & Restaurant',
    themeId: 'cafe',
    previewImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80',
    sampleCatalog: {
      name: 'Katalog Cafe & Artisan Coffee',
      business: {
        name: 'Kopi Senja',
        category: 'Cafe & Bakery',
        description: 'Biji kopi pilihan Nusantara dan pastry segar panggang tiap hari.',
        logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80',
        phone: '081234567890',
        whatsapp: '6281234567890',
        email: 'order@kopisenja.com',
        website: 'https://kopisenja.com',
        instagram: '@kopisenja.id',
        facebook: 'KopiSenjaOfficial',
        tiktok: '@kopisenja',
        address: 'Jl. Senopati No. 45, Jakarta Selatan',
        openingHours: '07.00 - 22.00 WIB',
        ctaText: 'Pesan via WA'
      },
      categories: [
        { id: 'cat-1', name: 'Espresso Bar', displayOrder: 1 },
        { id: 'cat-2', name: 'Non-Coffee', displayOrder: 2 },
      ]
    }
  },
  {
    id: 'tpl-restaurant',
    name: 'Restaurant Menu',
    description: 'Buku menu digital mewah untuk resto & rumah makan.',
    category: 'Food & Beverage',
    themeId: 'restaurant',
    previewImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    sampleCatalog: {
      name: 'Menu Makanan Resto Gourmet',
      business: {
        name: 'Resto Dapur Nusantara',
        category: 'Restoran',
        description: 'Kuliner masakan khas Nusantara rasa otentik bumbu rempah pilihan.',
        logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80',
        phone: '081122334455',
        whatsapp: '6281122334455',
        email: 'info@dapurnusantara.com',
        website: '',
        instagram: '@dapurnusantara',
        facebook: '',
        tiktok: '',
        address: 'Jl. Sudirman No. 12, Bandung',
        openingHours: '10.00 - 22.00 WIB'
      }
    }
  },
  {
    id: 'tpl-fashion',
    name: 'Fashion & Clothing Store',
    description: 'Tampilan katalog minimalis & elegan untuk brand baju & fashion.',
    category: 'Fashion',
    themeId: 'fashion',
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80',
    sampleCatalog: {
      name: 'Katalog Koleksi Summer Fashion',
      business: {
        name: 'Vogue Wear Studio',
        category: 'Fashion & Apparel',
        description: 'Pakaian pria & wanita desain eksklusif bahan katun premium.',
        logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80',
        phone: '089988776655',
        whatsapp: '6289988776655',
        email: 'sales@voguewear.id',
        website: '',
        instagram: '@voguewear.id',
        facebook: '',
        tiktok: '',
        address: 'Plaza Indonesia Lt. 2, Jakarta',
        openingHours: '10.00 - 21.00 WIB'
      }
    }
  },
  {
    id: 'tpl-beauty',
    name: 'Beauty & Skincare',
    description: 'Layout lembut nan cantik untuk produk kecantikan & perawatan kulit.',
    category: 'Beauty',
    themeId: 'elegant',
    previewImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
    sampleCatalog: {
      name: 'Glow Skincare Official Catalog',
      business: {
        name: 'Glow Natural Beauty',
        category: 'Skincare & Cosmetics',
        description: 'Produk perawatan kulit alami teruji BPOM & ramah lingkungan.',
        logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80',
        phone: '085544332211',
        whatsapp: '6285544332211',
        email: 'cs@glownatural.com',
        website: '',
        instagram: '@glownatural.official',
        facebook: '',
        tiktok: '',
        address: 'Surabaya, Jawa Timur',
        openingHours: '09.00 - 18.00 WIB'
      }
    }
  },
  {
    id: 'tpl-electronics',
    name: 'Electronics & Gadgets',
    description: 'Desain katalog modern high-tech untuk toko gadget & komputer.',
    category: 'Electronics',
    themeId: 'dark-premium',
    previewImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80',
    sampleCatalog: {
      name: 'Katalog Gadget & Aksesoris Pro',
      business: {
        name: 'TechZone Official',
        category: 'Gadget & Electronics',
        description: 'Pusat aksesoris smartphone, laptop, dan audio garansi resmi.',
        logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&q=80',
        phone: '081299001122',
        whatsapp: '6281299001122',
        email: 'sales@techzone.co.id',
        website: '',
        instagram: '@techzone_id',
        facebook: '',
        tiktok: '',
        address: 'Mangga Dua Mall Lt. 3, Jakarta',
        openingHours: '10.00 - 19.00 WIB'
      }
    }
  },
  {
    id: 'tpl-corporate',
    name: 'Corporate Services',
    description: 'Pilihan tepat untuk penyedia jasa profesional & B2B supplier.',
    category: 'Services',
    themeId: 'corporate',
    previewImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80',
    sampleCatalog: {
      name: 'Katalog Layanan IT & Agency',
      business: {
        name: 'Elevate Digital Agency',
        category: 'Jasa Professional',
        description: 'Solusi pembuatan website, branding, dan digital marketing terpercaya.',
        logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80',
        phone: '082133445566',
        whatsapp: '6282133445566',
        email: 'hello@elevatedigital.com',
        website: '',
        instagram: '@elevatedigital',
        facebook: '',
        tiktok: '',
        address: 'SCBD District 8, Jakarta',
        openingHours: '09.00 - 17.00 WIB'
      }
    }
  }
];
