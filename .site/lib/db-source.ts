import Database from 'better-sqlite3';
import type { Page } from 'fumadocs-core/source';
import path from 'path';

// Initialize database connection
const dbPath = path.join(process.cwd(), '../.mdxdb/source.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export interface DBPage extends Page {
  data: {
    title: string;
    description?: string;
    body: string;
    domain: string;
    type: string;
    id: string;
    rawData: any;
    toc: any[];
    full?: boolean;
    structuredData?: {
      headings: Array<{ id: string; content: string }>;
      contents: Array<{ heading?: string; content: string }>;
    };
  };
}

/**
 * Custom source that loads pages from SQLite database
 */
export class DatabaseSource {
  private cache: Map<string, DBPage> = new Map();

  /**
   * Get a page by domain and slug
   */
  getPage(domain: string, slug?: string[]): DBPage | undefined {
    const slugPath = slug?.join('/') || '';
    const cacheKey = `${domain}/${slugPath}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Query the database for the thing
    const url = slugPath
      ? `${domain}/${slugPath}`
      : domain;

    const stmt = db.prepare('SELECT * FROM things WHERE url = ?');
    const result = stmt.get(url) as any;

    if (!result) {
      return undefined;
    }

    // Parse JSON fields
    if (result.data && typeof result.data === 'string') {
      result.data = JSON.parse(result.data);
    }
    if (result.meta && typeof result.meta === 'string') {
      result.meta = JSON.parse(result.meta);
    }

    const page: DBPage = {
      url: `/${domain}/${slugPath}`,
      slugs: slug || [],
      path: dbPath, // Physical file path - using db path as placeholder
      data: {
        title: result.id,
        description: this.extractDescription(result),
        body: this.formatContent(result),
        domain: result.ns,
        type: result.type,
        id: result.id,
        rawData: result.data,
        toc: this.generateTOC(result),
        structuredData: this.generateStructuredData(result),
      },
    };

    this.cache.set(cacheKey, page);
    return page;
  }

  /**
   * Get all pages for a specific domain
   */
  getPages(domain: string): DBPage[] {
    const stmt = db.prepare('SELECT * FROM things WHERE ns = ?');
    const results = stmt.all(domain) as any[];

    return results.map((result: any) => {
      // Parse JSON fields
      if (result.data && typeof result.data === 'string') {
        result.data = JSON.parse(result.data);
      }
      if (result.meta && typeof result.meta === 'string') {
        result.meta = JSON.parse(result.meta);
      }
      const slugs = result.url.split('/').filter(Boolean);
      return {
        url: `/${result.url}`,
        slugs,
        path: dbPath, // Physical file path - using db path as placeholder
        data: {
          title: result.id,
          description: this.extractDescription(result),
          body: this.formatContent(result),
          domain: result.ns,
          type: result.type,
          id: result.id,
          rawData: result.data,
          toc: this.generateTOC(result),
          structuredData: this.generateStructuredData(result),
        },
      };
    });
  }

  /**
   * Get all pages across all domains
   */
  getAllPages(): DBPage[] {
    const stmt = db.prepare('SELECT * FROM things');
    const results = stmt.all() as any[];

    return results.map((result: any) => {
      // Parse JSON fields
      if (result.data && typeof result.data === 'string') {
        result.data = JSON.parse(result.data);
      }
      if (result.meta && typeof result.meta === 'string') {
        result.meta = JSON.parse(result.meta);
      }
      const slugs = result.url.split('/').filter(Boolean);
      return {
        url: `/${result.url}`,
        slugs,
        path: dbPath, // Physical file path - using db path as placeholder
        data: {
          title: result.id,
          description: this.extractDescription(result),
          body: this.formatContent(result),
          domain: result.ns,
          type: result.type,
          id: result.id,
          rawData: result.data,
          toc: this.generateTOC(result),
          structuredData: this.generateStructuredData(result),
        },
      };
    });
  }

  /**
   * Generate static params for Next.js
   */
  generateParams() {
    const pages = this.getAllPages();
    return pages.map(page => ({
      slug: page.slugs,
    }));
  }

  /**
   * Get list of unique domains
   */
  getDomains(): string[] {
    const stmt = db.prepare('SELECT DISTINCT ns FROM things');
    const results = stmt.all() as { ns: string }[];
    return results.map(r => r.ns);
  }

  /**
   * Extract description from thing data
   */
  private extractDescription(thing: any): string | undefined {
    if (thing.data?.description) {
      return thing.data.description;
    }
    if (thing.content) {
      // Extract first paragraph as description
      const firstPara = thing.content.split('\n\n')[0];
      return firstPara.substring(0, 160);
    }
    return undefined;
  }

  /**
   * Format thing content as markdown
   */
  private formatContent(thing: any): string {
    let content = '';

    // Add data properties as description list
    if (thing.data && typeof thing.data === 'object') {
      content += '## Properties\n\n';
      for (const [key, value] of Object.entries(thing.data)) {
        if (typeof value === 'string' || typeof value === 'number') {
          content += `- **${key}**: ${value}\n`;
        } else if (Array.isArray(value)) {
          content += `- **${key}**: ${value.join(', ')}\n`;
        }
      }
      content += '\n';
    }

    // Add markdown content
    if (thing.content) {
      content += thing.content;
    }

    // Add code if present
    if (thing.code) {
      content += '\n\n## Code\n\n```typescript\n' + thing.code + '\n```\n';
    }

    return content;
  }

  /**
   * Generate table of contents
   */
  private generateTOC(thing: any): any[] {
    const toc = [];

    if (thing.data) {
      toc.push({
        title: 'Properties',
        url: '#properties',
        depth: 2,
      });
    }

    if (thing.code) {
      toc.push({
        title: 'Code',
        url: '#code',
        depth: 2,
      });
    }

    return toc;
  }

  /**
   * Generate structured data for search indexing
   */
  private generateStructuredData(thing: any): {
    headings: Array<{ id: string; content: string }>;
    contents: Array<{ heading?: string; content: string }>;
  } {
    const headings: Array<{ id: string; content: string }> = [];
    const contents: Array<{ heading?: string; content: string }> = [];

    // Add properties as searchable content
    if (thing.data && typeof thing.data === 'object') {
      headings.push({ id: 'properties', content: 'Properties' });

      const propertyTexts: string[] = [];
      for (const [key, value] of Object.entries(thing.data)) {
        if (typeof value === 'string') {
          propertyTexts.push(`${key}: ${value}`);
        } else if (typeof value === 'number') {
          propertyTexts.push(`${key}: ${value}`);
        } else if (Array.isArray(value)) {
          propertyTexts.push(`${key}: ${value.join(', ')}`);
        }
      }

      contents.push({
        heading: 'Properties',
        content: propertyTexts.join('\n'),
      });
    }

    // Add markdown content
    if (thing.content) {
      contents.push({
        content: thing.content,
      });
    }

    // Add code
    if (thing.code) {
      headings.push({ id: 'code', content: 'Code' });
      contents.push({
        heading: 'Code',
        content: thing.code,
      });
    }

    return { headings, contents };
  }

  /**
   * Search across all things
   */
  search(query: string, domain?: string): DBPage[] {
    const searchPattern = `%${query}%`;

    let stmt;
    let results: any[];

    if (domain) {
      stmt = db.prepare(
        'SELECT * FROM things WHERE ns = ? AND (id LIKE ? OR content LIKE ?)'
      );
      results = stmt.all(domain, searchPattern, searchPattern) as any[];
    } else {
      stmt = db.prepare('SELECT * FROM things WHERE id LIKE ? OR content LIKE ?');
      results = stmt.all(searchPattern, searchPattern) as any[];
    }

    return results.map((result: any) => {
      // Parse JSON fields
      if (result.data && typeof result.data === 'string') {
        result.data = JSON.parse(result.data);
      }
      if (result.meta && typeof result.meta === 'string') {
        result.meta = JSON.parse(result.meta);
      }
      const slugs = result.url.split('/').filter(Boolean);
      return {
        url: `/${result.url}`,
        slugs,
        path: dbPath, // Physical file path - using db path as placeholder
        data: {
          title: result.id,
          description: this.extractDescription(result),
          body: this.formatContent(result),
          domain: result.ns,
          type: result.type,
          id: result.id,
          rawData: result.data,
          toc: this.generateTOC(result),
          structuredData: this.generateStructuredData(result),
        },
      };
    });
  }
}

// Export singleton instance
export const dbSource = new DatabaseSource();
