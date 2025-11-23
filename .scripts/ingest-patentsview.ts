#!/usr/bin/env tsx

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

interface PatentData {
  patent_id: string;
  patent_number: string;
  patent_title: string;
  patent_abstract: string;
  patent_date: string;
  patent_type: string;
  patent_num_claims: number;
}

interface InventorData {
  inventor_id: string;
  inventor_name_first: string;
  inventor_name_last: string;
}

interface AssigneeData {
  assignee_id: string;
  assignee_organization: string;
  assignee_type: string;
}

async function main() {
  console.log('\n📜 Starting USPTO Patents Ingestion via PatentsView API\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Create patents table
    console.log('📋 Creating patents table if not exists...');
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS source.patents (
          patent_id String,
          patent_number String,
          patent_title String,
          patent_abstract String,
          patent_date Date,
          patent_type String,
          num_claims UInt32,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (patent_date, patent_id)
      `
    });
    console.log('✅ Patents table ready');

    // Create inventors table
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS source.patent_inventors (
          patent_id String,
          inventor_id String,
          inventor_first_name String,
          inventor_last_name String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (patent_id, inventor_id)
      `
    });
    console.log('✅ Inventors table ready');

    // Create assignees table
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS source.patent_assignees (
          patent_id String,
          assignee_id String,
          assignee_organization String,
          assignee_type String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (patent_id, assignee_id)
      `
    });
    console.log('✅ Assignees table ready\n');

    console.log('📚 PatentsView API Information:\n');
    console.log('   Base URL: https://search.patentsview.org/api/v1/');
    console.log('   Endpoints: patent, inventor, assignee, location, cpc_subsection');
    console.log('   Rate Limit: No API key required, reasonable use policy');
    console.log('   Max Results: 10,000 per query (use pagination for more)\n');

    console.log('🔍 Fetching recent AI/ML patents as sample...\n');

    // Query for recent AI/ML patents (sample)
    const query = {
      q: {
        "_and": [
          {
            "_gte": {
              "patent_date": "2024-01-01"
            }
          },
          {
            "_text_any": {
              "patent_abstract": "artificial intelligence OR machine learning OR neural network"
            }
          }
        ]
      },
      f: [
        "patent_id",
        "patent_number",
        "patent_title",
        "patent_abstract",
        "patent_date",
        "patent_type",
        "patent_num_claims",
        "inventors",
        "assignees"
      ],
      o: {
        "per_page": 100
      },
      s: [
        {
          "patent_date": "desc"
        }
      ]
    };

    try {
      const response = await fetch('https://search.patentsview.org/api/v1/patent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'graph.org.ai nate@nathanclevenger.com'
        },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.patents || data.patents.length === 0) {
        console.log('⚠️  No patents returned from query\n');
        console.log('💡 This is normal if the API query didn\'t match any patents.');
        console.log('   Try adjusting the query parameters in the script.\n');
      } else {
        console.log(`📥 Retrieved ${data.patents.length} patents\n`);

        // Process patents
        const patents: any[] = [];
        const inventors: any[] = [];
        const assignees: any[] = [];

        for (const patent of data.patents) {
          patents.push({
            patent_id: patent.patent_id,
            patent_number: patent.patent_number,
            patent_title: patent.patent_title || '',
            patent_abstract: (patent.patent_abstract || '').substring(0, 5000), // Limit abstract length
            patent_date: patent.patent_date || '1970-01-01',
            patent_type: patent.patent_type || '',
            num_claims: patent.patent_num_claims || 0
          });

          // Extract inventors
          if (patent.inventors && Array.isArray(patent.inventors)) {
            for (const inv of patent.inventors) {
              inventors.push({
                patent_id: patent.patent_id,
                inventor_id: inv.inventor_id || '',
                inventor_first_name: inv.inventor_name_first || '',
                inventor_last_name: inv.inventor_name_last || ''
              });
            }
          }

          // Extract assignees
          if (patent.assignees && Array.isArray(patent.assignees)) {
            for (const assignee of patent.assignees) {
              assignees.push({
                patent_id: patent.patent_id,
                assignee_id: assignee.assignee_id || '',
                assignee_organization: assignee.assignee_organization || '',
                assignee_type: assignee.assignee_type || ''
              });
            }
          }
        }

        // Insert patents
        if (patents.length > 0) {
          await client.insert({
            table: 'source.patents',
            values: patents,
            format: 'JSONEachRow'
          });
          console.log(`✅ Inserted ${patents.length} patents`);
        }

        // Insert inventors
        if (inventors.length > 0) {
          await client.insert({
            table: 'source.patent_inventors',
            values: inventors,
            format: 'JSONEachRow'
          });
          console.log(`✅ Inserted ${inventors.length} inventor records`);
        }

        // Insert assignees
        if (assignees.length > 0) {
          await client.insert({
            table: 'source.patent_assignees',
            values: assignees,
            format: 'JSONEachRow'
          });
          console.log(`✅ Inserted ${assignees.length} assignee records`);
        }

        console.log('');
      }

    } catch (apiError) {
      console.log('⚠️  API query failed');
      console.log(`   ${apiError instanceof Error ? apiError.message : apiError}\n`);
    }

    // Check counts
    const patentCount = await client.query({
      query: 'SELECT count() as count FROM source.patents',
      format: 'JSONEachRow'
    });
    const patentData = await patentCount.json<{count: string}>();

    const inventorCount = await client.query({
      query: 'SELECT count() as count FROM source.patent_inventors',
      format: 'JSONEachRow'
    });
    const inventorData = await inventorCount.json<{count: string}>();

    const assigneeCount = await client.query({
      query: 'SELECT count() as count FROM source.patent_assignees',
      format: 'JSONEachRow'
    });
    const assigneeData = await assigneeCount.json<{count: string}>();

    console.log('📊 Database Statistics:');
    console.log(`   Patents: ${patentData[0].count}`);
    console.log(`   Inventors: ${inventorData[0].count}`);
    console.log(`   Assignees: ${assigneeData[0].count}\n`);

    if (parseInt(patentData[0].count) > 0) {
      // Show examples
      const examples = await client.query({
        query: `
          SELECT
            patent_number,
            patent_title,
            patent_date,
            num_claims
          FROM source.patents
          ORDER BY patent_date DESC
          LIMIT 5
        `,
        format: 'JSONEachRow'
      });
      const exampleData = await examples.json<{patent_number: string, patent_title: string, patent_date: string, num_claims: number}>();

      console.log('📝 Sample patents:');
      exampleData.forEach(row => {
        console.log(`   ${row.patent_number} (${row.patent_date})`);
        console.log(`      ${row.patent_title.substring(0, 80)}${row.patent_title.length > 80 ? '...' : ''}`);
        console.log(`      Claims: ${row.num_claims}`);
      });
      console.log('');
    }

    console.log('✅ USPTO patents ingestion script ready!\n');

    console.log('💡 Advanced Queries:');
    console.log('   - Search by CPC classification');
    console.log('   - Filter by assignee organization');
    console.log('   - Search by inventor name');
    console.log('   - Filter by date range');
    console.log('   - Search patent text fields\n');

    console.log('📖 API Documentation:');
    console.log('   https://patentsview.org/apis/api-endpoints/patents\n');

    console.log('💾 Bulk Data Alternative:');
    console.log('   For complete USPTO patent database (11M+ patents):');
    console.log('   - Download from https://bulkdata.uspto.gov/');
    console.log('   - Process XML files locally');
    console.log('   - ~2TB total compressed data\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
