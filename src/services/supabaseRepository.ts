import { createClient } from '@supabase/supabase-js';
import { Catalog, Product } from '../types/catalog';
import { MediaItem } from '../types/media';
import { ICatalogRepository } from './repository';
import { LocalCatalogRepository } from './localRepository';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzcbqkmwkfmttztriufv.supabase.co';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y2Jxa213a2ZtdHR6dHJpdWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NjY0MDAsImV4cCI6MjA1ODI0MjQwMH0.placeholder';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('placeholder'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function catalogToDbPayload(catalog: Catalog) {
  const themeObj = catalog.theme || {};
  return {
    id: catalog.id,
    user_email: catalog.userEmail || catalog.business?.email || null,
    user_id: catalog.userId || null,
    name: catalog.name || catalog.business?.name || 'Katalog Produk',
    title: catalog.name || catalog.business?.name || 'Katalog Produk',
    slug: catalog.slug,
    status: catalog.status,
    business: catalog.business,
    theme: {
      ...themeObj,
      htmlContent: catalog.htmlContent || (themeObj as any).htmlContent || '',
      sanitizedHtml: catalog.sanitizedHtml || (themeObj as any).sanitizedHtml || '',
    },
    products: catalog.products || [],
    views: catalog.views || 0,
    updated_at: new Date().toISOString(),
  };
}

function dbRowToCatalog(row: any, localFallback?: Catalog | null): Catalog {
  let themeObj = row.theme || {};
  if (typeof themeObj === 'string') {
    try { themeObj = JSON.parse(themeObj); } catch {}
  }
  const htmlContent = row.htmlContent || themeObj.htmlContent || localFallback?.htmlContent || '';
  const sanitizedHtml = row.sanitizedHtml || themeObj.sanitizedHtml || localFallback?.sanitizedHtml || '';

  return {
    id: row.id,
    userEmail: row.user_email || row.userEmail || localFallback?.userEmail,
    userId: row.user_id || row.userId || localFallback?.userId,
    name: row.name || row.title || localFallback?.name || 'Katalog Produk',
    slug: row.slug,
    status: row.status,
    business: row.business || localFallback?.business || {},
    theme: themeObj,
    products: row.products || localFallback?.products || [],
    categories: row.categories || localFallback?.categories || [],
    htmlContent,
    sanitizedHtml,
    cssContent: row.cssContent || themeObj.cssContent || '',
    views: row.views || 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

export class SupabaseCatalogRepository implements ICatalogRepository {
  private fallback = new LocalCatalogRepository();

  async getAllCatalogs(userEmail?: string): Promise<Catalog[]> {
    const localList = await this.fallback.getAllCatalogs(userEmail);
    if (!supabase) return localList;
    try {
      let query = supabase.from('catalogs').select('*');
      if (userEmail) {
        query = query.or(`user_email.eq.${userEmail},user_email.is.null`);
      }
      const { data, error } = await query;
      if (error || !data) return localList;
      return data.map(row => {
        const localMatch = localList.find(l => l.id === row.id);
        return dbRowToCatalog(row, localMatch);
      });
    } catch {
      return localList;
    }
  }

  async getCatalogById(id: string): Promise<Catalog | null> {
    const local = await this.fallback.getCatalogById(id);
    if (!supabase) return local;
    try {
      const { data, error } = await supabase.from('catalogs').select('*').eq('id', id).single();
      if (error || !data) return local;
      return dbRowToCatalog(data, local);
    } catch {
      return local;
    }
  }

  async getCatalogBySlug(slug: string): Promise<Catalog | null> {
    const local = await this.fallback.getCatalogBySlug(slug);
    if (!supabase) return local;
    try {
      const { data, error } = await supabase.from('catalogs').select('*').eq('slug', slug).single();
      if (error || !data) return local;
      return dbRowToCatalog(data, local);
    } catch {
      return local;
    }
  }

  async saveCatalog(catalog: Catalog): Promise<Catalog> {
    const savedLocal = await this.fallback.saveCatalog(catalog);
    if (!supabase) return savedLocal;

    try {
      const payload = catalogToDbPayload(catalog);
      const { data, error } = await supabase.from('catalogs').upsert(payload).select().single();
      if (error || !data) return savedLocal;
      return dbRowToCatalog(data, savedLocal);
    } catch {
      return savedLocal;
    }
  }

  async deleteCatalog(id: string): Promise<boolean> {
    await this.fallback.deleteCatalog(id);
    if (supabase) {
      try {
        await supabase.from('catalogs').delete().eq('id', id);
      } catch {}
    }
    return true;
  }

  async generateUniqueSlug(baseName: string, currentId?: string): Promise<string> {
    return this.fallback.generateUniqueSlug(baseName, currentId);
  }

  async publishCatalog(id: string, slug: string): Promise<Catalog> {
    const localCatalog = await this.fallback.getCatalogById(id);
    if (localCatalog) {
      localCatalog.status = 'published';
      localCatalog.slug = slug;
      localCatalog.updatedAt = new Date().toISOString();
      await this.fallback.saveCatalog(localCatalog);
    }

    if (!supabase) {
      return localCatalog || await this.fallback.publishCatalog(id, slug);
    }

    try {
      const payload = localCatalog ? catalogToDbPayload(localCatalog) : { id, status: 'published', slug };
      payload.status = 'published';
      payload.slug = slug;

      const { data, error } = await supabase
        .from('catalogs')
        .upsert(payload)
        .select()
        .single();

      if (error || !data) {
        return localCatalog || await this.fallback.publishCatalog(id, slug);
      }
      return dbRowToCatalog(data, localCatalog);
    } catch {
      return localCatalog || await this.fallback.publishCatalog(id, slug);
    }
  }

  async incrementViews(slug: string): Promise<number> {
    return this.fallback.incrementViews(slug);
  }
}
