#!/usr/bin/env tsx

/**
 * BLS OES Data Processor
 *
 * Processes the BLS Occupational Employment and Wage Statistics (OES)
 * May 2024 data file and creates enrichment files.
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

/**
 * Converts object keys to camelCase
 */
function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[^a-z]+/, '');
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
  console.log(`  ✅ Wrote ${data.length} rows to ${path.basename(filePath)}`);
}

/**
 * Processes the BLS OES data file
 */
function processBLSOES(): void {
  console.log('\n📦 Processing BLS OES May 2024 Data...\n');

  const oesFilePath = path.join(BLS_DIR, 'oesm24all', 'all_data_M_2024.xlsx');

  if (!fs.existsSync(oesFilePath)) {
    console.error('❌ OES data file not found at:', oesFilePath);
    console.error('   Please download the file first.');
    process.exit(1);
  }

  console.log('  Reading Excel file...');
  const buffer = fs.readFileSync(oesFilePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  console.log(`  Found ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}\n`);

  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    console.log(`  Processing sheet: ${sheetName}`);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      console.log(`    ⚠️  Sheet is empty, skipping`);
      continue;
    }

    // Convert column names to camelCase
    const camelCaseData = data.map((row: any) => {
      const newRow: any = {};
      for (const key in row) {
        newRow[toCamelCase(key)] = row[key];
      }
      return newRow;
    });

    // Write to source directory
    const sanitizedSheetName = sheetName.replace(/[^a-zA-Z0-9]/g, '_');
    writeTSV(path.join(BLS_DIR, `BLS.OES.${sanitizedSheetName}.tsv`), camelCaseData);

    // If this is national data, create enrichment files
    if (sheetName.toLowerCase().includes('national') || sanitizedSheetName === 'All_May_2024') {
      console.log('    Creating enrichment files for national data...');
      createWageEnrichment(camelCaseData);
      createEmploymentEnrichment(camelCaseData);
    }
  }

  console.log('\n✅ BLS OES processing complete!\n');
}

/**
 * Creates Occupations.Wages.tsv enrichment file
 */
function createWageEnrichment(data: any[]): void {
  const wages = data
    .filter(row => row.occCode || row.occ_code)
    .map(row => ({
      socCode: row.occCode || row.occ_code,
      occupationTitle: row.occTitle || row.occ_title,
      area: row.area,
      areaTitle: row.areaTitle || row.area_title,
      hourlyMeanWage: row.hMean || row.h_mean,
      annualMeanWage: row.aMean || row.a_mean,
      hourlyMedianWage: row.hMedian || row.h_median,
      annualMedianWage: row.aMedian || row.a_median,
      hourly10thPercentile: row.hPct10 || row.h_pct10,
      hourly25thPercentile: row.hPct25 || row.h_pct25,
      hourly75thPercentile: row.hPct75 || row.h_pct75,
      hourly90thPercentile: row.hPct90 || row.h_pct90,
      annual10thPercentile: row.aPct10 || row.a_pct10,
      annual25thPercentile: row.aPct25 || row.a_pct25,
      annual75thPercentile: row.aPct75 || row.a_pct75,
      annual90thPercentile: row.aPct90 || row.a_pct90,
      source: 'BLS OES May 2024',
    }))
    .filter(row => row.socCode);

  if (wages.length > 0) {
    writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Wages.tsv'), wages);
  }
}

/**
 * Creates Occupations.Employment.tsv enrichment file
 */
function createEmploymentEnrichment(data: any[]): void {
  const employment = data
    .filter(row => row.occCode || row.occ_code)
    .map(row => ({
      socCode: row.occCode || row.occ_code,
      occupationTitle: row.occTitle || row.occ_title,
      area: row.area,
      areaTitle: row.areaTitle || row.area_title,
      totalEmployment: row.totEmp || row.tot_emp,
      employmentPerThousandJobs: row.jobsPer1000 || row.jobs_1000,
      locQuotient: row.locQuotient || row.loc_quotient,
      employmentRSE: row.empPrse || row.emp_prse,
      source: 'BLS OES May 2024',
    }))
    .filter(row => row.socCode);

  if (employment.length > 0) {
    writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.Employment.tsv'), employment);
  }
}

// Run the processor
processBLSOES();
