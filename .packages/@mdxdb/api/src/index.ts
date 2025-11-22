import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import things from './routes/things-ch';
import relationships from './routes/relationships-ch';
import search from './routes/search-ch';

/**
 * Create and configure the API server
 */
export function createApp() {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use('*', cors());

  // Health check
  app.get('/', (c) => {
    return c.json({
      name: '@mdxdb/api',
      version: '0.0.1',
      status: 'running',
      endpoints: {
        things: '/things',
        relationships: '/relationships',
        search: '/search',
      },
    });
  });

  // Health endpoint
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount routes
  app.route('/things', things);
  app.route('/relationships', relationships);
  app.route('/search', search);

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
