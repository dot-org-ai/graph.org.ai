import { z } from 'zod';
import { IdSchema, MetadataSchema, RelationshipSchema } from '../base/common';
import { NAICSCodeSchema } from './industry';

/**
 * CompanyType Entity
 * Represents types of companies that may operate across multiple industries/sectors
 * Examples: "Tech Startup", "Healthcare Provider", "Manufacturing Firm", "Consulting Agency"
 */

export const CompanyTypeSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string().optional(),

  // Industries this company type typically operates in
  primaryIndustries: z.array(NAICSCodeSchema).optional(),
  secondaryIndustries: z.array(NAICSCodeSchema).optional(),

  // Characteristics
  typicalSize: z.enum(['micro', 'small', 'medium', 'large', 'enterprise']).optional(),
  businessModel: z.array(z.string()).optional(), // e.g., "B2B", "B2C", "SaaS", "Marketplace"
  stage: z.enum(['startup', 'growth', 'mature', 'enterprise']).optional(),

  // Taxonomies
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),

  metadata: MetadataSchema.optional(),
});

// Many-to-many relationship between CompanyType and Industry
export const CompanyTypeIndustrySchema = z.object({
  companyTypeId: IdSchema,
  industryCode: NAICSCodeSchema,

  // Relationship attributes
  isPrimary: z.boolean().default(false),
  relevanceScore: z.number().min(0).max(1).optional(),

  // Context for this relationship
  commonActivities: z.array(z.string()).optional(),
  typicalProducts: z.array(z.string()).optional(),
  typicalServices: z.array(z.string()).optional(),

  metadata: MetadataSchema.optional(),
});

// Company profile combining type and industries
export const CompanyProfileSchema = z.object({
  id: IdSchema,
  name: z.string(),
  companyType: IdSchema,

  // Industry classifications (can be multiple)
  industries: z.array(z.object({
    code: NAICSCodeSchema,
    isPrimary: z.boolean(),
    description: z.string().optional(),
  })),

  // Additional attributes
  description: z.string().optional(),
  size: z.enum(['micro', 'small', 'medium', 'large', 'enterprise']).optional(),
  founded: z.string().optional(),
  location: z.string().optional(),

  metadata: MetadataSchema.optional(),
});

export type CompanyType = z.infer<typeof CompanyTypeSchema>;
export type CompanyTypeIndustry = z.infer<typeof CompanyTypeIndustrySchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
