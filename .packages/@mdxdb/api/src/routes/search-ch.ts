import { Hono } from 'hono';
import { parseQueryNumber } from '../utils';
import { query } from '../db';

const search = new Hono();

/**
 * GET /search - Full-text search across things
 */
search.get('/', async (c) => {
  try {
    const q = c.req.query('q');
    const ns = c.req.query('ns');
    const type = c.req.query('type');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);

    if (!q) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    let sql = `SELECT * FROM things WHERE (content LIKE {q:String} OR id LIKE {q:String} OR code LIKE {q:String})`;
    const params: Record<string, any> = { q: `%${q}%`, limit, offset };

    if (ns) {
      sql += ' AND ns = {ns:String}';
      params.ns = ns;
    }
    if (type) {
      sql += ' AND type = {type:String}';
      params.type = type;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';

    const results = await query(sql, params);

    const origin = new URL(c.req.url).origin;

    // Add HATEOAS links to each result
    const withLinks = results.map((thing: any) => ({
      ...thing,
      _links: {
        self: `${origin}/things/${encodeURIComponent(thing.url)}`,
        type: `${origin}/${thing.ns}/${thing.type}`,
      }
    }));

    return c.json({
      query: q,
      data: withLinks,
      count: withLinks.length,
      limit,
      offset,
      _links: {
        self: c.req.url,
        next: offset + limit < withLinks.length ? `${origin}/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset + limit}` : null,
        prev: offset > 0 ? `${origin}/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /search - Advanced search with body parameters
 */
search.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const {
      q,
      ns,
      type,
      filters = {},
      limit = 50,
      offset = 0,
    } = body;

    let sql = 'SELECT * FROM things WHERE 1=1';
    const params: Record<string, any> = { limit, offset };

    // Text search
    if (q) {
      sql += ' AND (content LIKE {q:String} OR id LIKE {q:String} OR code LIKE {q:String})';
      params.q = `%${q}%`;
    }

    // Basic filters
    if (ns) {
      sql += ' AND ns = {ns:String}';
      params.ns = ns;
    }
    if (type) {
      sql += ' AND type = {type:String}';
      params.type = type;
    }

    // Additional filters
    if (filters.url) {
      sql += ' AND url = {url:String}';
      params.url = filters.url;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';

    const results = await query(sql, params);

    return c.json({
      query: q,
      filters: { ns, type, ...filters },
      data: results,
      count: results.length,
      limit,
      offset,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /search/namespace/:ns - Search within a specific namespace
 */
search.get('/namespace/:ns', async (c) => {
  try {
    const ns = c.req.param('ns');
    const q = c.req.query('q');
    const type = c.req.query('type');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);

    let sql = 'SELECT * FROM things WHERE ns = {ns:String}';
    const params: Record<string, any> = { ns, limit, offset };

    if (q) {
      sql += ' AND (content LIKE {q:String} OR id LIKE {q:String})';
      params.q = `%${q}%`;
    }

    if (type) {
      sql += ' AND type = {type:String}';
      params.type = type;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';

    const results = await query(sql, params);

    return c.json({
      namespace: ns,
      query: q,
      data: results,
      count: results.length,
      limit,
      offset,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /search/type/:ns/:type - Search within a specific type
 */
search.get('/type/:ns/:type', async (c) => {
  try {
    const ns = c.req.param('ns');
    const type = c.req.param('type');
    const q = c.req.query('q');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);

    let sql = 'SELECT * FROM things WHERE ns = {ns:String} AND type = {type:String}';
    const params: Record<string, any> = { ns, type, limit, offset };

    if (q) {
      sql += ' AND (content LIKE {q:String} OR id LIKE {q:String})';
      params.q = `%${q}%`;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';

    const results = await query(sql, params);

    return c.json({
      namespace: ns,
      type,
      query: q,
      data: results,
      count: results.length,
      limit,
      offset,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /search/stats - Get search statistics and aggregations
 */
search.get('/stats', async (c) => {
  try {
    // Count by namespace
    const byNamespace = await query(
      'SELECT ns, count() as count FROM things GROUP BY ns ORDER BY count DESC'
    );

    // Count by type
    const byType = await query(
      'SELECT ns, type, count() as count FROM things GROUP BY ns, type ORDER BY count DESC'
    );

    // Total count
    const totalResult = await query('SELECT count() as count FROM things');
    const total = totalResult[0]?.count || 0;

    return c.json({
      total,
      byNamespace,
      byType,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default search;
