#!/usr/bin/env tsx

/**
 * Run Wikidata Ingestion on ClickHouse Cloud
 *
 * Executes the SQL pipeline to ingest Wikidata into ClickHouse
 */

import { createClient } from '@clickhouse/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
});

async function executeSQL(sql: string, description: string): Promise<void> {
  console.log(`\n📝 ${description}...`);

  try {
    await client.exec({ query: sql });
    console.log(`✅ ${description} complete`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function main() {
  console.log('\n🌐 Wikidata → ClickHouse Cloud Ingestion\n');
  console.log(`📡 Connecting to: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const result = await client.ping();
    if (!result.success) {
      throw new Error('Failed to connect to ClickHouse');
    }
    console.log('✅ Connected successfully\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'ingest-wikidata.sql');
    const fullSQL = fs.readFileSync(sqlPath, 'utf-8');

    // Remove comments and split properly
    const lines = fullSQL.split('\n');
    let currentStatement = '';
    const statements: Array<{ sql: string; description: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comment lines
      if (trimmed.startsWith('--') || trimmed.length === 0) {
        // Extract description from comments
        if (trimmed.startsWith('-- STEP')) {
          // This is a section header
          continue;
        }
        continue;
      }

      currentStatement += line + '\n';

      // Check if statement is complete (ends with semicolon)
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0) {
          // Determine description
          let desc = 'Executing SQL';
          if (stmt.includes('CREATE DATABASE')) desc = 'Creating database';
          else if (stmt.includes('CREATE TABLE') && stmt.includes('things (')) desc = 'Creating things table';
          else if (stmt.includes('CREATE TABLE') && stmt.includes('relationships (')) desc = 'Creating relationships table';
          else if (stmt.includes('CREATE TABLE') && stmt.includes('searches (')) desc = 'Creating searches table';
          else if (stmt.includes('CREATE TABLE') && stmt.includes('staging')) desc = 'Creating staging table';
          else if (stmt.includes('INSERT INTO') && stmt.includes('staging')) desc = 'STREAMING WIKIDATA DATA (24-48 hours)';
          else if (stmt.includes('INSERT INTO') && stmt.includes('things')) desc = 'Transforming entities → things';
          else if (stmt.includes('INSERT INTO') && stmt.includes('relationships')) desc = 'Extracting relationships';
          else if (stmt.includes('ALTER TABLE') && stmt.includes('ADD INDEX')) desc = 'Creating indexes';
          else if (stmt.includes('CREATE MATERIALIZED VIEW') && stmt.includes('companies')) desc = 'Creating companies view';
          else if (stmt.includes('CREATE MATERIALIZED VIEW') && stmt.includes('occupations')) desc = 'Creating occupations view';
          else if (stmt.includes('CREATE MATERIALIZED VIEW') && stmt.includes('industries')) desc = 'Creating industries view';
          else if (stmt.includes('SELECT') && !stmt.includes('INSERT')) desc = 'Running verification query';

          statements.push({ sql: stmt, description: desc });
        }
        currentStatement = '';
      }
    }

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute statements
    for (let i = 0; i < statements.length; i++) {
      const { sql, description } = statements[i];

      if (description.includes('STREAMING')) {
        console.log('\n' + '='.repeat(80));
        console.log('🚨 LONG-RUNNING OPERATION STARTING');
        console.log('This will stream 130GB from Wikimedia (24-48 hours)');
        console.log('Monitor progress in ClickHouse Cloud console');
        console.log('='.repeat(80) + '\n');
      }

      await executeSQL(sql, `[${i + 1}/${statements.length}] ${description}`);

      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Ingestion pipeline started successfully!');
    console.log('='.repeat(80) + '\n');

    // Show current status
    console.log('📊 Current Status:\n');

    try {
      const stagingCount = await client.query({
        query: 'SELECT count() as count FROM public.wikidata_staging',
        format: 'JSONEachRow',
      });
      const stagingData = await stagingCount.json<any>();
      console.log(`  Staging: ${Number(stagingData[0]?.count || 0).toLocaleString()} rows`);
    } catch (e) {
      console.log('  Staging: 0 rows (streaming in progress)');
    }

    try {
      const thingsCount = await client.query({
        query: 'SELECT count() as count FROM public.things',
        format: 'JSONEachRow',
      });
      const thingsData = await thingsCount.json<any>();
      console.log(`  Things: ${Number(thingsData[0]?.count || 0).toLocaleString()} rows`);
    } catch (e) {
      console.log('  Things: 0 rows (pending transformation)');
    }

    console.log('\n📝 Next Steps:');
    console.log('  1. Monitor progress in ClickHouse Cloud console');
    console.log('  2. Streaming will take 24-48 hours');
    console.log('  3. Transformation will run after streaming completes');
    console.log('  4. Run verification queries when complete\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
