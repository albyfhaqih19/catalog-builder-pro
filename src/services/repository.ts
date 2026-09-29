import { Catalog, Product, Category } from '../types/catalog';
import { MediaItem } from '../types/media';

export interface ICatalogRepository {
  getAllCatalogs(): Promise<Catalog[]>;
  getCatalogById(id: string): Promise<Catalog | null>;
  getCatalogBySlug(slug: string): Promise<Catalog | null>;
  saveCatalog(catalog: Catalog): Promise<Catalog>;
  deleteCatalog(id: string): Promise<boolean>;
  generateUniqueSlug(baseName: string, currentId?: string): Promise<string>;
  publishCatalog(id: string, slug: string): Promise<Catalog>;
  incrementViews(slug: string): Promise<number>;
}

export interface IProductRepository {
  getProductsByCatalogId(catalogId: string): Promise<Product[]>;
  saveProduct(catalogId: string, product: Product): Promise<Product>;
  deleteProduct(catalogId: string, productId: string): Promise<boolean>;
  reorderProducts(catalogId: string, productIds: string[]): Promise<Product[]>;
}

export interface IMediaRepository {
  getAllMedia(): Promise<MediaItem[]>;
  uploadMedia(file: File): Promise<MediaItem>;
  uploadBase64(name: string, base64: string): Promise<MediaItem>;
  deleteMedia(id: string): Promise<boolean>;
}
