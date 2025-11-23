import { source, getAllTypes, getTypeCount, getSampleThingsByType, getPaginatedThingsByType, getDomainTypes, getDomains } from '@/lib/source';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { pluralize } from '@/lib/pluralize';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<{
    after?: string;
    before?: string;
  }>;
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;

  // Homepage
  if (!params.slug || params.slug.length === 0) {
    return {
      title: 'graph.org.ai - Knowledge Graph of Things',
      description: 'A comprehensive knowledge graph featuring Industries, Occupations, Tasks, Verbs, and more',
    };
  }

  // Single-slug route (could be domain or type)
  if (params.slug.length === 1) {
    const slug = params.slug[0];
    let domains: string[] = [];
    let allTypes: string[] = [];
    try {
      domains = await getDomains();
      allTypes = await getAllTypes();
    } catch (error) {
      console.error('Error loading domains/types:', error);
    }

    if (domains.includes(slug)) {
      return {
        title: `${slug} - graph.org.ai`,
        description: `Browse all types and entities in the ${slug} domain`,
      };
    } else if (allTypes.includes(slug)) {
      return {
        title: `${slug}s - graph.org.ai`,
        description: `Browse all ${slug}s in the knowledge graph`,
      };
    }
  }

  const page = await source.getPage(params.slug);

  if (!page) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Check if this is a single-slug route (could be domain or type)
  if (params.slug && params.slug.length === 1) {
    const slug = params.slug[0];

    // Check if it's a domain or a type
    let domains: string[] = [];
    let allTypes: string[] = [];
    try {
      domains = await getDomains();
      allTypes = await getAllTypes();
    } catch (error) {
      console.error('Error loading domains/types:', error);
    }

    if (domains.includes(slug)) {
      // This is a domain page - show types in this domain
      const domain = slug;
      // This is a domain page - show types in this domain
      let domainTypes: string[] = [];
      try {
        domainTypes = await getDomainTypes(domain);
      } catch (error) {
        console.error(`Error loading types for domain ${domain}:`, error);
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{domain}</h1>
            <p className="text-muted-foreground mb-8">
              Browse all types in the {domain} domain
            </p>

            {domainTypes.length > 0 ? (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Types in {domain}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {await Promise.all(domainTypes.map(async (type) => {
                    let count = 0;
                    let samples: any[] = [];

                    try {
                      count = await getTypeCount(type);
                      samples = await getSampleThingsByType(type, 3);
                    } catch (error) {
                      console.error(`Error loading data for ${type}:`, error);
                    }

                    return (
                      <div key={type} className="p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all group">
                        <Link href={`/${type}`} className="block">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{type}</h3>
                          <div className="text-sm text-muted-foreground space-y-2">
                            <p className="font-medium">{count.toLocaleString()} items</p>
                          </div>
                        </Link>
                        {samples.length > 0 && (
                          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                            <p className="text-xs font-semibold uppercase tracking-wide">Examples:</p>
                            {samples.map((thing) => (
                              <Link
                                key={thing.url}
                                href={`/${thing.url}`}
                                className="block text-sm hover:text-primary transition-colors truncate"
                              >
                                {thing.name || thing.data?.title || thing.id}
                              </Link>
                            ))}
                            <Link
                              href={`/${type}`}
                              className="block text-xs text-primary hover:underline mt-2 pt-2 border-t"
                            >
                              View all {pluralize(type)} →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  }))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No types found in this domain</p>
              </div>
            )}
          </div>
        </div>
      );
    } else if (allTypes.includes(slug)) {
      // This is a type page - show paginated items of this type
      const type = slug;
      const count = await getTypeCount(type);
      const PAGE_SIZE = 50;

      // Get paginated data
      const { things, hasMore, hasPrev } = await getPaginatedThingsByType(
        type,
        PAGE_SIZE,
        searchParams.after,
        searchParams.before
      );

      // Group by domain
      const byDomain = things.reduce((acc, thing) => {
        if (!acc[thing.ns]) {
          acc[thing.ns] = [];
        }
        acc[thing.ns].push(thing);
        return acc;
      }, {} as Record<string, typeof things>);

      // Calculate cursors for pagination
      const firstId = things.length > 0 ? things[0].id : undefined;
      const lastId = things.length > 0 ? things[things.length - 1].id : undefined;

      // Determine primary namespace (if all items are from the same namespace)
      const namespaces = Object.keys(byDomain);
      const primaryNamespace = namespaces.length === 1 ? namespaces[0] : null;

      return (
        <DocsPage toc={[]}>
          <DocsBody>
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">.org.ai</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {primaryNamespace && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`/${primaryNamespace}`}>
                        {primaryNamespace}.org.ai
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{pluralize(type)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1>{pluralize(type)}</h1>

            {Object.keys(byDomain).length > 0 ? (
              <>
                <div className="space-y-8 mb-8">
                  {Object.entries(byDomain).map(([domain, things]) => (
                    <div key={domain}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {things.map((thing) => (
                          <Link
                            key={thing.url}
                            href={`/${thing.url}`}
                            className="block p-3 border rounded hover:border-primary hover:bg-accent transition-colors no-underline"
                          >
                            <div className="font-medium">{thing.name || thing.data?.title || thing.id}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination controls */}
                {(hasPrev || hasMore) && (
                  <div className="flex justify-between items-center border-t pt-6">
                    <div>
                      {hasPrev && firstId && (
                        <Link
                          href={`/${type}?before=${encodeURIComponent(firstId)}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded hover:bg-accent transition-colors"
                        >
                          ← Previous {PAGE_SIZE}
                        </Link>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Page {things.length} items
                    </div>
                    <div>
                      {hasMore && lastId && (
                        <Link
                          href={`/${type}?after=${encodeURIComponent(lastId)}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded hover:bg-accent transition-colors"
                        >
                          Next {PAGE_SIZE} →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No {pluralize(type).toLowerCase()} found</p>
              </div>
            )}
          </DocsBody>
        </DocsPage>
      );
    }
  }

  // Homepage - show type cards
  if (!params.slug || params.slug.length === 0) {
    let types: string[] = [];
    try {
      types = await getAllTypes();
    } catch (error) {
      console.error('Error loading types:', error);
    }

    const priorityTypes = [
      'Industry',
      'Occupation',
      'Task',
      'Verb',
      'Noun',
      'Skill',
      'Technology',
      'Product',
      'Service',
    ];

    const sortedTypes = [
      ...types.filter(t => priorityTypes.includes(t)).sort((a, b) => {
        return priorityTypes.indexOf(a) - priorityTypes.indexOf(b);
      }),
      ...types.filter(t => !priorityTypes.includes(t)).sort(),
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">graph.org.ai</h1>
          <p className="text-muted-foreground mb-8">
            A comprehensive knowledge graph featuring Industries, Occupations, Tasks, Verbs, and more
          </p>

          {sortedTypes.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Explore by Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {await Promise.all(sortedTypes.map(async (type) => {
                  let count = 0;
                  let samples: any[] = [];

                  try {
                    count = await getTypeCount(type);
                    samples = await getSampleThingsByType(type, 3);
                  } catch (error) {
                    console.error(`Error loading data for ${type}:`, error);
                  }

                  return (
                    <div key={type} className="p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all group">
                      <Link href={`/${type}`} className="block no-underline">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{type}</h3>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p className="font-medium">{count.toLocaleString()} items</p>
                        </div>
                      </Link>
                    </div>
                  );
                }))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No things available</p>
              <p className="text-sm mt-2">ClickHouse database is connected but contains no data yet.</p>
              <p className="text-sm mt-1">Run the data ingestion script to populate the database.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Domain/thing pages
  const page = await source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  // Build breadcrumb trail from slug
  const breadcrumbItems = [];
  breadcrumbItems.push({ label: '.org.ai', href: '/' });

  if (params.slug && params.slug.length > 0) {
    let currentPath = '';
    for (let i = 0; i < params.slug.length; i++) {
      const segment = params.slug[i];
      currentPath += `/${segment}`;

      // For the last item, use the page title if available
      const isLast = i === params.slug.length - 1;
      const label = isLast && page.data.title ? page.data.title : segment;

      breadcrumbItems.push({
        label,
        href: currentPath,
        isLast,
      });
    }
  }

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
    >
      <DocsBody>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {breadcrumbItems.flatMap((item, index) => {
              const elements = [];
              elements.push(
                <BreadcrumbItem key={`item-${index}`}>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              );
              if (index < breadcrumbItems.length - 1) {
                elements.push(<BreadcrumbSeparator key={`sep-${index}`} />);
              }
              return elements;
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <h1>{page.data.title}</h1>
        {page.data.description && (
          <p className="text-muted-foreground text-lg mb-6">
            {page.data.description}
          </p>
        )}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.data.body }}
        />
      </DocsBody>
    </DocsPage>
  );
}
