import { RootProvider } from 'fumadocs-ui/provider/next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import './global.css';
import { Inter } from 'next/font/google';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { headers } from 'next/headers';

const inter = Inter({
  subsets: ['latin'],
});

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Get current path from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Parse slug from pathname
  const slug = pathname === '/' ? [] : pathname.split('/').filter(Boolean);

  // Get context-aware page tree based on current route
  const pageTree = await source.getContextPageTree(slug);

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <DocsLayout
            {...baseOptions()}
            tree={pageTree}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
