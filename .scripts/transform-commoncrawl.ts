#!/usr/bin/env tsx

/**
 * Transform Common Crawl Edges to Relationships
 *
 * Converts the edge data in source table to proper relationships
 * with full URLs by joining with the things table (vertices).
 *
 * This is a two-step process:
 * 1. Edges are stored in source table with node indices
 * 2. This script joins edges with things to convert indices → URLs
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 7200000, // 2 hours for large dataset
});

async function main() {
  console.log('\n🔄 Transforming Common Crawl Edges → Relationships\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Check edge count in source table
    console.log('📊 Counting edges in source table...');
    const edgeCountResult = await client.query({
      query: `SELECT count() as count FROM public.source WHERE source = 'commoncrawl-edges'`,
      format: 'JSONEachRow',
    });
    const edgeCountData = await edgeCountResult.json<{ count: string }>();
    const edgeCount = parseInt(edgeCountData[0].count);
    console.log(`   Found ${edgeCount.toLocaleString()} edges to transform\n`);

    if (edgeCount === 0) {
      console.log('⚠️  No edges found. Run ingest-commoncrawl.ts first.\n');
      return;
    }

    // Check vertex count in things table
    console.log('📊 Counting vertices in things table...');
    const vertexCountResult = await client.query({
      query: `SELECT count() as count FROM public.things WHERE ns = 'web.org.ai' AND type = 'Host'`,
      format: 'JSONEachRow',
    });
    const vertexCountData = await vertexCountResult.json<{ count: string }>();
    const vertexCount = parseInt(vertexCountData[0].count);
    console.log(`   Found ${vertexCount.toLocaleString()} vertices\n`);

    if (vertexCount === 0) {
      console.log('⚠️  No vertices found. Run ingest-commoncrawl.ts first.\n');
      return;
    }

    console.log('🚀 Transforming edges to relationships...');
    console.log('   This will join edges with vertices to get full URLs\n');

    const startTime = Date.now();

    // Transform edges → relationships by joining with things table
    // We need to join twice: once for 'from' and once for 'to'
    const transformQuery = `
      INSERT INTO public.relationships (ns, \`from\`, predicate, reverse, \`to\`, data, createdAt, updatedAt)
      SELECT
        'web.org.ai' AS ns,
        fromNode.url AS \`from\`,
        'linksTo' AS predicate,
        'linksFrom' AS reverse,
        toNode.url AS \`to\`,
        toJSONString(map(
          'fromIndex', edges.fromIndex,
          'toIndex', edges.toIndex
        )) AS data,
        edges.batch AS createdAt,
        edges.batch AS updatedAt
      FROM (
        SELECT
          JSONExtractUInt(data, 'fromIndex') AS fromIndex,
          JSONExtractUInt(data, 'toIndex') AS toIndex,
          batch
        FROM public.source
        WHERE source = 'commoncrawl-edges'
      ) AS edges
      INNER JOIN (
        SELECT
          JSONExtractUInt(data, 'nodeIndex') AS nodeIndex,
          url
        FROM public.things
        WHERE ns = 'web.org.ai' AND type = 'Host'
      ) AS fromNode ON edges.fromIndex = fromNode.nodeIndex
      INNER JOIN (
        SELECT
          JSONExtractUInt(data, 'nodeIndex') AS nodeIndex,
          url
        FROM public.things
        WHERE ns = 'web.org.ai' AND type = 'Host'
      ) AS toNode ON edges.toIndex = toNode.nodeIndex
    `;

    await client.exec({
      query: transformQuery,
      clickhouse_settings: {
        max_execution_time: 7200, // 2 hours
        max_insert_block_size: 100000,
      }
    });

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    console.log(`\n✅ Transformation complete in ${minutes}m ${seconds}s\n`);

    // Verify relationships
    console.log('📊 Verifying relationships...');
    const relCountResult = await client.query({
      query: `SELECT count() as count FROM public.relationships WHERE ns = 'web.org.ai' AND predicate = 'linksTo'`,
      format: 'JSONEachRow',
    });
    const relCountData = await relCountResult.json<{ count: string }>();
    const relCount = parseInt(relCountData[0].count);
    console.log(`   Relationships created: ${relCount.toLocaleString()}\n`);

    // Show sample relationship
    console.log('📝 Sample relationship:');
    const sampleResult = await client.query({
      query: `
        SELECT \`from\`, predicate, \`to\`, data
        FROM public.relationships
        WHERE ns = 'web.org.ai' AND predicate = 'linksTo'
        LIMIT 1
      `,
      format: 'JSONEachRow',
    });
    const sampleData = await sampleResult.json<any>();
    if (sampleData.length > 0) {
      const sample = sampleData[0];
      console.log(`   From: ${sample.from}`);
      console.log(`   Predicate: ${sample.predicate}`);
      console.log(`   To: ${sample.to}`);
      console.log(`   Data: ${sample.data}\n`);
    }

    console.log('✅ Common Crawl transformation complete!\n');
    console.log('📊 Statistics:');
    console.log(`   Vertices: ${vertexCount.toLocaleString()}`);
    console.log(`   Relationships: ${relCount.toLocaleString()}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
