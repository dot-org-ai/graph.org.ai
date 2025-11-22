#!/usr/bin/env tsx

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
});

async function main() {
  console.log('\n📊 ClickHouse Public Database Status\n');

  // List tables
  const tables = await client.query({
    query: 'SHOW TABLES FROM public',
    format: 'JSONEachRow',
  });
  const tableList = await tables.json<any>();
  console.log('✅ Tables in public database:');
  for (const t of tableList) {
    console.log(`   - ${t.name}`);
  }

  // Check staging count
  try {
    const count = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const data = await count.json<any>();
    const rowCount = Number(data[0]?.count || 0);
    console.log(`\n📥 Wikidata Staging: ${rowCount.toLocaleString()} rows`);
  } catch (e) {
    console.log('\n📥 Wikidata Staging: 0 rows (streaming just started)');
  }

  // Check running queries
  const queries = await client.query({
    query: `SELECT query_id, user, elapsed, substring(query, 1, 100) as query_preview
            FROM system.processes
            WHERE query LIKE '%wikidata%' OR query LIKE '%staging%'
            ORDER BY elapsed DESC`,
    format: 'JSONEachRow',
  });
  const runningQueries = await queries.json<any>();
  if (runningQueries.length > 0) {
    console.log('\n🔄 Running Queries:');
    for (const q of runningQueries) {
      console.log(`   Query ID: ${q.query_id}`);
      console.log(`   Elapsed: ${Math.round(q.elapsed)}s`);
      console.log(`   Preview: ${q.query_preview}...`);
    }
  } else {
    console.log('\n✅ No active Wikidata queries (streaming completed or waiting to start)');
  }

  await client.close();
}

main().catch(console.error);
