import { Hono } from 'hono';
import { RelationshipSchema } from '../types';
import { parseQueryNumber } from '../utils';
import { query, queryOne, insert } from '../db';

const relationships = new Hono();

/**
 * GET /relationships - List relationships with optional filtering
 */
relationships.get('/', async (c) => {
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    const predicate = c.req.query('predicate');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);
    const origin = new URL(c.req.url).origin;

    let sql = 'SELECT * FROM relationships WHERE 1=1';
    const params: Record<string, any> = {};

    if (from) {
      sql += ' AND `from` = {from:String}';
      params.from = from;
    }
    if (to) {
      sql += ' AND `to` = {to:String}';
      params.to = to;
    }
    if (predicate) {
      sql += ' AND predicate = {predicate:String}';
      params.predicate = predicate;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';
    params.limit = limit;
    params.offset = offset;

    const results = await query(sql, params);

    // Add HATEOAS links to each relationship
    const withLinks = results.map((rel: any) => ({
      ...rel,
      _links: {
        from: `${origin}/things/${encodeURIComponent(rel.from)}`,
        to: `${origin}/things/${encodeURIComponent(rel.to)}`,
      }
    }));

    return c.json({
      data: withLinks,
      count: withLinks.length,
      _links: {
        self: c.req.url,
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// NOTE: Individual relationship endpoints disabled since relationships have no ID field
// Use query parameters on /relationships endpoint instead:
// GET /relationships?from=url&predicate=pred&to=url

/**
 * GET /relationships/from/:url - Get all relationships from a thing
 */
relationships.get('/from/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const predicate = c.req.query('predicate');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);
    const origin = new URL(c.req.url).origin;

    let sql = 'SELECT * FROM relationships WHERE `from` = {url:String}';
    const params: Record<string, any> = { url, limit, offset };

    if (predicate) {
      sql += ' AND predicate = {predicate:String}';
      params.predicate = predicate;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';

    const results = await query(sql, params);

    const withLinks = results.map((rel: any) => ({
      ...rel,
      _links: {
        from: `${origin}/things/${encodeURIComponent(rel.from)}`,
        to: `${origin}/things/${encodeURIComponent(rel.to)}`,
      }
    }));

    return c.json({
      data: withLinks,
      count: withLinks.length,
      _links: {
        self: c.req.url,
        thing: `${origin}/things/${encodeURIComponent(url)}`,
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /relationships/to/:url - Get all relationships to a thing
 */
relationships.get('/to/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const predicate = c.req.query('predicate');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);
    const origin = new URL(c.req.url).origin;

    let sql = 'SELECT * FROM relationships WHERE `to` = {url:String}';
    const params: Record<string, any> = { url, limit, offset };

    if (predicate) {
      sql += ' AND predicate = {predicate:String}';
      params.predicate = predicate;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';

    const results = await query(sql, params);

    const withLinks = results.map((rel: any) => ({
      ...rel,
      _links: {
        from: `${origin}/things/${encodeURIComponent(rel.from)}`,
        to: `${origin}/things/${encodeURIComponent(rel.to)}`,
      }
    }));

    return c.json({
      data: withLinks,
      count: withLinks.length,
      _links: {
        self: c.req.url,
        thing: `${origin}/things/${encodeURIComponent(url)}`,
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /relationships - Create a new relationship
 */
relationships.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validated = RelationshipSchema.parse(body);

    const newRelationship = {
      from: validated.from,
      predicate: validated.predicate,
      reverse: validated.reverse || '',
      to: validated.to,
      data: validated.data ? JSON.stringify(validated.data) : '',
      content: validated.content || '',
      created_at: Math.floor(Date.now() / 1000),
    };

    await insert('relationships', [newRelationship]);

    // ClickHouse doesn't have RETURNING, so we query back
    const result = await queryOne(
      `SELECT * FROM relationships
       WHERE \`from\` = {from:String}
       AND predicate = {predicate:String}
       AND \`to\` = {to:String}
       ORDER BY created_at DESC LIMIT 1`,
      { from: validated.from, predicate: validated.predicate, to: validated.to }
    );

    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// NOTE: Individual relationship delete disabled since relationships have no ID field
// Use DELETE /relationships with query params instead:
// DELETE /relationships?from=url&predicate=pred&to=url

/**
 * GET /relationships/graph/:url - Get full relationship graph for a thing
 */
relationships.get('/graph/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const limit = parseQueryNumber(c.req.query('limit'), 100);
    const origin = new URL(c.req.url).origin;

    // Get outgoing relationships
    const outgoing = await query(
      'SELECT * FROM relationships WHERE `from` = {url:String} LIMIT {limit:UInt32}',
      { url, limit }
    );

    // Get incoming relationships
    const incoming = await query(
      'SELECT * FROM relationships WHERE `to` = {url:String} LIMIT {limit:UInt32}',
      { url, limit }
    );

    // Add links to each relationship
    const outgoingWithLinks = outgoing.map((rel: any) => ({
      ...rel,
      _links: {
        to: `${origin}/things/${encodeURIComponent(rel.to)}`,
      }
    }));

    const incomingWithLinks = incoming.map((rel: any) => ({
      ...rel,
      _links: {
        from: `${origin}/things/${encodeURIComponent(rel.from)}`,
      }
    }));

    const graph = {
      url,
      outgoing: outgoingWithLinks,
      incoming: incomingWithLinks,
      depth: 1,
      _links: {
        self: c.req.url,
        thing: `${origin}/things/${encodeURIComponent(url)}`,
      }
    };

    return c.json(graph);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default relationships;
