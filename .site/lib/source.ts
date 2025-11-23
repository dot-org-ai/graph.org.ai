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

/**
 * Format domain name for display
 * E.g., "schema.org" -> "Schema.org.ai", "onet" -> "O*NET.org.ai"
 */
function formatDomainName(domain: string): string {
  const domainMap: Record<string, string> = {
    'schema.org': 'Schema.org.ai',
    'onet': 'O*NET.org.ai',
    'apqc': 'APQC.org.ai',
    'unspsc': 'UNSPSC.org.ai',
    'model': 'Models.org.ai',
  };

  return domainMap[domain] || `${domain.charAt(0).toUpperCase() + domain.slice(1)}.org.ai`;
}

/**
 * Build a domain-specific page tree (for dynamic sidebar)
 * Shallow structure - just shows types, clicking into a type will reposition sidebar
 */
async function buildDomainPageTree(domain: string): Promise<any> {
  const types = await clickhouseQueries.getDomainTypesWithCounts(domain);
  const displayName = formatDomainName(domain);

  // Create flat list of type links - no deep nesting
  const typeNodes = types.map((typeInfo) => ({
    $id: `${domain}:${typeInfo.type}`,
    type: 'page' as const,
    name: `${typeInfo.type}s (${typeInfo.count.toLocaleString()})`,
    description: `${typeInfo.count} ${typeInfo.type} entities`,
    icon: undefined,
    url: `/${typeInfo.type}`,
    $ref: {
      source: 'clickhouse',
      domain,
      type: typeInfo.type,
    },
  }));

  return {
    $id: `root:${domain}`,
    name: displayName,
    description: `Browse ${displayName}`,
    icon: undefined,
    index: {
      $id: `root:${domain}:index`,
      type: 'page' as const,
      name: displayName,
      description: `${displayName} overview`,
      url: `/${domain}`,
      icon: undefined,
    },
    children: typeNodes,
  };
}

/**
 * Build a type-specific page tree (for dynamic sidebar when viewing a type)
 */
async function buildTypePageTree(type: string, namespace?: string): Promise<any> {
  // If we have a namespace, show just that namespace's items
  if (namespace) {
    const displayName = formatDomainName(namespace);
    const types = await clickhouseQueries.getDomainTypesWithCounts(namespace);

    const typeNodes = types.map((typeInfo) => ({
      $id: `${namespace}:${typeInfo.type}`,
      type: 'page' as const,
      name: `${typeInfo.type}s (${typeInfo.count.toLocaleString()})`,
      description: `${typeInfo.count} ${typeInfo.type} entities`,
      icon: undefined,
      url: `/${typeInfo.type}`,
      $ref: {
        source: 'clickhouse',
        domain: namespace,
        type: typeInfo.type,
      },
    }));

    return {
      $id: `root:${namespace}`,
      name: displayName,
      description: `Browse ${displayName}`,
      icon: undefined,
      index: {
        $id: `root:${namespace}:index`,
        type: 'page' as const,
        name: displayName,
        description: `${displayName} overview`,
        url: `/${namespace}`,
        icon: undefined,
      },
      children: typeNodes,
    };
  }

  // Otherwise, show all types
  const allTypes = await clickhouseQueries.getAllTypes();
  const typeNodes = await Promise.all(allTypes.map(async (t) => {
    const count = await clickhouseQueries.getTypeCount(t);
    return {
      $id: `type:${t}`,
      type: 'page' as const,
      name: `${t}s (${count.toLocaleString()})`,
      description: `${count} ${t} entities`,
      icon: undefined,
      url: `/${t}`,
      $ref: {
        source: 'clickhouse',
        type: t,
      },
    };
  }));

  return {
    $id: 'root:global',
    name: '.org.ai',
    description: 'Browse all types',
    icon: undefined,
    children: typeNodes,
  };
}

/**
 * Build custom page tree with database domains
 * Following Fumadocs structure with proper $id properties
 * Organized in semantic hierarchy
 */
async function buildPageTree(): Promise<any> {
  // Get the MDX page tree as base
  const mdxTree = mdxSource.pageTree;

  // Get domains from database
  const domains = await clickhouseQueries.getDomains();
  const domainMap = new Map<string, any>();

  // Build individual domain nodes
  for (const domain of domains) {
    const types = await clickhouseQueries.getDomainTypesWithCounts(domain);
    const displayName = formatDomainName(domain);

    // Create child nodes for each type
    const typeNodes = types.slice(0, 10).map((typeInfo) => ({
      $id: `db:${domain}/${typeInfo.type}`,
      type: 'page' as const,
      name: `${typeInfo.type} (${typeInfo.count})`,
      description: `${typeInfo.count} ${typeInfo.type} entities`,
      icon: undefined,
      url: `/${domain}/${typeInfo.type}`,
      $ref: {
        source: 'clickhouse',
        domain,
        type: typeInfo.type,
      },
    }));

    domainMap.set(domain, {
      type: 'folder' as const,
      name: displayName,
      icon: undefined,
      root: undefined,
      defaultOpen: undefined,
      description: `${displayName} entities`,
      index: {
        $id: `db:${domain}`,
        type: 'page' as const,
        name: `${displayName} Overview`,
        description: `Browse ${displayName} entities`,
        icon: undefined,
        url: `/${domain}`,
        $ref: {
          source: 'clickhouse',
          domain,
        },
      },
      children: typeNodes,
      $id: `db:${domain}`,
      $ref: undefined,
    });
  }

  // Build shallow top-level domain links - clicking into one will reorganize sidebar
  const topLevelNodes = [];

  // Get all available domains and create simple links
  for (const [domain, domainNode] of domainMap.entries()) {
    const types = await clickhouseQueries.getDomainTypesWithCounts(domain);
    const totalCount = types.reduce((sum, t) => sum + t.count, 0);
    const displayName = formatDomainName(domain);

    topLevelNodes.push({
      $id: `domain:${domain}`,
      type: 'page' as const,
      name: `${displayName} (${totalCount.toLocaleString()})`,
      description: `${totalCount.toLocaleString()} items across ${types.length} types`,
      icon: undefined,
      url: `/${domain}`,
      $ref: {
        source: 'clickhouse',
        domain,
      },
    });
  }

  // Sort domains in a semantic order
  const domainOrder = ['language', 'onet', 'apqc', 'schema.org', 'unspsc', 'model'];
  topLevelNodes.sort((a, b) => {
    const aDomain = a.$id.replace('domain:', '');
    const bDomain = b.$id.replace('domain:', '');
    const aIndex = domainOrder.indexOf(aDomain);
    const bIndex = domainOrder.indexOf(bDomain);

    if (aIndex === -1 && bIndex === -1) return aDomain.localeCompare(bDomain);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Combine MDX children with top-level domains
  return {
    ...mdxTree,
    children: [
      ...(mdxTree.children || []),
      ...topLevelNodes,
    ],
  };
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
          title: thing.data?.name || thing.data?.title || thing.id,
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

  get pageTree() {
    // Return a promise that resolves to the combined page tree
    return buildPageTree();
  },

  // Get context-aware page tree based on current route
  getContextPageTree: async (slug?: string[]) => {
    if (!slug || slug.length === 0) {
      // Homepage - show global tree
      return buildPageTree();
    }

    const firstSegment = slug[0];

    // Check if first segment is a domain
    const domains = await clickhouseQueries.getDomains();
    if (domains.includes(firstSegment)) {
      // This is a domain route - show domain-specific sidebar with root folder
      const tree = await buildDomainPageTree(firstSegment);
      return {
        name: '.org.ai',
        children: [{
          ...tree,
          type: 'folder' as const,
          root: true,
        }],
      };
    }

    // Check if first segment is a type
    const allTypes = await clickhouseQueries.getAllTypes();
    if (allTypes.includes(firstSegment)) {
      // This is a type route - determine if it has a single namespace
      const things = await clickhouseQueries.getSampleThingsByType(firstSegment, 5);
      const namespaces = [...new Set(things.map(t => t.ns))];

      if (namespaces.length === 1) {
        // All items are from one namespace - show that namespace's sidebar with root folder
        const tree = await buildTypePageTree(firstSegment, namespaces[0]);
        return {
          name: '.org.ai',
          children: [{
            ...tree,
            type: 'folder' as const,
            root: true,
          }],
        };
      } else {
        // Mixed namespaces - show all types
        const tree = await buildTypePageTree(firstSegment);
        return {
          name: '.org.ai',
          children: [{
            ...tree,
            type: 'folder' as const,
            root: true,
          }],
        };
      }
    }

    // Default to global tree
    return buildPageTree();
  },
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

/**
 * Get paginated things by type with cursor-based pagination
 */
export async function getPaginatedThingsByType(
  type: string,
  limit?: number,
  after?: string,
  before?: string
) {
  return await clickhouseQueries.getPaginatedThingsByType(type, limit, after, before);
}
