import { db } from '@graph.org.ai/mdxdb/db';
import { things } from '@graph.org.ai/mdxdb/schema';
import { eq, sql, and } from 'drizzle-orm';
import type { Page } from 'fumadocs-core/source';
import path from 'path';

// Database path for Page.path property
const dbPath = path.join(process.cwd(), '../.mdxdb/things.db');

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
 * Optimized for large-scale use with hundreds of thousands of pages
 */
export class DatabaseSource {
  private cache: Map<string, DBPage> = new Map();
  private domainCache: Map<string, string[]> = new Map(); // Cache domain type lists
  private domainsListCache: string[] | null = null; // Cache domains list
  private pageTreeCache: Map<string, any> = new Map(); // Cache page trees by domain

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

    const result = db.select().from(things).where(eq(things.url, url)).get();

    if (!result) {
      return undefined;
    }

    const page: DBPage = {
      url: `/docs/${domain}.org.ai/${slugPath}`,
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
    const results = db.select().from(things).where(eq(things.ns, domain)).all();

    return results.map((result) => {
      const slugs = result.url.split('/').filter(Boolean);
      return {
        url: `/docs/${result.ns}.org.ai/${result.url.split('/').slice(1).join('/')}`,
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
    const results = db.select().from(things).all();

    return results.map((result) => {
      const slugs = result.url.split('/').filter(Boolean);
      return {
        url: `/docs/${result.ns}.org.ai/${result.url.split('/').slice(1).join('/')}`,
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
   * Cached for performance with large datasets
   */
  getDomains(): string[] {
    if (this.domainsListCache) {
      return this.domainsListCache;
    }

    const results = db.selectDistinct({ ns: things.ns }).from(things).all();
    this.domainsListCache = results.map(r => r.ns);
    return this.domainsListCache;
  }

  /**
   * Get types for a specific domain
   * Cached to avoid repeated queries
   */
  getDomainTypes(domain: string): string[] {
    if (this.domainCache.has(domain)) {
      return this.domainCache.get(domain)!;
    }

    const results = db
      .selectDistinct({ type: things.type })
      .from(things)
      .where(eq(things.ns, domain))
      .all();

    const types = results.map(r => r.type);
    this.domainCache.set(domain, types);
    return types;
  }

  /**
   * Get lightweight page metadata for sidebar
   * Only loads title, url, type - not full content
   * Optimized for rendering large sidebars
   */
  getPageMetadata(domain: string, type?: string): Array<{ url: string; title: string; type: string }> {
    const whereConditions = type
      ? and(eq(things.ns, domain), eq(things.type, type))
      : eq(things.ns, domain);

    const results = db
      .select({
        url: things.url,
        id: things.id,
        type: things.type,
      })
      .from(things)
      .where(whereConditions)
      .all();

    return results.map(r => ({
      url: `/docs/${domain}.org.ai/${r.url.split('/').slice(1).join('/')}`,
      title: r.id,
      type: r.type,
    }));
  }

  /**
   * Get count of pages for a domain/type
   * Used for pagination calculations
   */
  getPageCount(domain: string, type?: string): number {
    const whereConditions = type
      ? and(eq(things.ns, domain), eq(things.type, type))
      : eq(things.ns, domain);

    const result = db
      .select({ count: sql<number>`count(*)` })
      .from(things)
      .where(whereConditions)
      .get();

    return result?.count ?? 0;
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

    let results;
    if (domain) {
      results = db
        .select()
        .from(things)
        .where(
          sql`${things.ns} = ${domain} AND (${things.id} LIKE ${searchPattern} OR ${things.content} LIKE ${searchPattern})`
        )
        .all();
    } else {
      results = db
        .select()
        .from(things)
        .where(sql`${things.id} LIKE ${searchPattern} OR ${things.content} LIKE ${searchPattern}`)
        .all();
    }

    return results.map((result) => {
      const slugs = result.url.split('/').filter(Boolean);
      return {
        url: `/docs/${result.ns}.org.ai/${result.url.split('/').slice(1).join('/')}`,
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
