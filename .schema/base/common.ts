import { z } from 'zod';

/**
 * Base schemas for common patterns across all entities
 */

// Core identifier pattern
export const IdSchema = z.string().min(1);

// Hierarchical ID pattern (e.g., "1.0", "1.1.1", "11-1011.00")
export const HierarchicalIdSchema = z.string().regex(/^[\d\-\.]+$/);

// Metadata fields common to all entities
export const MetadataSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  version: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});

// Generic relationship schema
export const RelationshipSchema = z.object({
  fromId: IdSchema,
  fromType: z.string(),
  toId: IdSchema,
  toType: z.string(),
  relationshipType: z.string(),
  strength: z.number().min(0).max(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Many-to-many join table pattern
export const JoinTableSchema = z.object({
  id: IdSchema,
  leftId: IdSchema,
  leftType: z.string(),
  rightId: IdSchema,
  rightType: z.string(),
  attributes: z.record(z.unknown()).optional(),
});

// Hierarchical node base schema
export const HierarchicalNodeSchema = z.object({
  id: HierarchicalIdSchema,
  parentId: HierarchicalIdSchema.optional(),
  level: z.number().int().positive(),
  path: z.array(HierarchicalIdSchema), // Full path from root to this node
  children: z.array(HierarchicalIdSchema).optional(),
});

// Rating/measurement schema (used in ONET)
export const RatingSchema = z.object({
  scaleId: z.string(),
  dataValue: z.number(),
  n: z.number().int().optional(), // Sample size
  standardError: z.number().optional(),
  lowerCIBound: z.number().optional(),
  upperCIBound: z.number().optional(),
  date: z.string().optional(),
  source: z.string().optional(),
});

// Category/classification schema
export const CategorySchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string().optional(),
  parentCategory: IdSchema.optional(),
  level: z.number().int().optional(),
});

// Reference/lookup table schema
export const ReferenceSchema = z.object({
  id: IdSchema,
  code: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type JoinTable = z.infer<typeof JoinTableSchema>;
export type HierarchicalNode = z.infer<typeof HierarchicalNodeSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
