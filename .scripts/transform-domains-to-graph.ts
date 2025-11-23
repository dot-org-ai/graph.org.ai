#!/usr/bin/env tsx

/**
 * Transform domains table → things + relationships
 *
 * Transforms the domains table (468M+ records) into graph structure
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

async function transformDomains() {
  console.log('\n🔄 Transforming domains → things + relationships\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Get domains count
    const countResult = await client.query({
      query: 'SELECT count() as count FROM public.domains',
      format: 'JSONEachRow'
    });
    const countData = await countResult.json<{count: string}>();
    console.log(`📊 Found ${countData[0].count} domains to transform\n`);

    // Transform domains to things
    console.log('📥 Transforming domains to things...');
    console.log('   This is a large dataset - transforming in server-side query\n');

    await client.exec({
      query: `
        INSERT INTO public.things (id, type, name, properties, source, source_batch, created_at)
        SELECT DISTINCT
          concat('domain:', name) as id,
          'Domain' as type,
          name as name,
          toJSONString(map(
            'domain', name,
            'tld', splitByChar('.', name)[-1]
          )) as properties,
          'domains' as source,
          now() as source_batch,
          now() as created_at
        FROM public.domains
      `
    });

    console.log('✅ Domains transformed to things\n');

    // Create Domain → TLD relationships
    console.log('📥 Creating Domain → TLD relationships...');

    await client.exec({
      query: `
        INSERT INTO public.relationships (from_id, from_type, relation_type, to_id, to_type, properties, source, source_batch, created_at)
        SELECT DISTINCT
          concat('domain:', name) as from_id,
          'Domain' as from_type,
          'HAS_TLD' as relation_type,
          concat('tld:', lower(splitByChar('.', name)[-1])) as to_id,
          'TLD' as to_type,
          '{}' as properties,
          'domains' as source,
          now() as source_batch,
          now() as created_at
        FROM public.domains
        WHERE length(splitByChar('.', name)[-1]) > 0
      `
    });

    console.log('✅ Domain → TLD relationships created\n');

    // Show summary
    console.log('📊 Transformation Summary:\n');

    const thingsCount = await client.query({
      query: "SELECT count() as count FROM public.things WHERE type = 'Domain'",
      format: 'JSONEachRow'
    });
    const thingsData = await thingsCount.json<{count: string}>();
    console.log(`   Domain things:        ${String(thingsData[0].count).padStart(15)}`);

    const relCount = await client.query({
      query: "SELECT count() as count FROM public.relationships WHERE from_type = 'Domain' AND relation_type = 'HAS_TLD'",
      format: 'JSONEachRow'
    });
    const relData = await relCount.json<{count: string}>();
    console.log(`   Domain → TLD rels:    ${String(relData[0].count).padStart(15)}\n`);

    // Show examples
    console.log('📝 Example domains:\n');
    const examples = await client.query({
      query: `
        SELECT id, name, properties
        FROM public.things
        WHERE type = 'Domain'
        LIMIT 5
      `,
      format: 'JSONEachRow'
    });
    const examplesData = await examples.json<{id: string, name: string, properties: string}>();
    examplesData.forEach(row => {
      const props = JSON.parse(row.properties);
      console.log(`  ${row.id}`);
      console.log(`    Name: ${row.name}`);
      console.log(`    TLD: ${props.tld}`);
    });

    console.log('\n✅ Transformation complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

transformDomains().catch(console.error);
