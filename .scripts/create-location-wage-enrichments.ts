#!/usr/bin/env tsx

/**
 * Create Location-Based Wage Enrichments
 *
 * Creates enrichment files for wages by location (state, metro area)
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

if (!fs.existsSync(ENRICHMENT_DIR)) {
  fs.mkdirSync(ENRICHMENT_DIR, { recursive: true });
}

function parseTSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split('\t');
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.log(`  ⚠️  No data to write`);
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

function parseSeriesId(seriesId: string): any {
  return {
    surveyCode: seriesId.substring(0, 2),
    seasonalCode: seriesId.substring(2, 3),
    areaTypeCode: seriesId.substring(3, 4),
    areaCode: seriesId.substring(4, 11),
    industryCode: seriesId.substring(11, 17),
    occupationCode: seriesId.substring(17, 23),
    dataTypeCode: seriesId.substring(23, 25)
  };
}

console.log('\n📦 Creating Location-Based Wage Enrichments...\n');

// Load metadata
console.log('  Loading metadata...');
const occupations = parseTSV(path.join(BLS_DIR, 'oe.occupation'));
const areas = parseTSV(path.join(BLS_DIR, 'oe.area'));

const occLookup = new Map(
  occupations.map(o => [o.occupation_code, o.occupation_name])
);
const areaLookup = new Map(
  areas.map(a => [a.area_code, { name: a.area_name, type: a.areatype_code, state: a.state_code }])
);

console.log(`  ✅ Loaded ${occupations.length} occupations, ${areas.length} areas\n`);

// Load all OES data
console.log('  Loading full OES May 2024 data...');
const dataPath = path.join(BLS_DIR, 'oe.data.1.AllData');
const content = fs.readFileSync(dataPath, 'utf-8');
const lines = content.trim().split('\n');

console.log(`  ✅ Loaded ${lines.length.toLocaleString()} total rows\n`);

// Filter for 2024 A01 period only
console.log('  Filtering for May 2024 data...');
const may2024Lines = lines.filter(line => line.includes('\t2024\tA01\t'));
console.log(`  ✅ Filtered to ${may2024Lines.length.toLocaleString()} May 2024 records\n`);

// Group by area + occupation
console.log('  Grouping by location and occupation...');
const byLocationOccupation = new Map<string, Map<string, Map<string, string>>>();

for (const line of may2024Lines) {
  const [series_id, year, period, value] = line.split('\t');

  // Only process OES series (skip if not OE)
  if (!series_id.startsWith('OE')) continue;

  const parsed = parseSeriesId(series_id);
  const areaCode = parsed.areaCode;
  const occCode = parsed.occupationCode;
  const datatypeCode = parsed.dataTypeCode;

  // Skip non-specific occupations
  if (occCode === '000000') continue;

  const key = `${areaCode}:${occCode}`;

  if (!byLocationOccupation.has(areaCode)) {
    byLocationOccupation.set(areaCode, new Map());
  }

  if (!byLocationOccupation.get(areaCode)!.has(occCode)) {
    byLocationOccupation.get(areaCode)!.set(occCode, new Map());
  }

  byLocationOccupation.get(areaCode)!.get(occCode)!.set(datatypeCode, value);
}

console.log(`  ✅ Processed ${byLocationOccupation.size} locations\n`);

// Create enrichment files
console.log('  Creating enrichment files...');

const locationWages: any[] = [];

for (const [areaCode, occupations] of byLocationOccupation) {
  const areaInfo = areaLookup.get(areaCode);
  if (!areaInfo) continue;

  for (const [occCode, dataMap] of occupations) {
    const occName = occLookup.get(occCode) || 'Unknown';
    const socCode = occCode.length === 6 ? `${occCode.substring(0, 2)}-${occCode.substring(2)}` : occCode;

    locationWages.push({
      areaCode,
      areaName: areaInfo.name,
      areaType: areaInfo.type,
      stateCode: areaInfo.state,
      socCode,
      occupationTitle: occName,
      totalEmployment: dataMap.get('01') || '',
      hourlyMeanWage: dataMap.get('03') || '',
      annualMeanWage: dataMap.get('04') || '',
      source: 'BLS OES May 2024',
    });
  }
}

writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Wages.ByLocation.tsv'), locationWages);

console.log('\n✅ Location-based enrichments complete!\n');
