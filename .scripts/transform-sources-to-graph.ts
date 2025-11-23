#!/usr/bin/env tsx

/**
 * Transform Layer: public.sources → things + relationships
 *
 * Reads raw data from public.sources and transforms into graph structure:
 * - things: entities with properties
 * - relationships: connections between entities
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
});

async function createSchema() {
  console.log('📋 Creating graph schema...\n');

  // Drop existing tables to ensure clean start
  await client.exec({ query: 'DROP TABLE IF EXISTS public.things' });
  await client.exec({ query: 'DROP TABLE IF EXISTS public.relationships' });

  // Create things table
  await client.exec({
    query: `
      CREATE TABLE public.things (
        id String,
        type String,
        name String,
        properties String,
        source String,
        source_batch DateTime,
        created_at DateTime DEFAULT now(),
        INDEX idx_type type TYPE bloom_filter GRANULARITY 1,
        INDEX idx_name name TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
      ) ENGINE = MergeTree()
      ORDER BY (type, id)
    `
  });
  console.log('✅ Created public.things table');

  // Create relationships table
  await client.exec({
    query: `
      CREATE TABLE public.relationships (
        from_id String,
        from_type String,
        relation_type String,
        to_id String,
        to_type String,
        properties String,
        source String,
        source_batch DateTime,
        created_at DateTime DEFAULT now(),
        INDEX idx_from from_id TYPE bloom_filter GRANULARITY 1,
        INDEX idx_to to_id TYPE bloom_filter GRANULARITY 1,
        INDEX idx_rel relation_type TYPE bloom_filter GRANULARITY 1
      ) ENGINE = MergeTree()
      ORDER BY (from_type, from_id, relation_type, to_type, to_id)
    `
  });
  console.log('✅ Created public.relationships table\n');
}

async function transformTLDs() {
  console.log('📥 Transforming TLDs...');

  // Insert all TLDs from sources (duplicates will be handled by DISTINCT in final query)
  await client.exec({
    query: `
      INSERT INTO public.things (id, type, name, properties, source, source_batch)
      SELECT DISTINCT
        concat('tld:', data) as id,
        'TLD' as type,
        data as name,
        toJSONString(map('tld', data)) as properties,
        source,
        batch
      FROM public.sources
      WHERE source = 'tlds'
    `
  });

  console.log(`✅ Transformed TLDs from public.sources\n`);
}

async function transformCurrencies() {
  console.log('📥 Transforming currencies...');

  // Parse JSON from currencies and create things
  await client.exec({
    query: `
      INSERT INTO public.things (id, type, name, properties, source, source_batch)
      SELECT DISTINCT
        concat('currency:', JSONExtractString(data, 'code')) as id,
        'Currency' as type,
        JSONExtractString(data, 'currency') as name,
        data as properties,
        source,
        batch
      FROM public.sources
      WHERE source = 'currencies'
        AND length(JSONExtractString(data, 'code')) > 0
    `
  });

  console.log(`✅ Transformed currencies from public.sources\n`);
}

async function transformAirports() {
  console.log('📥 Transforming airports...');

  // Airports are stored as pipe-delimited: id|ident|type|name|lat|lon|elev|continent|country|region|...
  await client.exec({
    query: `
      INSERT INTO public.things (id, type, name, properties, source, source_batch)
      SELECT DISTINCT
        concat('airport:', splitByChar('|', data)[2]) as id,
        'Airport' as type,
        splitByChar('|', data)[4] as name,
        toJSONString(map(
          'ident', splitByChar('|', data)[2],
          'airport_type', splitByChar('|', data)[3],
          'latitude', splitByChar('|', data)[5],
          'longitude', splitByChar('|', data)[6],
          'elevation_ft', splitByChar('|', data)[7],
          'continent', splitByChar('|', data)[8],
          'iso_country', splitByChar('|', data)[9],
          'iso_region', splitByChar('|', data)[10],
          'municipality', splitByChar('|', data)[11],
          'iata_code', splitByChar('|', data)[13]
        )) as properties,
        source,
        batch
      FROM public.sources
      WHERE source = 'airports'
        AND length(splitByChar('|', data)[2]) > 0
    `
  });

  console.log(`✅ Transformed airports from public.sources`);

  // Create relationships: Airport -> Country
  console.log('📥 Creating Airport → Country relationships...');
  await client.exec({
    query: `
      INSERT INTO public.relationships (from_id, from_type, relation_type, to_id, to_type, properties, source, source_batch)
      SELECT DISTINCT
        concat('airport:', splitByChar('|', data)[2]) as from_id,
        'Airport' as from_type,
        'LOCATED_IN' as relation_type,
        concat('country:', splitByChar('|', data)[9]) as to_id,
        'Country' as to_type,
        '{}' as properties,
        source,
        batch
      FROM public.sources
      WHERE source = 'airports'
        AND length(splitByChar('|', data)[9]) > 0
    `
  });

  const relCount = await client.query({
    query: `
      SELECT count() as count FROM public.relationships
      WHERE from_type = 'Airport' AND relation_type = 'LOCATED_IN'
    `,
    format: 'JSONEachRow'
  });
  const relData = await relCount.json<{count: string}>();
  console.log(`✅ Created ${relData[0].count} Airport → Country relationships\n`);

  // Create Country things from airports
  console.log('📥 Creating Country things from airports...');
  await client.exec({
    query: `
      INSERT INTO public.things (id, type, name, properties, source, source_batch)
      SELECT DISTINCT
        concat('country:', splitByChar('|', data)[9]) as id,
        'Country' as type,
        splitByChar('|', data)[9] as name,
        toJSONString(map('iso_code', splitByChar('|', data)[9])) as properties,
        source,
        batch
      FROM public.sources
      WHERE source = 'airports'
        AND length(splitByChar('|', data)[9]) > 0
    `
  });

  console.log(`✅ Created Country things from airports\n`);
}

async function showSummary() {
  console.log('📊 Transformation Summary:\n');

  const thingsCount = await client.query({
    query: `
      SELECT type, count() as count
      FROM public.things
      GROUP BY type
      ORDER BY count DESC
    `,
    format: 'JSONEachRow'
  });
  const thingsData = await thingsCount.json<{type: string, count: string}>();

  console.log('Things by type:');
  thingsData.forEach(row => {
    console.log(`  ${row.type.padEnd(15)} ${String(row.count).padStart(10)} things`);
  });

  const relCount = await client.query({
    query: `
      SELECT relation_type, from_type, to_type, count() as count
      FROM public.relationships
      GROUP BY relation_type, from_type, to_type
      ORDER BY count DESC
    `,
    format: 'JSONEachRow'
  });
  const relData = await relCount.json<{relation_type: string, from_type: string, to_type: string, count: string}>();

  console.log('\nRelationships:');
  relData.forEach(row => {
    console.log(`  ${row.from_type} -[${row.relation_type}]-> ${row.to_type}: ${row.count}`);
  });

  // Total counts
  const totalThings = await client.query({
    query: 'SELECT count() as count FROM public.things',
    format: 'JSONEachRow'
  });
  const totalThingsData = await totalThings.json<{count: string}>();

  const totalRels = await client.query({
    query: 'SELECT count() as count FROM public.relationships',
    format: 'JSONEachRow'
  });
  const totalRelsData = await totalRels.json<{count: string}>();

  console.log(`\n✅ Total: ${totalThingsData[0].count} things, ${totalRelsData[0].count} relationships\n`);
}

async function showExamples() {
  console.log('📝 Example things:\n');

  // Show a few airports
  const airports = await client.query({
    query: `
      SELECT id, name, properties
      FROM public.things
      WHERE type = 'Airport'
      LIMIT 3
    `,
    format: 'JSONEachRow'
  });
  const airportData = await airports.json<{id: string, name: string, properties: string}>();

  console.log('Airports:');
  airportData.forEach(row => {
    const props = JSON.parse(row.properties);
    console.log(`  ${row.id}`);
    console.log(`    Name: ${row.name}`);
    console.log(`    IATA: ${props.iata_code || 'N/A'}, Country: ${props.iso_country}`);
  });

  console.log('\nCurrencies:');
  const currencies = await client.query({
    query: `
      SELECT id, name, properties
      FROM public.things
      WHERE type = 'Currency'
      LIMIT 3
    `,
    format: 'JSONEachRow'
  });
  const currencyData = await currencies.json<{id: string, name: string, properties: string}>();
  currencyData.forEach(row => {
    const props = JSON.parse(row.properties);
    console.log(`  ${row.id}: ${row.name} (${props.code})`);
  });

  console.log('');
}

async function main() {
  console.log('\n🔄 Starting transformation: public.sources → things + relationships\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Create schema
    await createSchema();

    // Transform each source
    await transformTLDs();
    await transformCurrencies();
    await transformAirports();

    // Show summary
    await showSummary();
    await showExamples();

    console.log('✅ Transformation complete!\n');
    console.log('💡 Next steps:');
    console.log('   - Query things: SELECT * FROM public.things WHERE type = \'Airport\' LIMIT 10');
    console.log('   - Query relationships: SELECT * FROM public.relationships LIMIT 10');
    console.log('   - Add more data sources to public.sources');
    console.log('   - Create additional transformation logic\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
