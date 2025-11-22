#!/usr/bin/env tsx

/**
 * BLS OES Excel Data Processor
 *
 * Processes the all_data_M_2024.xlsx file which has human-readable columns
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

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

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[^a-z]+/, '');
}

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

console.log('\n📦 Processing BLS OES Excel File...\n');

const excelPath = path.join(BLS_DIR, 'oesm24all', 'all_data_M_2024.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found');
  process.exit(1);
}

console.log('  Reading Excel file (this will take a few minutes for 78MB)...');
const buffer = fs.readFileSync(excelPath);

console.log('  Parsing workbook...');
const workbook = XLSX.read(buffer, { type: 'buffer' });

console.log(`  Found ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}\n`);

// Process the first sheet (usually "All May 2024")
const sheetName = workbook.SheetNames[0];
console.log(`  Processing sheet: ${sheetName}`);
console.log('  Converting to JSON (this may take a while)...');

const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
console.log(`  ✅ Converted ${data.length.toLocaleString()} rows\n`);

if (data.length > 0) {
  console.log(`  Sample columns: ${Object.keys(data[0]).slice(0, 10).join(', ')}\n`);

  // Convert to camelCase
  const camelData = data.map((row: any) => {
    const newRow: any = {};
    for (const key in row) {
      newRow[toCamelCase(key)] = row[key];
    }
    return newRow;
  });

  writeTSV(path.join(BLS_DIR, 'BLS.OES.All_May_2024.tsv'), camelData);

  // Create wage enrichment
  console.log('\n  Creating wage enrichment...');
  const wages = camelData
    .filter(row => row.occCode && row.areaType === '1') // National data only
    .map(row => ({
      socCode: row.occCode,
      occupationTitle: row.occTitle,
      totalEmployment: row.totEmp,
      hourlyMeanWage: row.hMean,
      annualMeanWage: row.aMean,
      hourlyMedianWage: row.hMedian ||row.hPct50,
      annualMedianWage: row.aMedian || row.aPct50,
      hourly10thPercentile: row.hPct10,
      hourly25thPercentile: row.hPct25,
      hourly75thPercentile: row.hPct75,
      hourly90thPercentile: row.hPct90,
      annual10thPercentile: row.aPct10,
      annual25thPercentile: row.aPct25,
      annual75thPercentile: row.aPct75,
      annual90thPercentile: row.aPct90,
      source: 'BLS OES May 2024',
    }))
    .filter(row => row.socCode);

  if (wages.length > 0) {
    writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Wages.tsv'), wages);
  }

  // Create employment enrichment
  console.log('  Creating employment enrichment...');
  const employment = camelData
    .filter(row => row.occCode && row.areaType === '1') // National data only
    .map(row => ({
      socCode: row.occCode,
      occupationTitle: row.occTitle,
      totalEmployment: row.totEmp,
      employmentPerThousandJobs: row.jobsPer1000 || row.jobs1000,
      locQuotient: row.locQuotient,
      employmentRSE: row.empPrse,
      source: 'BLS OES May 2024',
    }))
    .filter(row => row.socCode);

  if (employment.length > 0) {
    writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Employment.tsv'), employment);
  }
}

console.log('\n✅ Processing complete!\n');
