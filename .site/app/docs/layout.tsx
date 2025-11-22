import { mdxSource, getDomains, getDomainPages } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import type * as PageTree from 'fumadocs-core/page-tree';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Get all domains from the database
  const domains = getDomains();

  // Create sidebar tabs - one for main docs, one for each domain
  const tabs = [
    {
      title: 'Documentation',
      url: '/docs',
      rootFolder: mdxSource.pageTree,
    },
    ...domains.map(domain => ({
      title: domain.replace('.org.ai', '').replace(/\./g, ' '),
      url: `/docs/${domain}`,
      rootFolder: createDomainPageTree(domain),
    })),
  ];

  return (
    <DocsLayout
      tree={mdxSource.pageTree}
      {...baseOptions()}
      sidebar={{
        tabs,
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  );
}

/**
 * Create a page tree for a specific domain
 */
function createDomainPageTree(domain: string): PageTree.Root {
  const pages = getDomainPages(domain);

  // Group pages by type
  const typeGroups = new Map<string, typeof pages>();

  pages.forEach(page => {
    const type = page.data.type;
    if (!typeGroups.has(type)) {
      typeGroups.set(type, []);
    }
    typeGroups.get(type)!.push(page);
  });

  // Create folder structure
  const children: PageTree.Node[] = [];

  typeGroups.forEach((typePages, type) => {
    children.push({
      type: 'folder',
      name: type,
      index: undefined,
      children: typePages.map(page => ({
        type: 'page',
        name: page.data.title,
        url: page.url,
      })),
    });
  });

  return {
    name: domain,
    children,
  };
}
