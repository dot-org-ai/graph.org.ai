import { Hono } from 'hono';
import { ThingSchema } from '../types';
import { buildUrl, normalizeUrl, parseQueryNumber } from '../utils';
import { query, queryOne, insert } from '../db';
import { render } from '@mdxui/api';

const things = new Hono();

/**
 * GET /things - List all things with optional filtering
 */
things.get('/', async (c) => {
  try {
    const origin = new URL(c.req.url).origin;
    const ns = c.req.query('ns');
    const type = c.req.query('type');
    const q = c.req.query('q');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);
    const format = (c.req.query('format') || 'json') as 'json' | 'markdown' | 'mdx';

    let sql = 'SELECT * FROM things WHERE 1=1';
    const params: Record<string, any> = {};

    if (ns) {
      sql += ' AND ns = {ns:String}';
      params.ns = ns;
    }
    if (type) {
      sql += ' AND type = {type:String}';
      params.type = type;
    }
    if (q) {
      sql += ' AND (content LIKE {q:String} OR id LIKE {q:String})';
      params.q = `%${q}%`;
    }

    sql += ' LIMIT {limit:UInt32} OFFSET {offset:UInt32}';
    params.limit = limit;
    params.offset = offset;

    const results = await query(sql, params);

    // Add HATEOAS links to each thing
    const withLinks = results.map((thing: any) => ({
      ...thing,
      _links: {
        self: `${origin}/things/${encodeURIComponent(thing.url)}`,
        type: `${origin}/${thing.ns}/${thing.type}`,
        namespace: `${origin}/search/namespace/${thing.ns}`,
      }
    }));

    // Convert content format if needed
    if (format === 'markdown') {
      const converted = await Promise.all(
        withLinks.map(async (thing: any) => {
          if (thing.content) {
            const rendered = await render(thing.content, 'markdown');
            return { ...thing, content: rendered.markdown };
          }
          return thing;
        })
      );
      return c.json({
        data: converted,
        count: converted.length,
        _links: {
          self: c.req.url,
          next: offset + limit < converted.length ? `${origin}/things?limit=${limit}&offset=${offset + limit}` : null,
          prev: offset > 0 ? `${origin}/things?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        }
      });
    }

    return c.json({
      data: withLinks,
      count: withLinks.length,
      _links: {
        self: c.req.url,
        next: offset + limit < withLinks.length ? `${origin}/things?limit=${limit}&offset=${offset + limit}` : null,
        prev: offset > 0 ? `${origin}/things?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /things/:url - Get a specific thing by URL
 */
things.get('/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const format = (c.req.query('format') || 'json') as 'json' | 'markdown' | 'mdx';
    const includeRelationships = c.req.query('relationships') !== 'false';

    const result = await queryOne(
      'SELECT * FROM things WHERE url = {url:String}',
      { url }
    );

    if (!result) {
      return c.json({ error: 'Thing not found' }, 404);
    }

    const origin = new URL(c.req.url).origin;

    // Build response object
    let response: any = { ...result };

    // Include relationships if requested
    if (includeRelationships) {
      // Get outgoing relationships
      const outgoing = await query(
        'SELECT * FROM relationships WHERE `from` = {url:String}',
        { url }
      );

      // Get incoming relationships
      const incoming = await query(
        'SELECT * FROM relationships WHERE `to` = {url:String}',
        { url }
      );

      // Convert to object format: { predicate: url } or { predicate: [urls] }
      const relationships: Record<string, string | string[]> = {};
      const references: Record<string, string | string[]> = {};

      // Group outgoing by predicate
      for (const rel of outgoing) {
        if (!relationships[rel.predicate]) {
          relationships[rel.predicate] = rel.to;
        } else if (Array.isArray(relationships[rel.predicate])) {
          (relationships[rel.predicate] as string[]).push(rel.to);
        } else {
          relationships[rel.predicate] = [relationships[rel.predicate] as string, rel.to];
        }
      }

      // Group incoming by predicate (or reverse predicate if available)
      for (const rel of incoming) {
        const key = rel.reverse || rel.predicate;
        if (!references[key]) {
          references[key] = rel.from;
        } else if (Array.isArray(references[key])) {
          (references[key] as string[]).push(rel.from);
        } else {
          references[key] = [references[key] as string, rel.from];
        }
      }

      response.relationships = relationships;
      response.references = references;
    }

    // Convert content format if needed
    if (response.content && format === 'markdown') {
      const rendered = await render(response.content, 'markdown');
      response.content = rendered.markdown;
    }

    // Add HATEOAS links
    response._links = {
      self: `${origin}/things/${encodeURIComponent(url)}`,
      type: `${origin}/${result.ns}/${result.type}`,
      namespace: `${origin}/search/namespace/${result.ns}`,
      collection: `${origin}/things?ns=${result.ns}&type=${result.type}`,
      relationships: `${origin}/relationships/from/${encodeURIComponent(url)}`,
      references: `${origin}/relationships/to/${encodeURIComponent(url)}`,
      graph: `${origin}/relationships/graph/${encodeURIComponent(url)}`,
    };

    return c.json(response);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /things - Create a new thing
 */
things.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validated = ThingSchema.parse(body);

    // Build URL if not provided, ensure it starts with https://
    const url = validated.url
      ? normalizeUrl(validated.url)
      : buildUrl(validated.ns, validated.type, validated.id);

    const newThing = {
      ns: validated.ns,
      type: validated.type,
      id: validated.id,
      url,
      data: validated.data ? JSON.stringify(validated.data) : '',
      code: validated.code || '',
      content: validated.content || '',
      meta: validated.meta ? JSON.stringify(validated.meta) : '',
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    await insert('things', [newThing]);

    const created = await queryOne(
      'SELECT * FROM things WHERE url = {url:String}',
      { url }
    );

    return c.json(created, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * PUT /things/:url - Update or create a thing
 */
things.put('/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const body = await c.req.json();
    const validated = ThingSchema.parse(body);

    const normalizedUrl = validated.url ? normalizeUrl(validated.url) : normalizeUrl(url);

    const existing = await queryOne(
      'SELECT * FROM things WHERE url = {url:String}',
      { url: normalizedUrl }
    );

    const thingData = {
      ns: validated.ns,
      type: validated.type,
      id: validated.id,
      url: normalizedUrl,
      data: validated.data ? JSON.stringify(validated.data) : '',
      code: validated.code || '',
      content: validated.content || '',
      meta: validated.meta ? JSON.stringify(validated.meta) : '',
      updated_at: Math.floor(Date.now() / 1000),
    };

    if (existing) {
      // ClickHouse doesn't support UPDATE, so we use ALTER TABLE UPDATE or delete+insert
      // For simplicity with ReplacingMergeTree, we just insert with updated timestamp
      await insert('things', [{ ...thingData, created_at: existing.created_at }]);
    } else {
      // Create new
      await insert('things', [{ ...thingData, created_at: Math.floor(Date.now() / 1000) }]);
    }

    const result = await queryOne(
      'SELECT * FROM things WHERE url = {url:String} ORDER BY updated_at DESC LIMIT 1',
      { url: normalizedUrl }
    );

    return c.json(result, existing ? 200 : 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * DELETE /things/:url - Delete a thing
 */
things.delete('/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');

    const existing = await queryOne(
      'SELECT * FROM things WHERE url = {url:String}',
      { url }
    );

    if (!existing) {
      return c.json({ error: 'Thing not found' }, 404);
    }

    // ClickHouse uses ALTER TABLE DELETE for mutations
    await query(
      'ALTER TABLE things DELETE WHERE url = {url:String}',
      { url }
    );

    return c.json({ success: true, deleted: url });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default things;
