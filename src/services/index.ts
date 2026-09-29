import { ICatalogRepository, IProductRepository, IMediaRepository } from './repository';
import { LocalCatalogRepository, LocalProductRepository, LocalMediaRepository } from './localRepository';
import { SupabaseCatalogRepository, isSupabaseConfigured } from './supabaseRepository';

export const catalogRepository: ICatalogRepository = isSupabaseConfigured
  ? new SupabaseCatalogRepository()
  : new LocalCatalogRepository();

export const productRepository: IProductRepository = new LocalProductRepository();
export const mediaRepository: IMediaRepository = new LocalMediaRepository();

export { isSupabaseConfigured };
