#!/usr/bin/env tsx

/**
 * Ingest Wikidata to ClickHouse
 *
 * Streams Wikidata JSON dump and ingests into Things + Relationships
 */

import { createClient } from '@clickhouse/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createBz2Stream } from 'unbzip2-stream';
import split2 from 'split2';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, '.source');
const WIKIDATA_DIR = path.join(SOURCE_DIR, 'Wikidata');

if (!fs.existsSync(WIKIDATA_DIR)) {
  fs.mkdirSync(WIKIDATA_DIR, { recursive: true });
}

const client = createClient({
  host: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
});

const BATCH_SIZE = 5000;
let thingsBatch: any[] = [];
let relationshipsBatch: any[] = [];
let totalEntities = 0;
let totalRelationships = 0;

// Property labels cache (will be populated as we encounter properties)
const propertyLabels = new Map<string, string>();

async function processEntity(line: string): Promise<void> {
  if (!line || line === '[' || line === ']') return;

  // Remove trailing comma if present
  const jsonStr = line.trim();
  const json = jsonStr.endsWith(',') ? jsonStr.slice(0, -1) : jsonStr;

  let entity: any;
  try {
    entity = JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON:', json.substring(0, 100));
    return;
  }

  if (!entity.id) return;

  // Extract thing
  const thing = {
    entity_id: entity.id,
    entity_type: entity.type || 'item',
    label_en: entity.labels?.en?.value || '',
    label_es: entity.labels?.es?.value || '',
    label_fr: entity.labels?.fr?.value || '',
    label_de: entity.labels?.de?.value || '',
    label_zh: entity.labels?.zh?.value || '',
    labels_json: JSON.stringify(entity.labels || {}),
    description_en: entity.descriptions?.en?.value || '',
    description_es: entity.descriptions?.es?.value || '',
    description_fr: entity.descriptions?.fr?.value || '',
    description_de: entity.descriptions?.de?.value || '',
    description_zh: entity.descriptions?.zh?.value || '',
    descriptions_json: JSON.stringify(entity.descriptions || {}),
    aliases_en: entity.aliases?.en?.map((a: any) => a.value) || [],
    aliases_json: JSON.stringify(entity.aliases || {}),
    wikipedia_en: entity.sitelinks?.enwiki?.title || '',
    wikipedia_url: entity.sitelinks?.enwiki?.title
      ? `https://en.wikipedia.org/wiki/${entity.sitelinks.enwiki.title.replace(/ /g, '_')}`
      : '',
    sitelinks_count: Object.keys(entity.sitelinks || {}).length,
    sitelinks_json: JSON.stringify(entity.sitelinks || {}),
    modified: entity.modified || new Date().toISOString(),
  };

  thingsBatch.push(thing);

  // Cache property labels
  if (entity.type === 'property' && entity.labels?.en?.value) {
    propertyLabels.set(entity.id, entity.labels.en.value);
  }

  // Extract relationships from claims
  for (const [propertyId, claims] of Object.entries(entity.claims || {})) {
    for (const claim of claims as any[]) {
      const mainsnak = claim.mainsnak;
      if (!mainsnak || mainsnak.snaktype !== 'value') continue;

      const relationship: any = {
        subject_id: entity.id,
        property_id: propertyId,
        property_label: propertyLabels.get(propertyId) || '',
        object_type: mainsnak.datavalue?.type || 'string',
        object_entity_id: '',
        object_string: '',
        object_quantity: 0,
        object_time: null,
        object_latitude: 0,
        object_longitude: 0,
        object_json: JSON.stringify(mainsnak.datavalue || {}),
        qualifiers_json: JSON.stringify(claim.qualifiers || {}),
        references_json: JSON.stringify(claim.references || {}),
        rank: claim.rank || 'normal',
      };

      // Extract typed values
      const value = mainsnak.datavalue?.value;
      if (mainsnak.datavalue?.type === 'wikibase-entityid') {
        relationship.object_entity_id = value?.['id'] || '';
      } else if (mainsnak.datavalue?.type === 'string') {
        relationship.object_string = String(value || '');
      } else if (mainsnak.datavalue?.type === 'quantity') {
        relationship.object_quantity = parseFloat(value?.['amount'] || '0');
      } else if (mainsnak.datavalue?.type === 'time') {
        try {
          const timeStr = value?.['time'] || '';
          if (timeStr) {
            // Wikidata time format: +2021-01-01T00:00:00Z
            const cleaned = timeStr.replace(/^[+-]/, '');
            relationship.object_time = new Date(cleaned).toISOString();
          }
        } catch (e) {
          // Invalid date, leave as null
        }
      } else if (mainsnak.datavalue?.type === 'globecoordinate') {
        relationship.object_latitude = value?.['latitude'] || 0;
        relationship.object_longitude = value?.['longitude'] || 0;
      }

      relationshipsBatch.push(relationship);
      totalRelationships++;
    }
  }

  totalEntities++;

  // Flush batches if needed
  if (thingsBatch.length >= BATCH_SIZE) {
    await flushThings();
  }

  if (relationshipsBatch.length >= BATCH_SIZE) {
    await flushRelationships();
  }

  // Progress reporting
  if (totalEntities % 10000 === 0) {
    console.log(`  Processed: ${totalEntities.toLocaleString()} entities, ${totalRelationships.toLocaleString()} relationships`);
  }
}

async function flushThings(): Promise<void> {
  if (thingsBatch.length === 0) return;

  try {
    await client.insert({
      table: 'graph_org_ai.wikidata_things',
      values: thingsBatch,
      format: 'JSONEachRow',
    });
    thingsBatch = [];
  } catch (error) {
    console.error('Error inserting things batch:', error instanceof Error ? error.message : error);
  }
}

async function flushRelationships(): Promise<void> {
  if (relationshipsBatch.length === 0) return;

  try {
    await client.insert({
      table: 'graph_org_ai.wikidata_relationships',
      values: relationshipsBatch,
      format: 'JSONEachRow',
    });
    relationshipsBatch = [];
  } catch (error) {
    console.error('Error inserting relationships batch:', error instanceof Error ? error.message : error);
  }
}

async function setupSchema(): Promise<void> {
  console.log('  Setting up Wikidata schema...\n');

  // Create wikidata_things table
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS graph_org_ai.wikidata_things (
        entity_id String,
        entity_type Enum8('item'=1, 'property'=2),
        label_en String,
        label_es String,
        label_fr String,
        label_de String,
        label_zh String,
        labels_json String,
        description_en String,
        description_es String,
        description_fr String,
        description_de String,
        description_zh String,
        descriptions_json String,
        aliases_en Array(String),
        aliases_json String,
        wikipedia_en String,
        wikipedia_url String,
        sitelinks_count UInt16,
        sitelinks_json String,
        modified DateTime,
        ingested_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY (entity_type, entity_id)
    `,
  });

  // Create wikidata_relationships table
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS graph_org_ai.wikidata_relationships (
        subject_id String,
        property_id String,
        property_label String,
        object_type Enum8(
          'wikibase-entityid'=1,
          'string'=2,
          'quantity'=3,
          'time'=4,
          'globecoordinate'=5,
          'monolingualtext'=6,
          'url'=7
        ),
        object_entity_id String,
        object_string String,
        object_quantity Float64,
        object_time Nullable(DateTime),
        object_latitude Float64,
        object_longitude Float64,
        object_json String,
        qualifiers_json String,
        references_json String,
        rank Enum8('preferred'=1, 'normal'=2, 'deprecated'=3) DEFAULT 'normal',
        ingested_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY (subject_id, property_id, object_entity_id)
    `,
  });

  console.log('  ✅ Schema created\n');
}

async function ingestWikidata(filePath: string): Promise<void> {
  console.log(`\n📦 Ingesting Wikidata from ${path.basename(filePath)}...\n`);

  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found:', filePath);
    console.log('\n  To download Wikidata dump:');
    console.log('    wget https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2');
    console.log('    (Warning: ~130 GB compressed, ~500 GB uncompressed)\n');
    return;
  }

  console.log('  Processing (this will take 24-48 hours)...\n');

  const startTime = Date.now();

  await pipeline(
    fs.createReadStream(filePath),
    createBz2Stream(),
    split2(),
    async function* (source) {
      for await (const chunk of source) {
        await processEntity(chunk.toString());
      }
    }
  );

  // Flush remaining batches
  await flushThings();
  await flushRelationships();

  const duration = ((Date.now() - startTime) / 1000 / 60 / 60).toFixed(1);

  console.log(`\n✅ Ingestion complete!`);
  console.log(`  Total entities: ${totalEntities.toLocaleString()}`);
  console.log(`  Total relationships: ${totalRelationships.toLocaleString()}`);
  console.log(`  Time: ${duration} hours\n`);
}

async function verifyData(): Promise<void> {
  console.log('\n📊 Verifying data...\n');

  // Count things
  const thingsCount = await client.query({
    query: 'SELECT count() as count FROM graph_org_ai.wikidata_things',
    format: 'JSONEachRow',
  });
  const thingsData = await thingsCount.json<any>();
  console.log(`  Things: ${Number(thingsData[0].count).toLocaleString()}`);

  // Count relationships
  const relsCount = await client.query({
    query: 'SELECT count() as count FROM graph_org_ai.wikidata_relationships',
    format: 'JSONEachRow',
  });
  const relsData = await relsCount.json<any>();
  console.log(`  Relationships: ${Number(relsData[0].count).toLocaleString()}`);

  // Sample entities
  console.log('\n  Sample entities with Wikipedia links:');
  const sample = await client.query({
    query: `
      SELECT entity_id, label_en, description_en, wikipedia_en
      FROM graph_org_ai.wikidata_things
      WHERE wikipedia_en != ''
      LIMIT 5
    `,
    format: 'JSONEachRow',
  });
  const sampleData = await sample.json<any>();
  sampleData.forEach((row: any) => {
    console.log(`    ${row.entity_id}: ${row.label_en} - ${row.description_en}`);
  });

  console.log();
}

async function main(): Promise<void> {
  try {
    console.log('\n🌐 Wikidata → ClickHouse Ingestion\n');

    // Test connection
    console.log('  Testing ClickHouse connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Failed to connect to ClickHouse');
    }
    console.log('  ✅ Connected\n');

    // Setup schema
    await setupSchema();

    // Ingest
    const dumpPath = process.argv[2] || path.join(WIKIDATA_DIR, 'latest-all.json.bz2');
    await ingestWikidata(dumpPath);

    // Verify
    await verifyData();

    console.log('✅ Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await client.close();
  }
}

main().catch(console.error);
