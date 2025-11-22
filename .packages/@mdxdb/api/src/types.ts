import { z } from 'zod';

/**
 * Content format for input/output
 */
export type ContentFormat = 'json' | 'markdown' | 'mdx';

/**
 * Thing schema for validation
 */
export const ThingSchema = z.object({
  ns: z.string(),
  type: z.string(),
  id: z.string(),
  url: z.string().optional(),
  data: z.any().optional(),
  code: z.string().optional(),
  content: z.string().optional(),
  meta: z.any().optional(),
});

export type ThingInput = z.infer<typeof ThingSchema>;

/**
 * Relationship schema for validation
 */
export const RelationshipSchema = z.object({
  from: z.string(),
  predicate: z.string(),
  reverse: z.string().optional(),
  to: z.string(),
  data: z.any().optional(),
  content: z.string().optional(),
});

export type RelationshipInput = z.infer<typeof RelationshipSchema>;

/**
 * Search/Filter parameters
 */
export const SearchParamsSchema = z.object({
  ns: z.string().optional(),
  type: z.string().optional(),
  q: z.string().optional(), // Full-text search query
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
  format: z.enum(['json', 'markdown', 'mdx']).optional().default('json'),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * Relationship query parameters
 */
export const RelationshipQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  predicate: z.string().optional(),
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

export type RelationshipQuery = z.infer<typeof RelationshipQuerySchema>;
