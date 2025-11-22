import { Hono } from 'hono';
import { eq, and, or } from 'drizzle-orm';
import { db, schema } from '@graph.org.ai/mdxdb/db';
import { RelationshipSchema, RelationshipQuerySchema } from '../types';
import { parseQueryNumber } from '../utils';

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

    let query = db.select().from(schema.relationships);
    const conditions = [];

    if (from) conditions.push(eq(schema.relationships.from, from));
    if (to) conditions.push(eq(schema.relationships.to, to));
    if (predicate) conditions.push(eq(schema.relationships.predicate, predicate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.limit(limit).offset(offset).all();

    return c.json({ data: results, count: results.length });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /relationships/:id - Get a specific relationship
 */
relationships.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    const result = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.id, id))
      .get();

    if (!result) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /relationships/from/:url - Get all relationships from a thing
 */
relationships.get('/from/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const predicate = c.req.query('predicate');
    const limit = parseQueryNumber(c.req.query('limit'), 50);
    const offset = parseQueryNumber(c.req.query('offset'), 0);

    const conditions = [eq(schema.relationships.from, url)];

    if (predicate) {
      conditions.push(eq(schema.relationships.predicate, predicate));
    }

    const query = db
      .select()
      .from(schema.relationships)
      .where(and(...conditions));

    const results = await query.limit(limit).offset(offset).all();

    return c.json({ data: results, count: results.length });
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

    const conditions = [eq(schema.relationships.to, url)];

    if (predicate) {
      conditions.push(eq(schema.relationships.predicate, predicate));
    }

    const query = db
      .select()
      .from(schema.relationships)
      .where(and(...conditions));

    const results = await query.limit(limit).offset(offset).all();

    return c.json({ data: results, count: results.length });
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
      reverse: validated.reverse,
      to: validated.to,
      data: validated.data,
      content: validated.content,
      createdAt: new Date(),
    };

    const result = await db
      .insert(schema.relationships)
      .values(newRelationship)
      .returning()
      .get();

    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * PUT /relationships/:id - Update a relationship
 */
relationships.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const validated = RelationshipSchema.parse(body);

    const existing = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    const updated = await db
      .update(schema.relationships)
      .set({
        from: validated.from,
        predicate: validated.predicate,
        reverse: validated.reverse,
        to: validated.to,
        data: validated.data,
        content: validated.content,
      })
      .where(eq(schema.relationships.id, id))
      .returning()
      .get();

    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * PATCH /relationships/:id - Partially update a relationship
 */
relationships.patch('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    const updated = await db
      .update(schema.relationships)
      .set(body)
      .where(eq(schema.relationships.id, id))
      .returning()
      .get();

    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * DELETE /relationships/:id - Delete a relationship
 */
relationships.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    const existing = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    await db.delete(schema.relationships).where(eq(schema.relationships.id, id)).run();

    return c.json({ success: true, deleted: id });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /relationships/graph/:url - Get full relationship graph for a thing
 * Returns both incoming and outgoing relationships
 */
relationships.get('/graph/:url{.*}', async (c) => {
  try {
    const url = c.req.param('url');
    const depth = parseQueryNumber(c.req.query('depth'), 1);
    const limit = parseQueryNumber(c.req.query('limit'), 100);

    // Get outgoing relationships
    const outgoing = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.from, url))
      .limit(limit)
      .all();

    // Get incoming relationships
    const incoming = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.to, url))
      .limit(limit)
      .all();

    const graph = {
      url,
      outgoing,
      incoming,
      depth,
    };

    return c.json(graph);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default relationships;
