/**
 * mdxdb - Knowledge Graph Database
 *
 * Main entry point for the mdxdb knowledge graph database.
 * Provides access to schema, queries, and vector search capabilities.
 */

// Export schema types and tables
export * from './schema.js'

// Export query helpers
export * from './queries.js'

// Export vector search functions
export {
  semanticSearch,
  findSimilar,
  findSimilarByType,
  findMostSimilarOfEachType,
  closeVectorSearch,
  type SearchResult
} from './vector-search.js'
