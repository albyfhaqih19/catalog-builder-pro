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

export class SupabaseCatalogRepository implements ICatalogRepository {
  private fallback = new LocalCatalogRepository();

  async getAllCatalogs(): Promise<Catalog[]> {
    if (!supabase) return this.fallback.getAllCatalogs();
    const { data, error } = await supabase.from('catalogs').select('*');
    if (error || !data) return this.fallback.getAllCatalogs();
    return data as Catalog[];
  }

  async getCatalogById(id: string): Promise<Catalog | null> {
    const local = await this.fallback.getCatalogById(id);
    if (!supabase) return local;
    const { data, error } = await supabase.from('catalogs').select('*').eq('id', id).single();
    if (error || !data) return local;

    const remote = data as Catalog;
    return {
      ...remote,
      htmlContent: remote.htmlContent || local?.htmlContent || '',
      sanitizedHtml: remote.sanitizedHtml || local?.sanitizedHtml || '',
    };
  }

  async getCatalogBySlug(slug: string): Promise<Catalog | null> {
    const local = await this.fallback.getCatalogBySlug(slug);
    if (!supabase) return local;
    const { data, error } = await supabase.from('catalogs').select('*').eq('slug', slug).single();
    if (error || !data) return local;

    const remote = data as Catalog;
    return {
      ...remote,
      htmlContent: remote.htmlContent || local?.htmlContent || '',
      sanitizedHtml: remote.sanitizedHtml || local?.sanitizedHtml || '',
    };
  }

  async saveCatalog(catalog: Catalog): Promise<Catalog> {
    // Always persist to local fallback storage first
    const savedLocal = await this.fallback.saveCatalog(catalog);
    if (!supabase) return savedLocal;

    try {
      const { data, error } = await supabase.from('catalogs').upsert(catalog).select().single();
      if (error || !data) return savedLocal;
      return {
        ...data as Catalog,
        htmlContent: (data as Catalog).htmlContent || savedLocal.htmlContent,
        sanitizedHtml: (data as Catalog).sanitizedHtml || savedLocal.sanitizedHtml,
      };
    } catch {
      return savedLocal;
    }
  }

  async deleteCatalog(id: string): Promise<boolean> {
    await this.fallback.deleteCatalog(id);
    if (supabase) {
      await supabase.from('catalogs').delete().eq('id', id);
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
      const updateData: any = {
        status: 'published',
        slug,
        updatedAt: new Date().toISOString(),
      };
      if (localCatalog?.sanitizedHtml) updateData.sanitizedHtml = localCatalog.sanitizedHtml;
      if (localCatalog?.htmlContent) updateData.htmlContent = localCatalog.htmlContent;

      const { data, error } = await supabase
        .from('catalogs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return localCatalog || await this.fallback.publishCatalog(id, slug);
      }
      return {
        ...data as Catalog,
        htmlContent: (data as Catalog).htmlContent || localCatalog?.htmlContent || '',
        sanitizedHtml: (data as Catalog).sanitizedHtml || localCatalog?.sanitizedHtml || '',
      };
    } catch {
      return localCatalog || await this.fallback.publishCatalog(id, slug);
    }
  }

  async incrementViews(slug: string): Promise<number> {
    return this.fallback.incrementViews(slug);
  }
}
