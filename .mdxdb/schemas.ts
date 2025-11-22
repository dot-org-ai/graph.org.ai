/**
 * Zod schemas for normalized things.db validation
 *
 * Each ontology has its own schema defining the expected structure
 * for the 'data' field in the things table.
 */

import { z } from 'zod'

// ============================================================================
// Schema.org Schemas
// ============================================================================

export const SchemaOrgTypeSchema = z.object({
  label: z.string(),
  comment: z.string(),
  layer: z.string().optional(),
})

export const SchemaOrgPropertySchema = z.object({
  label: z.string(),
  comment: z.string(),
  rangeIncludes: z.string().optional(),
})

// ============================================================================
// O*NET (Occupations) Schemas
// ============================================================================

export const OccupationSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export const SkillSchema = z.object({
  name: z.string(),
})

export const KnowledgeSchema = z.object({
  name: z.string(),
})

// ============================================================================
// UNSPSC (Products) Schemas
// ============================================================================

export const ProductSegmentSchema = z.object({
  title: z.string(),
})

export const ProductFamilySchema = z.object({
  title: z.string(),
})

export const ProductClassSchema = z.object({
  title: z.string(),
})

export const ProductCommoditySchema = z.object({
  title: z.string(),
  definition: z.string().optional(),
})

// ============================================================================
// APQC (Processes) Schemas
// ============================================================================

export const ProcessSchema = z.object({
  hierarchyId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  level: z.string(),
  category: z.string().optional(),
})

// ============================================================================
// Models Schemas
// ============================================================================

export const ModelSchema = z.object({
  name: z.string(),
  created: z.union([z.string(), z.number()]).optional(),
  description: z.string().optional(),
  contextLength: z.union([z.string(), z.number()]).optional(),
  pricing: z.object({
    prompt: z.union([z.string(), z.number()]).optional(),
    completion: z.union([z.string(), z.number()]).optional(),
  }).optional(),
})

// ============================================================================
// Schema Registry
// ============================================================================

export const schemaRegistry = {
  'schema.org': {
    'Type': SchemaOrgTypeSchema,
    'Property': SchemaOrgPropertySchema,
  },
  'onet': {
    'Occupation': OccupationSchema,
    'Skill': SkillSchema,
    'Knowledge': KnowledgeSchema,
  },
  'unspsc': {
    'Segment': ProductSegmentSchema,
    'Family': ProductFamilySchema,
    'Class': ProductClassSchema,
    'Commodity': ProductCommoditySchema,
  },
  'apqc': {
    'Process': ProcessSchema,
  },
  'model': {
    'LLM': ModelSchema,
  },
} as const

/**
 * Get the appropriate schema for a thing based on its namespace and type
 */
export function getSchemaForThing(ns: string, type: string): z.ZodSchema | null {
  const nsSchemas = schemaRegistry[ns as keyof typeof schemaRegistry]
  if (!nsSchemas) return null

  return nsSchemas[type as keyof typeof nsSchemas] || null
}

/**
 * Validate thing data against its schema
 */
export function validateThingData(ns: string, type: string, data: unknown): {
  success: boolean
  data?: any
  errors?: z.ZodError
} {
  const schema = getSchemaForThing(ns, type)

  if (!schema) {
    return { success: false, errors: undefined }
  }

  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

// ============================================================================
// Type exports
// ============================================================================

export type SchemaOrgType = z.infer<typeof SchemaOrgTypeSchema>
export type SchemaOrgProperty = z.infer<typeof SchemaOrgPropertySchema>
export type Occupation = z.infer<typeof OccupationSchema>
export type Skill = z.infer<typeof SkillSchema>
export type Knowledge = z.infer<typeof KnowledgeSchema>
export type ProductSegment = z.infer<typeof ProductSegmentSchema>
export type ProductFamily = z.infer<typeof ProductFamilySchema>
export type ProductClass = z.infer<typeof ProductClassSchema>
export type ProductCommodity = z.infer<typeof ProductCommoditySchema>
export type Process = z.infer<typeof ProcessSchema>
export type Model = z.infer<typeof ModelSchema>
