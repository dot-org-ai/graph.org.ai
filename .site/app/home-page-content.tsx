import Link from 'next/link';
import { getAllTypes, getTypeCount, getSampleThingsByType } from '@/lib/source';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || 'graph.org.ai';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const canonicalUrl = `${protocol}://${host}`;

  return {
    title: 'graph.org.ai - Knowledge Graph of Things',
    description: 'A comprehensive knowledge graph featuring Industries, Occupations, Tasks, Verbs, and more',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function HomePage() {
  let types: string[] = [];

  try {
    types = await getAllTypes();
  } catch (error) {
    console.error('Error loading types:', error);
  }

  // Priority types to feature (Industries, Nouns, Verbs, Occupations, Tasks, etc.)
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

  // Sort types with priority types first, then alphabetically
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

                const firstSample = samples.length > 0 ? samples[0] : null;
                const domain = firstSample ? firstSample.ns : 'schema';

                return (
                  <div key={type} className="p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all group">
                    <Link href={`/types/${type}`} className="block">
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
                            {thing.id}
                          </Link>
                        ))}
                        <Link
                          href={`/types/${type}`}
                          className="block text-xs text-primary hover:underline mt-2 pt-2 border-t"
                        >
                          View all {type}s →
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
            <p>No things available</p>
            <p className="text-sm mt-2">ClickHouse database is connected but contains no data yet.</p>
            <p className="text-sm mt-1">Run the data ingestion script to populate the database.</p>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-8">
          <Link href="/docs" className="font-medium underline hover:text-foreground">
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
