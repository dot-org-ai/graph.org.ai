#!/usr/bin/env tsx

/**
 * Setup ClickHouse Schema
 *
 * Creates tables for GeoNames and Wikipedia data
 */

import { createClient } from '@clickhouse/client';

const client = createClient({
  host: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
});

async function setupSchema(): Promise<void> {
  console.log('\n📦 Setting up ClickHouse schema...\n');

  try {
    // Test connection
    console.log('  Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Failed to connect to ClickHouse');
    }
    console.log('  ✅ Connected to ClickHouse\n');

    // Create database if not exists
    console.log('  Creating database...');
    await client.command({
      query: 'CREATE DATABASE IF NOT EXISTS graph_org_ai',
    });
    console.log('  ✅ Database created\n');

    // GeoNames: Geographic Places
    console.log('  Creating geo_places table...');
    await client.command({
      query: `
        CREATE TABLE IF NOT EXISTS graph_org_ai.geo_places (
          geoname_id UInt32,
          name String,
          ascii_name String,
          alternate_names String,
          latitude Float64,
          longitude Float64,
          feature_class FixedString(1),
          feature_code String,
          country_code FixedString(2),
          cc2 String,
          admin1_code String,
          admin2_code String,
          admin3_code String,
          admin4_code String,
          population UInt32,
          elevation Int32,
          dem Int32,
          timezone String,
          modification_date Date
        ) ENGINE = MergeTree()
        ORDER BY (country_code, feature_class, geoname_id)
      `,
    });
    console.log('  ✅ geo_places table created\n');

    // GeoNames: Postal Codes
    console.log('  Creating postal_codes table...');
    await client.command({
      query: `
        CREATE TABLE IF NOT EXISTS graph_org_ai.postal_codes (
          country_code FixedString(2),
          postal_code String,
          place_name String,
          admin1_name String,
          admin1_code String,
          admin2_name String,
          admin2_code String,
          admin3_name String,
          admin3_code String,
          latitude Float64,
          longitude Float64,
          accuracy UInt8
        ) ENGINE = MergeTree()
        ORDER BY (country_code, postal_code)
      `,
    });
    console.log('  ✅ postal_codes table created\n');

    // GeoNames: Countries
    console.log('  Creating countries table...');
    await client.command({
      query: `
        CREATE TABLE IF NOT EXISTS graph_org_ai.countries (
          iso_alpha2 FixedString(2),
          iso_alpha3 FixedString(3),
          iso_numeric UInt16,
          fips_code String,
          country_name String,
          capital String,
          area_km2 UInt32,
          population UInt32,
          continent FixedString(2),
          tld String,
          currency_code FixedString(3),
          currency_name String,
          phone String,
          postal_code_format String,
          postal_code_regex String,
          languages String,
          geoname_id UInt32,
          neighbours String,
          equivalent_fips_code String
        ) ENGINE = MergeTree()
        ORDER BY iso_alpha2
      `,
    });
    console.log('  ✅ countries table created\n');

    // Wikipedia: Articles
    console.log('  Creating wikipedia_articles table...');
    await client.command({
      query: `
        CREATE TABLE IF NOT EXISTS graph_org_ai.wikipedia_articles (
          page_id UInt64,
          title String,
          domain String,
          namespace String,
          description String,
          text LowCardinality(String),
          categories Array(String),
          templates Array(String),
          infobox_type String,
          infobox_data String,
          redirects_to String,
          is_disambiguation Bool,
          coordinates Tuple(Float64, Float64),
          wikidata_id String,
          created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (domain, namespace, page_id)
      `,
    });
    console.log('  ✅ wikipedia_articles table created\n');

    // Create indexes
    console.log('  Creating indexes...');

    // Geo-spatial index for places
    await client.command({
      query: `
        ALTER TABLE graph_org_ai.geo_places
        ADD INDEX IF NOT EXISTS idx_lat_lon (latitude, longitude)
        TYPE minmax GRANULARITY 8192
      `,
    });

    // Text search index for place names
    await client.command({
      query: `
        ALTER TABLE graph_org_ai.geo_places
        ADD INDEX IF NOT EXISTS idx_name (name)
        TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
      `,
    });

    // Text search index for Wikipedia titles
    await client.command({
      query: `
        ALTER TABLE graph_org_ai.wikipedia_articles
        ADD INDEX IF NOT EXISTS idx_title (title)
        TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
      `,
    });

    // Bloom filter index for Wikipedia categories
    await client.command({
      query: `
        ALTER TABLE graph_org_ai.wikipedia_articles
        ADD INDEX IF NOT EXISTS idx_categories (categories)
        TYPE bloom_filter() GRANULARITY 1
      `,
    });

    console.log('  ✅ Indexes created\n');

    console.log('✅ Schema setup complete!\n');

    // Display table info
    const tables = await client.query({
      query: 'SHOW TABLES FROM graph_org_ai',
      format: 'JSONEachRow',
    });

    console.log('📋 Created tables:');
    const tableList = await tables.json();
    tableList.forEach((row: any) => {
      console.log(`  - ${row.name}`);
    });
    console.log();

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await client.close();
  }
}

setupSchema().catch(console.error);
