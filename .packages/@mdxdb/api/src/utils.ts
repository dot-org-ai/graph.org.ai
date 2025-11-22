import { render } from '@mdxui/api';
import type { ContentFormat } from './types';

/**
 * Convert content between formats
 */
export async function convertContent(
  content: string | null | undefined,
  fromFormat: ContentFormat,
  toFormat: ContentFormat
): Promise<string | null> {
  if (!content) return null;
  if (fromFormat === toFormat) return content;

  // If source is MDX, we can render to any format
  if (fromFormat === 'mdx') {
    const result = await render(content, toFormat === 'json' ? 'json' : 'markdown');
    if (toFormat === 'json') {
      return JSON.stringify(result.json);
    }
    return result.markdown || null;
  }

  // If converting from JSON to markdown or vice versa, go through MDX
  // This is a simplified approach - may need enhancement
  if (fromFormat === 'json' && toFormat === 'markdown') {
    // Parse JSON and convert to MDX first (simplified)
    return content; // Placeholder - would need proper JSON->MDX conversion
  }

  return content;
}

/**
 * Build URL from ns/type/id
 * URLs always start with https://
 */
export function buildUrl(ns: string, type: string, id: string): string {
  // If ns already starts with https://, use as-is
  if (ns.startsWith('https://')) {
    return `${ns}/${type}/${id}`;
  }
  // Otherwise, prepend https://
  return `https://${ns}/${type}/${id}`;
}

/**
 * Normalize URL to ensure it starts with https://
 */
export function normalizeUrl(url: string): string {
  if (url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return `https://${url}`;
}

/**
 * Parse query string numbers
 */
export function parseQueryNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
