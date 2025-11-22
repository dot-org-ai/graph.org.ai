import { RootProvider } from 'fumadocs-ui/provider/next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import './global.css';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { getDomains, getPageMetadata, getDomainTypes } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  buildUNSPSCHierarchy,
  buildONETHierarchy,
  buildAPQCHierarchy,
  buildFlatHierarchy,
} from '@/lib/hierarchy';

const inter = Inter({
  subsets: ['latin'],
});

async function createDomainPageTree(domain: string): Promise<PageTree.Root> {
  const allMetadata = await getPageMetadata(domain);

  let children: PageTree.Node[];

  switch (domain) {
    case 'unspsc':
      children = buildUNSPSCHierarchy(allMetadata);
      break;
    case 'onet':
      children = buildONETHierarchy(allMetadata);
      break;
    case 'apqc':
      children = buildAPQCHierarchy(allMetadata);
      break;
    default:
      children = buildFlatHierarchy(allMetadata);
      break;
  }

  return {
    name: domain,
    children,
  };
}

async function createTypePageTree(domain: string, type: string): Promise<PageTree.Root> {
  const typeMetadata = await getPageMetadata(domain, type);

  // For now, just create a flat list of items
  const children: PageTree.Node[] = typeMetadata.slice(0, 100).map(item => ({
    type: 'page' as const,
    name: item.title,
    url: item.url,
  }));

  if (typeMetadata.length > 100) {
    children.push({
      type: 'page' as const,
      name: `... and ${typeMetadata.length - 100} more`,
      url: `/${type}`,
    });
  }

  return {
    name: type,
    children,
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Get current path to determine context
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Parse the URL to understand context
  const pathParts = pathname.split('/').filter(Boolean);
  const domain = pathParts[0];
  const type = pathParts[1];

  let tabs: any[] = [];

  // Always include home tab
  const homeTab = {
    title: '.org.ai',
    url: '/',
    rootFolder: {
      name: '.org.ai',
      children: [{
        type: 'page' as const,
        name: 'Home',
        url: '/',
      }],
    },
  };

  try {
    if (!domain) {
      // At root level - show all domains as tabs
      const domains = await getDomains();
      const domainTabs = await Promise.all(
        domains.map(async (d) => ({
          title: d,
          url: `/${d}`,
          rootFolder: await createDomainPageTree(d),
        }))
      );
      tabs = [homeTab, ...domainTabs];
    } else if (type) {
      // At type level (e.g., /onet/Occupation/...) - show domain tab + type tabs
      const types = await getDomainTypes(domain);
      const domainTab = {
        title: domain,
        url: `/${domain}`,
        rootFolder: await createDomainPageTree(domain),
      };
      const typeTabs = await Promise.all(
        types.slice(0, 12).map(async (t) => ({
          title: t,
          url: `/${t}`,
          rootFolder: await createTypePageTree(domain, t),
        }))
      );
      tabs = [homeTab, domainTab, ...typeTabs];
    } else {
      // At domain level (e.g., /onet) - show home tab + domain types as tabs
      const types = await getDomainTypes(domain);
      const typeTabs = await Promise.all(
        types.slice(0, 12).map(async (t) => ({
          title: t,
          url: `/${t}`,
          rootFolder: await createTypePageTree(domain, t),
        }))
      );
      tabs = [homeTab, ...typeTabs];
    }
  } catch (error) {
    console.error('Error building sidebar tabs:', error);
    tabs = [homeTab];
  }

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <DocsLayout
            {...baseOptions()}
            sidebar={{
              tabs,
              defaultOpenLevel: 1,
            }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
