import { Hono } from 'hono';
import { eq, and, like, sql } from 'drizzle-orm';
import { db, schema } from '@graph.org.ai/mdxdb/db';
import { ThingSchema, SearchParamsSchema } from '../types';
import { buildUrl, normalizeUrl, convertContent, parseQueryNumber } from '../utils';
import { render } from '@mdxui/api';

const things = new Hono();

/**
 * GET /things - List all things with optional filtering
 */
things.get('/', async (c) => {
  try {
    const ns = c.req.query('ns');
    const type = c.req.query('type');
    const q = c.req.query('q');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);
    const format = (c.req.query('format') || 'json') as 'json' | 'markdown' | 'mdx';

    let query = db.select().from(schema.things);
    const conditions = [];

    if (ns) conditions.push(eq(schema.things.ns, ns));
    if (type) conditions.push(eq(schema.things.type, type));
    if (q) {
      // Simple text search across content fields
      conditions.push(
        sql`(${schema.things.content} LIKE ${'%' + q + '%'} OR ${schema.things.id} LIKE ${'%' + q + '%'})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.limit(limit).offset(offset).all();

    // Convert content format if needed
    if (format === 'markdown' || format === 'mdx') {
      const converted = await Promise.all(
        results.map(async (thing) => {
          if (thing.content && format === 'markdown') {
            const rendered = await render(thing.content, 'markdown');
            return { ...thing, content: rendered.markdown };
          }
          return thing;
        })
      );
      return c.json({ data: converted, count: converted.length });
    }

    return c.json({ data: results, count: results.length });
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

    const result = await db
      .select()
      .from(schema.things)
      .where(eq(schema.things.url, url))
      .get();

    if (!result) {
      return c.json({ error: 'Thing not found' }, 404);
    }

    // Build response object
    let response: any = { ...result };

    // Include relationships if requested
    if (includeRelationships) {
      // Get outgoing relationships
      const outgoing = await db
        .select()
        .from(schema.relationships)
        .where(eq(schema.relationships.from, url))
        .all();

      // Get incoming relationships
      const incoming = await db
        .select()
        .from(schema.relationships)
        .where(eq(schema.relationships.to, url))
        .all();

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

    // Handle content format conversion
    let content = validated.content;
    const inputFormat = (c.req.query('format') || 'mdx') as 'json' | 'markdown' | 'mdx';

    // If content is provided in markdown/json, convert to MDX for storage
    if (content && inputFormat === 'markdown') {
      // Store as-is for now, could convert to MDX if needed
      content = content;
    } else if (content && inputFormat === 'json') {
      // Convert JSON to MDX representation (simplified)
      content = JSON.stringify(validated.data);
    }

    const newThing = {
      ns: validated.ns,
      type: validated.type,
      id: validated.id,
      url,
      data: validated.data,
      code: validated.code,
      content,
      meta: validated.meta,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(schema.things).values(newThing).run();

    const created = await db
      .select()
      .from(schema.things)
      .where(eq(schema.things.url, url))
      .get();

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

    const existing = await db
      .select()
      .from(schema.things)
      .where(eq(schema.things.url, url))
      .get();

    const thingData = {
      ns: validated.ns,
      type: validated.type,
      id: validated.id,
      url: validated.url ? normalizeUrl(validated.url) : normalizeUrl(url),
      data: validated.data,
      code: validated.code,
      content: validated.content,
      meta: validated.meta,
      updatedAt: new Date(),
    };

    if (existing) {
      // Update existing
      await db
        .update(schema.things)
        .set(thingData)
        .where(eq(schema.things.url, url))
        .run();

      const updated = await db
        .select()
        .from(schema.things)
        .where(eq(schema.things.url, url))
        .get();

      return c.json(updated);
    } else {
      // Create new
      await db.insert(schema.things).values({
        ...thingData,
        createdAt: new Date(),
      }).run();

      const created = await db
        .select()
        .from(schema.things)
        .where(eq(schema.things.url, url))
        .get();

      return c.json(created, 201);
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * PATCH /things/:url - Partially update a thing
 */
things.patch('/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(schema.things)
      .where(eq(schema.things.url, url))
      .get();

    if (!existing) {
      return c.json({ error: 'Thing not found' }, 404);
    }

    await db
      .update(schema.things)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(schema.things.url, url))
      .run();

    const updated = await db
      .select()
      .from(schema.things)
      .where(eq(schema.things.url, url))
      .get();

    return c.json(updated);
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

    const existing = await db
      .select()
      .from(schema.things)
      .where(eq(schema.things.url, url))
      .get();

    if (!existing) {
      return c.json({ error: 'Thing not found' }, 404);
    }

    await db.delete(schema.things).where(eq(schema.things.url, url)).run();

    return c.json({ success: true, deleted: url });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default things;
