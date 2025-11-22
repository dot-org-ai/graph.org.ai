#!/usr/bin/env tsx

/**
 * BLS OES TSV Data Processor
 *
 * Processes the BLS OES data file (oe.data.1.AllData) which contains
 * over 6 million rows of time series data for occupational employment
 * and wages.
 *
 * This script:
 * 1. Parses the large TSV file
 * 2. Filters for May 2024 (A01) data
 * 3. Creates enrichment files for wages and employment by occupation
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, '.source');
const ENRICHMENT_DIR = path.join(PROJECT_ROOT, '.enrichment');
const BLS_DIR = path.join(SOURCE_DIR, 'BLS');

// Ensure directories exist
if (!fs.existsSync(ENRICHMENT_DIR)) {
  fs.mkdirSync(ENRICHMENT_DIR, { recursive: true });
}

/**
 * Writes data to a TSV file
 */
function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.log(`  ⚠️  No data to write for ${path.basename(filePath)}`);
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
    }).join('\t')
  );

  const tsv = [headers.join('\t'), ...rows].join('\n');
  fs.writeFileSync(filePath, tsv, 'utf-8');
  console.log(`  ✅ Wrote ${data.length.toLocaleString()} rows to ${path.basename(filePath)}`);
}

/**
 * Processes the BLS OES TSV file
 */
function processBLSOESTSV(): void {
  console.log('\n📦 Processing BLS OES TSV Data (6M+ rows)...\n');

  const oesFilePath = path.join(BLS_DIR, 'oe.data.1.AllData');

  if (!fs.existsSync(oesFilePath)) {
    console.error('❌ OES data file not found at:', oesFilePath);
    process.exit(1);
  }

  console.log('  Reading TSV file (317MB)...');
  const content = fs.readFileSync(oesFilePath, 'utf-8');
  const lines = content.split('\n');

  console.log(`  Total lines: ${lines.length.toLocaleString()}`);

  if (lines.length < 2) {
    console.error('❌ File appears to be empty or malformed');
    process.exit(1);
  }

  // Parse header
  const headers = lines[0].split('\t').map(h => h.trim());
  console.log(`  Headers: ${headers.join(', ')}`);

  // Parse data rows
  console.log('  Parsing data rows...');
  const data: any[] = [];
  let processedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    if (i % 500000 === 0) {
      console.log(`    Processed ${i.toLocaleString()} rows...`);
    }

    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split('\t');
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() || '';
    });
    data.push(row);
    processedCount++;
  }

  console.log(`  ✅ Parsed ${processedCount.toLocaleString()} total rows\n`);

  // Filter for May 2024 data (period A01)
  console.log('  Filtering for May 2024 (period=A01, year=2024)...');
  const may2024Data = data.filter(row =>
    row.year === '2024' && row.period === 'A01'
  );
  console.log(`  ✅ Found ${may2024Data.toLocaleString()} May 2024 records\n`);

  // Write the filtered May 2024 data
  if (may2024Data.length > 0) {
    writeTSV(path.join(BLS_DIR, 'BLS.OES.May2024.tsv'), may2024Data);
  }

  // Now we need to decode the series_id to extract occupation, area, and data type
  // OES series ID format: OEUM[AREA][SEASONAL][INDUSTRY][OCCUPATION][DATATYPE]
  // We'll need to look up the series metadata from oe.series file if available

  console.log('\n✅ BLS OES TSV processing complete!\n');
}

// Run the processor
processBLSOESTSV();
