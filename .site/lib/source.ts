import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';
import type { ClickHouseThing } from '@graph.org.ai/mdxdb/clickhouse-queries';

// MDX-based source for traditional docs
// See https://fumadocs.dev/docs/headless/source-api for more info
export const mdxSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

/**
 * Extract description from thing data
 */
function extractDescription(thing: ClickHouseThing): string | undefined {
  if (thing.data?.description) {
    return thing.data.description;
  }
  if (thing.content) {
    const firstPara = thing.content.split('\n\n')[0];
    return firstPara.substring(0, 160);
  }
  return undefined;
}

/**
 * Format thing content as markdown
 */
function formatContent(thing: ClickHouseThing): string {
  let content = '';

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

  if (thing.content) {
    content += thing.content;
  }

  if (thing.code) {
    content += '\n\n## Code\n\n```typescript\n' + thing.code + '\n```\n';
  }

  return content;
}

/**
 * Generate table of contents
 */
function generateTOC(thing: ClickHouseThing): any[] {
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
function generateStructuredData(thing: ClickHouseThing): {
  headings: Array<{ id: string; content: string }>;
  contents: Array<{ heading?: string; content: string }>;
} {
  const headings: Array<{ id: string; content: string }> = [];
  const contents: Array<{ heading?: string; content: string }> = [];

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

  if (thing.content) {
    contents.push({
      content: thing.content,
    });
  }

  if (thing.code) {
    headings.push({ id: 'code', content: 'Code' });
    contents.push({
      heading: 'Code',
      content: thing.code,
    });
  }

  return { headings, contents };
}

// Combined source - domain pages at root, no /docs prefix
export const source = {
  getPage: async (slug?: string[]) => {
    // Check if this is a domain-based route
    if (slug && slug.length > 0) {
      const domain = slug[0];
      const remainingSlug = slug.slice(1);

      const thing = await clickhouseQueries.getPage(domain, remainingSlug);
      if (!thing) {
        // Try MDX as fallback
        return mdxSource.getPage(slug);
      }

      // Convert ClickHouse thing to Page format
      return {
        url: `/${domain}/${remainingSlug.join('/')}`,
        slugs: slug,
        path: `clickhouse://${domain}/${remainingSlug.join('/')}`,
        data: {
          title: thing.id,
          description: extractDescription(thing),
          body: formatContent(thing),
          domain: thing.ns,
          type: thing.type,
          id: thing.id,
          rawData: thing.data,
          toc: generateTOC(thing),
          structuredData: generateStructuredData(thing),
        },
      };
    }

    // Otherwise use MDX source
    return mdxSource.getPage(slug);
  },

  getPages: () => {
    // Combine both sources
    // Temporarily disabled dbSource to debug
    return [...mdxSource.getPages() /*, ...dbSource.getAllPages()*/];
  },

  generateParams: () => {
    // Generate params for both sources
    // Temporarily disabled dbSource to debug infinite loop
    return [...mdxSource.generateParams() /*, ...dbSource.generateParams()*/];
  },

  pageTree: mdxSource.pageTree,
};

export function getPageImage(page: InferPageType<typeof mdxSource>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof mdxSource>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}

/**
 * Get all domains from ClickHouse
 */
export async function getDomains() {
  return await clickhouseQueries.getDomains();
}

/**
 * Get pages for a specific domain
 */
export async function getDomainPages(domain: string) {
  return await clickhouseQueries.getPages(domain);
}

/**
 * Get types for a specific domain
 */
export async function getDomainTypes(domain: string) {
  return await clickhouseQueries.getDomainTypes(domain);
}

/**
 * Get lightweight page metadata for sidebar
 */
export async function getPageMetadata(domain: string, type?: string) {
  const metadata = await clickhouseQueries.getPageMetadata(domain, type);
  // Update URLs to remove /docs prefix
  return metadata.map(m => ({
    ...m,
    url: m.url.replace(/^\/docs\/[^/]+\.org\.ai/, `/${domain}`),
  }));
}

/**
 * Get count of pages for pagination
 */
export async function getPageCount(domain: string, type?: string) {
  return await clickhouseQueries.getPageCount(domain, type);
}

/**
 * Get all unique thing types across all domains
 */
export async function getAllTypes() {
  return await clickhouseQueries.getAllTypes();
}

/**
 * Get count of things by type
 */
export async function getTypeCount(type: string) {
  return await clickhouseQueries.getTypeCount(type);
}

/**
 * Get sample things by type (for homepage display)
 */
export async function getSampleThingsByType(type: string, limit?: number) {
  return await clickhouseQueries.getSampleThingsByType(type, limit);
}
