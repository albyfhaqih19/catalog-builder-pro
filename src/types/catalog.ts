export type StockStatus = 'available' | 'out_of_stock' | 'pre_order';
export type BadgeType = 'Best Seller' | 'New' | 'Promo' | 'Recommended' | 'Limited' | 'Custom';
export type CatalogStatus = 'draft' | 'published';

export interface BusinessInfo {
  name: string;
  category: string;
  description: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  address: string;
  openingHours: string;
  mapsUrl?: string;
  ctaText?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  description: string;
  shortDescription?: string;
  images: string[];
  badge?: BadgeType | string;
  stockStatus: StockStatus;
  ctaText: string;
  ctaUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

export interface ThemeConfig {
  themeId: string;
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  fontFamily: string;
  cardStyle: 'rounded' | 'shadow' | 'border' | 'glass';
  headerStyle: 'minimal' | 'hero' | 'centered' | 'banner';
}

export interface CustomBlock {
  id: string;
  type: string;
  content: Record<string, any>;
}

export interface Catalog {
  id: string;
  name: string;
  slug: string;
  business: BusinessInfo;
  theme: ThemeConfig;
  products: Product[];
  categories: Category[];
  customBlocks?: CustomBlock[];
  htmlContent?: string;
  sanitizedHtml?: string;
  cssContent?: string;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
  views?: number;
}

export interface MarkerElement {
  id: string;
  type: string;
  field?: string;
  elementName: string;
}
