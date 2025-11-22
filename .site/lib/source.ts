import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { dbSource } from './db-source';

// MDX-based source for traditional docs
// See https://fumadocs.dev/docs/headless/source-api for more info
export const mdxSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

// Database source for dynamic content from TSV/SQLite
export { dbSource };

// Combined source - tries MDX first, then falls back to database
export const source = {
  getPage: (slug?: string[]) => {
    // Check if this is a domain-based route (first segment ends with .org.ai)
    if (slug && slug.length > 0 && slug[0].endsWith('.org.ai')) {
      const domain = slug[0];
      const remainingSlug = slug.slice(1);
      return dbSource.getPage(domain, remainingSlug);
    }

    // Otherwise use MDX source
    return mdxSource.getPage(slug);
  },

  getPages: () => {
    // Combine both sources
    return [...mdxSource.getPages(), ...dbSource.getAllPages()];
  },

  generateParams: () => {
    // Generate params for both sources
    return [...mdxSource.generateParams(), ...dbSource.generateParams()];
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
 * Get all domains from the database
 */
export function getDomains() {
  return dbSource.getDomains();
}

/**
 * Get pages for a specific domain
 */
export function getDomainPages(domain: string) {
  return dbSource.getPages(domain);
}
