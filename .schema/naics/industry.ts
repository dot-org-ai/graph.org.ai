import { z } from 'zod';
import { HierarchicalNodeSchema, MetadataSchema, IdSchema } from '../base/common';

/**
 * NAICS Industry Classification System
 * 5-level hierarchy: Sector -> SubSector -> IndustryGroup -> Industry -> NationalIndustry
 */

// NAICS code pattern: 2-6 digits
export const NAICSCodeSchema = z.string().regex(/^\d{2,6}$/);

// Base industry entity
const BaseIndustrySchema = z.object({
  code: NAICSCodeSchema,
  name: z.string(),
  description: z.string().optional(),
  examples: z.array(z.string()).optional(),
  crossReferences: z.array(z.string()).optional(),
  metadata: MetadataSchema.optional(),
});

// Level 1: Sector (2-digit code)
export const SectorSchema = BaseIndustrySchema.extend({
  level: z.literal(1),
  code: z.string().regex(/^\d{2}$/),
  subSectors: z.array(NAICSCodeSchema).optional(),
});

// Level 2: SubSector (3-digit code)
export const SubSectorSchema = BaseIndustrySchema.extend({
  level: z.literal(2),
  code: z.string().regex(/^\d{3}$/),
  sectorCode: z.string().regex(/^\d{2}$/),
  industryGroups: z.array(NAICSCodeSchema).optional(),
});

// Level 3: Industry Group (4-digit code)
export const IndustryGroupSchema = BaseIndustrySchema.extend({
  level: z.literal(3),
  code: z.string().regex(/^\d{4}$/),
  subSectorCode: z.string().regex(/^\d{3}$/),
  industries: z.array(NAICSCodeSchema).optional(),
});

// Level 4: Industry (5-digit code)
export const IndustrySchema = BaseIndustrySchema.extend({
  level: z.literal(4),
  code: z.string().regex(/^\d{5}$/),
  industryGroupCode: z.string().regex(/^\d{4}$/),
  nationalIndustries: z.array(NAICSCodeSchema).optional(),
});

// Level 5: National Industry (6-digit code)
export const NationalIndustrySchema = BaseIndustrySchema.extend({
  level: z.literal(5),
  code: z.string().regex(/^\d{6}$/),
  industryCode: z.string().regex(/^\d{5}$/),
});

// Union type for any industry level
export const NAICSIndustrySchema = z.discriminatedUnion('level', [
  SectorSchema,
  SubSectorSchema,
  IndustryGroupSchema,
  IndustrySchema,
  NationalIndustrySchema,
]);

// Hierarchical view of NAICS industry
export const NAICSHierarchySchema = HierarchicalNodeSchema.extend({
  id: NAICSCodeSchema,
  parentId: NAICSCodeSchema.optional(),
  data: BaseIndustrySchema,
});

// Full NAICS tree structure
export const NAICSTreeSchema = z.object({
  code: NAICSCodeSchema,
  name: z.string(),
  description: z.string().optional(),
  level: z.number().int().min(1).max(5),
  children: z.lazy(() => z.array(NAICSTreeSchema)).optional(),
});

export type Sector = z.infer<typeof SectorSchema>;
export type SubSector = z.infer<typeof SubSectorSchema>;
export type IndustryGroup = z.infer<typeof IndustryGroupSchema>;
export type Industry = z.infer<typeof IndustrySchema>;
export type NationalIndustry = z.infer<typeof NationalIndustrySchema>;
export type NAICSIndustry = z.infer<typeof NAICSIndustrySchema>;
export type NAICSHierarchy = z.infer<typeof NAICSHierarchySchema>;
export type NAICSTree = z.infer<typeof NAICSTreeSchema>;
