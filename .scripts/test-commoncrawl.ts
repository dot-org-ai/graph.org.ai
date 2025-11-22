#!/usr/bin/env tsx

/**
 * Test Common Crawl Ingestion with Limited Data
 *
 * Tests with:
 * - 10,000 nodes (vertices)
 * - 100,000 relationships (edges)
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
  request_timeout: 300000,
});

async function main() {
  console.log('\n🧪 Testing Common Crawl Ingestion (Limited Dataset)\n');
  console.log('   Nodes: 10,000');
  console.log('   Edges: 100,000\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    const verticesUrl = 'https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2025-aug-sep-oct/host/vertices/part-00000-13a4f798-f552-4c50-98b3-b88be127958f-c000.txt.gz';
    const edgesUrl = 'https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2025-aug-sep-oct/host/edges/part-00000-329f4bcf-4df6-45f2-8766-1f22eaf31e2e-c000.txt.gz';

    // Ingest 10,000 vertices
    console.log('🔷 Ingesting 10,000 vertices...\n');
    const verticesQuery = `
      INSERT INTO public.things (ns, type, id, url, code, createdAt, updatedAt)
      SELECT
        'web.org.ai' AS ns,
        'Host' AS type,
        arrayStringConcat(arrayReverse(splitByChar('.', c2)), '.') AS id,  -- Normal hostname (subdomain.example.com)
        concat('https://', arrayStringConcat(arrayReverse(splitByChar('.', c2)), '.')) AS url,
        toString(c1) AS code,  -- nodeIndex as code
        toDateTime('${batchTimestamp}') AS createdAt,
        toDateTime('${batchTimestamp}') AS updatedAt
      FROM url('${verticesUrl}', 'TabSeparated', 'c1 UInt64, c2 String')
      LIMIT 10000
    `;

    await client.exec({ query: verticesQuery });
    console.log('✅ Inserted 10,000 vertices\n');

    // Show sample vertices
    console.log('📝 Sample vertices:');
    const sampleVertices = await client.query({
      query: `
        SELECT ns, type, id, url, code, data
        FROM public.things
        WHERE ns = 'web.org.ai' AND type = 'Host'
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const vertices = await sampleVertices.json<any>();
    for (const v of vertices) {
      console.log(`   id: ${v.id}`);
      console.log(`   url: ${v.url}`);
      console.log(`   code: ${v.code}`);
      console.log(`   data: ${v.data || '(empty)'}`);
      console.log();
    }

    // Ingest 100,000 relationships (NO JOIN - direct insert)
    console.log('🔶 Ingesting 100,000 relationships...\n');
    const edgesQuery = `
      INSERT INTO public.relationships (ns, \`from\`, predicate, reverse, \`to\`, createdAt, updatedAt)
      SELECT
        'web.org.ai' AS ns,
        toString(c1) AS \`from\`,  -- fromIndex as string
        'linksTo' AS predicate,
        'linksFrom' AS reverse,
        toString(c2) AS \`to\`,    -- toIndex as string
        toDateTime('${batchTimestamp}') AS createdAt,
        toDateTime('${batchTimestamp}') AS updatedAt
      FROM url('${edgesUrl}', 'TabSeparated', 'c1 UInt64, c2 UInt64')
      LIMIT 100000
    `;

    await client.exec({ query: edgesQuery });
    console.log('✅ Inserted relationships\n');

    // Count relationships
    const countResult = await client.query({
      query: `SELECT count() as count FROM public.relationships WHERE ns = 'web.org.ai'`,
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<{ count: string }>();
    console.log(`   Total relationships: ${parseInt(countData[0].count).toLocaleString()}\n`);

    // Show sample relationships
    console.log('📝 Sample relationships:');
    const sampleRels = await client.query({
      query: `
        SELECT \`from\`, predicate, \`to\`, data
        FROM public.relationships
        WHERE ns = 'web.org.ai'
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const rels = await sampleRels.json<any>();
    for (const r of rels) {
      console.log(`   from: ${r.from}`);
      console.log(`   predicate: ${r.predicate}`);
      console.log(`   to: ${r.to}`);
      console.log(`   data: ${r.data || '(empty)'}`);
      console.log();
    }

    console.log('✅ Test ingestion complete!\n');

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
