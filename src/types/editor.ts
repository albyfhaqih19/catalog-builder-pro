import { Product } from './catalog';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ActiveTab = 'pages' | 'sections' | 'products' | 'categories' | 'media' | 'theme';

export interface SelectedElement {
  type: 'product' | 'business' | 'header' | 'footer' | 'category' | 'theme';
  id?: string;
  field?: string;
  product?: Product;
}

export interface ParseResult {
  isFullyLinked: boolean;
  linkedCount: number;
  totalElementsCount: number;
  missingMarkers: string[];
  sanitizedHtml: string;
}
