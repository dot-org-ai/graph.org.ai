import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import things from './routes/things-ch';
import relationships from './routes/relationships-ch';
import search from './routes/search-ch';
import { query } from './db';

/**
 * Create and configure the API server (ClickHouse version)
 */
export function createApp() {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use('*', cors());

  // Health check with types and domains
  app.get('/', async (c) => {
    try {
      const origin = new URL(c.req.url).origin;

      // Get distinct namespaces (domains)
      const domains = await query('SELECT DISTINCT ns FROM things ORDER BY ns');

      // Get distinct types grouped by namespace
      const typesResult = await query(
        'SELECT ns, type FROM things GROUP BY ns, type ORDER BY ns, type'
      );

      // Build types object: { [type]: origin + "/" + ns + "/" + type }
      const types: Record<string, string> = {};
      for (const row of typesResult) {
        const key = `${row.ns}/${row.type}`;
        types[key] = `${origin}/${row.ns}/${row.type}`;
      }

      return c.json({
        name: '@mdxdb/api',
        version: '0.0.1',
        database: 'clickhouse',
        status: 'running',
        domains: domains.map((d: any) => d.ns),
        types,
        endpoints: {
          things: `${origin}/things`,
          relationships: `${origin}/relationships`,
          search: `${origin}/search`,
        },
      });
    } catch (error: any) {
      // If database query fails, return basic info
      const origin = new URL(c.req.url).origin;
      return c.json({
        name: '@mdxdb/api',
        version: '0.0.1',
        database: 'clickhouse',
        status: 'running',
        domains: [],
        types: {},
        endpoints: {
          things: `${origin}/things`,
          relationships: `${origin}/relationships`,
          search: `${origin}/search`,
        },
      });
    }
  });

  // Health endpoint
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount routes
  app.route('/things', things);
  app.route('/relationships', relationships);
  app.route('/search', search);

  // Type-specific routes: /:nsOrType/:id or /:ns/:type/:id
  app.get('/:first/:second/:third{.*}?', async (c) => {
    const first = c.req.param('first');
    const second = c.req.param('second');
    const third = c.req.param('third');

    if (third) {
      // Pattern: /:ns/:type/:id
      const url = `${first}/${second}/${third}`;
      return c.redirect(`/things/${encodeURIComponent(url)}`);
    } else if (second) {
      // Pattern: /:nsOrType/:id
      // Check if first is a namespace or type by querying
      const byNs = await query(
        'SELECT * FROM things WHERE ns = {ns:String} AND id = {id:String} LIMIT 1',
        { ns: first, id: second }
      );
      if (byNs.length > 0) {
        // It's a namespace/id pattern
        const url = `${first}/${byNs[0].type}/${second}`;
        return c.redirect(`/things/${encodeURIComponent(url)}`);
      }

      // Try as type/id pattern
      const byType = await query(
        'SELECT * FROM things WHERE type = {type:String} AND id = {id:String} LIMIT 1',
        { type: first, id: second }
      );
      if (byType.length > 0) {
        const url = `${byType[0].ns}/${first}/${second}`;
        return c.redirect(`/things/${encodeURIComponent(url)}`);
      }

      // If neither worked, assume it's ns/type listing
      return c.redirect(`/things?ns=${first}&type=${second}`);
    }
  });

  // 404 handler
  app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
  });

  // Error handler
  app.onError((err, c) => {
    console.error('Error:', err);
    return c.json(
      {
        error: err.message || 'Internal server error',
        stack: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ? err.stack : undefined,
      },
      500
    );
  });

  return app;
}

export default createApp();
