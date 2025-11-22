import { Hono } from 'hono';
import { eq, and, like, sql } from 'drizzle-orm';
import { db, schema } from '@graph.org.ai/mdxdb/db';
import { parseQueryNumber } from '../utils';

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

    const conditions = [];

    // Search in content, id, and JSON fields
    conditions.push(
      sql`(
        ${schema.things.content} LIKE ${'%' + q + '%'} OR
        ${schema.things.id} LIKE ${'%' + q + '%'} OR
        ${schema.things.code} LIKE ${'%' + q + '%'}
      )`
    );

    if (ns) conditions.push(eq(schema.things.ns, ns));
    if (type) conditions.push(eq(schema.things.type, type));

    const results = await db
      .select()
      .from(schema.things)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .all();

    return c.json({
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

    const conditions = [];

    // Text search
    if (q) {
      conditions.push(
        sql`(
          ${schema.things.content} LIKE ${'%' + q + '%'} OR
          ${schema.things.id} LIKE ${'%' + q + '%'} OR
          ${schema.things.code} LIKE ${'%' + q + '%'}
        )`
      );
    }

    // Basic filters
    if (ns) conditions.push(eq(schema.things.ns, ns));
    if (type) conditions.push(eq(schema.things.type, type));

    // Additional filters on data fields
    // This is a simplified implementation - would need enhancement for complex queries
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'url') {
        conditions.push(eq(schema.things.url, value as string));
      }
    }

    let query = db.select().from(schema.things);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.limit(limit).offset(offset).all();

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

    const conditions = [eq(schema.things.ns, ns)];

    if (q) {
      conditions.push(
        sql`(${schema.things.content} LIKE ${'%' + q + '%'} OR ${schema.things.id} LIKE ${'%' + q + '%'})`
      );
    }

    if (type) {
      conditions.push(eq(schema.things.type, type));
    }

    const results = await db
      .select()
      .from(schema.things)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .all();

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

    const conditions = [
      eq(schema.things.ns, ns),
      eq(schema.things.type, type),
    ];

    if (q) {
      conditions.push(
        sql`(${schema.things.content} LIKE ${'%' + q + '%'} OR ${schema.things.id} LIKE ${'%' + q + '%'})`
      );
    }

    const results = await db
      .select()
      .from(schema.things)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .all();

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
    const byNamespace = await db
      .select({
        ns: schema.things.ns,
        count: sql<number>`count(*)`,
      })
      .from(schema.things)
      .groupBy(schema.things.ns)
      .all();

    // Count by type
    const byType = await db
      .select({
        ns: schema.things.ns,
        type: schema.things.type,
        count: sql<number>`count(*)`,
      })
      .from(schema.things)
      .groupBy(schema.things.ns, schema.things.type)
      .all();

    // Total count
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.things)
      .get();

    return c.json({
      total: total?.count || 0,
      byNamespace,
      byType,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default search;
