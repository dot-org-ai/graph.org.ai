import { getPageImage, source, mdxSource } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // Check if this is a database-sourced page (has rawData property)
  const isDbPage = 'rawData' in page.data;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        {isDbPage ? (
          // Render database content as markdown/HTML
          <div
            dangerouslySetInnerHTML={{
              __html: formatDatabaseContent(page.data as any),
            }}
          />
        ) : (
          // Render MDX content
          (() => {
            const MDX = page.data.body;
            return (
              <MDX
                components={getMDXComponents({
                  // this allows you to link to other pages with relative file paths
                  a: createRelativeLink(mdxSource, page),
                })}
              />
            );
          })()
        )}
      </DocsBody>
    </DocsPage>
  );
}

/**
 * Format database content for display
 */
function formatDatabaseContent(data: any): string {
  let html = '';

  // Display properties
  if (data.rawData && typeof data.rawData === 'object') {
    html += '<h2>Properties</h2><dl>';
    for (const [key, value] of Object.entries(data.rawData)) {
      html += `<dt><strong>${key}</strong></dt>`;
      if (typeof value === 'string' || typeof value === 'number') {
        html += `<dd>${value}</dd>`;
      } else if (Array.isArray(value)) {
        html += `<dd>${value.join(', ')}</dd>`;
      } else if (typeof value === 'object') {
        html += `<dd><pre>${JSON.stringify(value, null, 2)}</pre></dd>`;
      }
    }
    html += '</dl>';
  }

  // Display markdown content if available
  if (data.body) {
    // Simple markdown-to-HTML conversion (for production, use a proper markdown parser)
    html += data.body
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }

  return html;
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug?: string[] }>;
  },
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
