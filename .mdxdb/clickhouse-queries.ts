/**
 * ClickHouse query helpers for mdxdb
 *
 * Provides async queries for the website to use with ClickHouse backend
 */

import { getClickHouseClient } from './clickhouse-client'
import type { Thing } from './schema'

/**
 * ClickHouse Thing type (uses camelCase)
 */
export interface ClickHouseThing {
  ns: string
  type: string
  id: string
  url: string
  data: any
  code: string | null
  content: string | null
  meta: any
  createdAt: string
  updatedAt: string
}

/**
 * Lightweight page metadata for sidebar/listings
 */
export interface PageMetadata {
  url: string
  title: string
  type: string
}

/**
 * Get all domains from ClickHouse
 */
export async function getDomains(): Promise<string[]> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: 'SELECT DISTINCT ns FROM things ORDER BY ns',
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ ns: string }>
    return data.map(r => r.ns)
  } catch (error) {
    console.error('Error fetching domains from ClickHouse:', error)
    return []
  }
}

/**
 * Get types for a specific domain
 */
export async function getDomainTypes(domain: string): Promise<string[]> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: 'SELECT DISTINCT type FROM things WHERE ns = {ns:String} ORDER BY type',
      query_params: { ns: domain },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ type: string }>
    return data.map(r => r.type)
  } catch (error) {
    console.error('Error fetching domain types from ClickHouse:', error)
    return []
  }
}

/**
 * Get types for a specific domain with counts
 */
export async function getDomainTypesWithCounts(domain: string): Promise<Array<{ type: string; count: number }>> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: 'SELECT type, count(*) as count FROM things WHERE ns = {ns:String} GROUP BY type ORDER BY type',
      query_params: { ns: domain },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ type: string; count: string }>
    return data.map(r => ({ type: r.type, count: parseInt(r.count) }))
  } catch (error) {
    console.error('Error fetching domain types with counts from ClickHouse:', error)
    return []
  }
}

/**
 * Get a page by domain and slug
 */
export async function getPage(domain: string, slug?: string[]): Promise<ClickHouseThing | undefined> {
  const client = getClickHouseClient()
  const slugPath = slug?.join('/') || ''
  const url = slugPath ? `${domain}/${slugPath}` : domain

  try {
    const result = await client.query({
      query: 'SELECT * FROM things WHERE url = {url:String} LIMIT 1',
      query_params: { url },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as ClickHouseThing[]
    return data.length > 0 ? data[0] : undefined
  } catch (error) {
    console.error('Error fetching page from ClickHouse:', error)
    return undefined
  }
}

/**
 * Get all pages for a specific domain
 */
export async function getPages(domain: string): Promise<ClickHouseThing[]> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: 'SELECT * FROM things WHERE ns = {ns:String}',
      query_params: { ns: domain },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as ClickHouseThing[]
    return data
  } catch (error) {
    console.error('Error fetching pages from ClickHouse:', error)
    return []
  }
}

/**
 * Get lightweight page metadata for sidebar
 */
export async function getPageMetadata(
  domain: string,
  type?: string
): Promise<PageMetadata[]> {
  const client = getClickHouseClient()
  try {
    const query = type
      ? 'SELECT url, id, type FROM things WHERE ns = {ns:String} AND type = {type:String}'
      : 'SELECT url, id, type FROM things WHERE ns = {ns:String}'

    const result = await client.query({
      query,
      query_params: type ? { ns: domain, type } : { ns: domain },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ url: string; id: string; type: string }>

    return data.map(r => ({
      url: `/${r.url}`,  // URLs are stored as relative paths like 'onet/Occupation/ChiefExecutives'
      title: r.id,
      type: r.type,
    }))
  } catch (error) {
    console.error('Error fetching page metadata from ClickHouse:', error)
    return []
  }
}

/**
 * Get count of pages for a domain/type
 */
export async function getPageCount(domain: string, type?: string): Promise<number> {
  const client = getClickHouseClient()
  try {
    const query = type
      ? 'SELECT count(*) as count FROM things WHERE ns = {ns:String} AND type = {type:String}'
      : 'SELECT count(*) as count FROM things WHERE ns = {ns:String}'

    const result = await client.query({
      query,
      query_params: type ? { ns: domain, type } : { ns: domain },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ count: string }>
    return data.length > 0 ? parseInt(data[0].count) : 0
  } catch (error) {
    console.error('Error fetching page count from ClickHouse:', error)
    return 0
  }
}

/**
 * Get all unique thing types across all domains
 */
export async function getAllTypes(): Promise<string[]> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: 'SELECT DISTINCT type FROM things ORDER BY type',
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ type: string }>
    return data.map(r => r.type)
  } catch (error) {
    console.error('Error fetching all types from ClickHouse:', error)
    return []
  }
}

/**
 * Get count of things by type
 */
export async function getTypeCount(type: string): Promise<number> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: 'SELECT count(*) as count FROM things WHERE type = {type:String}',
      query_params: { type },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as Array<{ count: string }>
    return data.length > 0 ? parseInt(data[0].count) : 0
  } catch (error) {
    console.error('Error fetching type count from ClickHouse:', error)
    return 0
  }
}

/**
 * Get sample things by type (for homepage display)
 */
export async function getSampleThingsByType(type: string, limit: number = 5): Promise<ClickHouseThing[]> {
  const client = getClickHouseClient()
  try {
    const result = await client.query({
      query: `
        SELECT * FROM things
        WHERE type = {type:String}
        ORDER BY id
        LIMIT {limit:UInt32}
      `,
      query_params: { type, limit },
      format: 'JSONEachRow',
    })

    const data = (await result.json()) as ClickHouseThing[]
    return data
  } catch (error) {
    console.error('Error fetching sample things from ClickHouse:', error)
    return []
  }
}

/**
 * Get paginated things by type with cursor-based pagination
 * @param type - The type to filter by
 * @param limit - Number of items per page (default 50)
 * @param after - Cursor (ID) to get items after
 * @param before - Cursor (ID) to get items before
 */
export async function getPaginatedThingsByType(
  type: string,
  limit: number = 50,
  after?: string,
  before?: string
): Promise<{ things: ClickHouseThing[]; hasMore: boolean; hasPrev: boolean }> {
  const client = getClickHouseClient()
  try {
    let query: string
    let query_params: any

    if (after) {
      // Get items after cursor
      query = `
        SELECT * FROM things
        WHERE type = {type:String} AND id > {after:String}
        ORDER BY id
        LIMIT {limit:UInt32}
      `
      query_params = { type, after, limit: limit + 1 } // Get one extra to check hasMore
    } else if (before) {
      // Get items before cursor (reverse order, then flip)
      query = `
        SELECT * FROM things
        WHERE type = {type:String} AND id < {before:String}
        ORDER BY id DESC
        LIMIT {limit:UInt32}
      `
      query_params = { type, before, limit: limit + 1 } // Get one extra to check hasPrev
    } else {
      // Get first page
      query = `
        SELECT * FROM things
        WHERE type = {type:String}
        ORDER BY id
        LIMIT {limit:UInt32}
      `
      query_params = { type, limit: limit + 1 } // Get one extra to check hasMore
    }

    const result = await client.query({
      query,
      query_params,
      format: 'JSONEachRow',
    })

    let data = (await result.json()) as ClickHouseThing[]

    // Check if there are more items
    const hasMore = data.length > limit
    const hasPrev = !!after || !!before

    // Remove the extra item used for hasMore check
    if (hasMore) {
      data = data.slice(0, limit)
    }

    // If we used before cursor, we got items in reverse order, so flip them back
    if (before) {
      data = data.reverse()
    }

    return {
      things: data,
      hasMore: before ? (data.length === limit) : hasMore,
      hasPrev: before ? hasMore : !!after,
    }
  } catch (error) {
    console.error('Error fetching paginated things from ClickHouse:', error)
    return { things: [], hasMore: false, hasPrev: false }
  }
}
