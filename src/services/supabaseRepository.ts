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
    if (!supabase) return this.fallback.getCatalogById(id);
    const { data, error } = await supabase.from('catalogs').select('*').eq('id', id).single();
    if (error || !data) return this.fallback.getCatalogById(id);
    return data as Catalog;
  }

  async getCatalogBySlug(slug: string): Promise<Catalog | null> {
    if (!supabase) return this.fallback.getCatalogBySlug(slug);
    const { data, error } = await supabase.from('catalogs').select('*').eq('slug', slug).single();
    if (error || !data) return this.fallback.getCatalogBySlug(slug);
    return data as Catalog;
  }

  async saveCatalog(catalog: Catalog): Promise<Catalog> {
    if (!supabase) return this.fallback.saveCatalog(catalog);
    const { data, error } = await supabase.from('catalogs').upsert(catalog).select().single();
    if (error || !data) return this.fallback.saveCatalog(catalog);
    return data as Catalog;
  }

  async deleteCatalog(id: string): Promise<boolean> {
    if (!supabase) return this.fallback.deleteCatalog(id);
    const { error } = await supabase.from('catalogs').delete().eq('id', id);
    if (error) return this.fallback.deleteCatalog(id);
    return true;
  }

  async generateUniqueSlug(baseName: string, currentId?: string): Promise<string> {
    return this.fallback.generateUniqueSlug(baseName, currentId);
  }

  async publishCatalog(id: string, slug: string): Promise<Catalog> {
    if (!supabase) return this.fallback.publishCatalog(id, slug);
    const { data, error } = await supabase
      .from('catalogs')
      .update({ status: 'published', slug, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return this.fallback.publishCatalog(id, slug);
    return data as Catalog;
  }

  async incrementViews(slug: string): Promise<number> {
    return this.fallback.incrementViews(slug);
  }
}
