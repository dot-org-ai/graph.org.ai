#!/usr/bin/env tsx

/**
 * Process BLS OES Data with Metadata
 *
 * Uses the metadata files to decode series IDs and create enrichment files
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

console.log('\n📦 Processing BLS OES Data with Metadata...\n');

// Load metadata
console.log('  Loading metadata files...');
const occupations = parseTSV(path.join(BLS_DIR, 'oe.occupation'));
const datatypes = parseTSV(path.join(BLS_DIR, 'oe.datatype'));
const areas = parseTSV(path.join(BLS_DIR, 'oe.area'));

console.log(`  ✅ Loaded ${occupations.length} occupations`);
console.log(`  ✅ Loaded ${datatypes.length} data types`);
console.log(`  ✅ Loaded ${areas.length} areas\n`);

// Create lookups
const occLookup = new Map(
  occupations.map(o => [o.occupation_code, o.occupation_name])
);
const datatypeLookup = new Map(
  datatypes.map(d => [d.datatype_code, d.datatype_name])
);

// Parse series ID format (25 characters):
// Position 1-2: Survey Code (OE)
// Position 3: Seasonal Code (U=Not adjusted, S=Adjusted)
// Position 4: Area Type Code (N=National, M=Metro, S=State)
// Position 5-11: Area Code (7 digits, e.g., 0000000 = National)
// Position 12-17: Industry Code (6 digits, 000000 = All industries)
// Position 18-23: Occupation Code (6 digits, 000000 = All occupations)
// Position 24-25: Data Type Code (2 digits, 01=Employment, 03=Hourly wage, etc.)

function parseSeriesId(seriesId: string): any {
  return {
    surveyCode: seriesId.substring(0, 2),      // OE
    seasonalCode: seriesId.substring(2, 3),    // U or S
    areaTypeCode: seriesId.substring(3, 4),    // N, M, or S
    areaCode: seriesId.substring(4, 11),       // 7 digits
    industryCode: seriesId.substring(11, 17),  // 6 digits
    occupationCode: seriesId.substring(17, 23), // 6 digits
    dataTypeCode: seriesId.substring(23, 25)   // 2 digits
  };
}

// Load national May 2024 data
console.log('  Loading national May 2024 data...');
const dataPath = path.join(BLS_DIR, 'BLS.OES.National.May2024.tsv');

// Parse manually since file doesn't have header
const content = fs.readFileSync(dataPath, 'utf-8');
const lines = content.trim().split('\n');
const nationalData: any[] = [];

for (const line of lines) {
  const [series_id, year, period, value, footnote_codes] = line.split('\t');
  nationalData.push({ series_id, year, period, value, footnote_codes });
}

console.log(`  ✅ Loaded ${nationalData.length.toLocaleString()} national records\n`);

// Group by occupation
const byOccupation = new Map<string, Map<string, string>>();

for (const row of nationalData) {
  const parsed = parseSeriesId(row.series_id);
  const occCode = parsed.occupationCode;
  const datatypeCode = parsed.dataTypeCode;

  if (!byOccupation.has(occCode)) {
    byOccupation.set(occCode, new Map());
  }

  byOccupation.get(occCode)!.set(datatypeCode, row.value);
}

console.log(`  ✅ Processed ${byOccupation.size} occupations\n`);

// Create enrichment files
console.log('  Creating enrichment files...');

const wageData: any[] = [];
const employmentData: any[] = [];

for (const [occCode, dataMap] of byOccupation) {
  const occName = occLookup.get(occCode) || 'Unknown';

  // Skip aggregate categories (usually 000000, 00-0000, etc)
  if (occCode === '000000' || !occCode.match(/^\d{2}-?\d{4}$/)) {
    continue;
  }

  const socCode = occCode.length === 6 ? `${occCode.substring(0, 2)}-${occCode.substring(2)}` : occCode;

  // Wage data (codes 03-16 are various wage measures)
  wageData.push({
    socCode,
    occupationTitle: occName,
    totalEmployment: dataMap.get('01') || '',
    hourlyMeanWage: dataMap.get('03') || '',
    annualMeanWage: dataMap.get('04') || '',
    hourlyMedianWage: dataMap.get('11') || '',
    annualMedianWage: dataMap.get('12') || '',
    hourly10thPercentile: dataMap.get('05') || '',
    hourly25thPercentile: dataMap.get('07') || '',
    hourly75thPercentile: dataMap.get('09') || '',
    hourly90thPercentile: dataMap.get('10') || '',
    annual10thPercentile: dataMap.get('06') || '',
    annual25thPercentile: dataMap.get('08') || '',
    annual75thPercentile: dataMap.get('13') || '',
    annual90thPercentile: dataMap.get('14') || '',
    source: 'BLS OES May 2024',
  });

  // Employment data
  employmentData.push({
    socCode,
    occupationTitle: occName,
    totalEmployment: dataMap.get('01') || '',
    employmentRSE: dataMap.get('02') || '',
    source: 'BLS OES May 2024',
  });
}

writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Wages.tsv'), wageData);
writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Employment.tsv'), employmentData);

console.log('\n✅ Processing complete!\n');
