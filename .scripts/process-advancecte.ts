#!/usr/bin/env tsx

/**
 * Process Advance CTE Excel files with multiple sheets
 * Extracts actual data sheets and filters out header/instruction rows
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ADVANCECTE_DIR = path.join(PROJECT_ROOT, '.source', 'AdvanceCTE');

/**
 * Normalizes header names to camelCase
 */
function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase());
}

/**
 * Normalizes all object keys to camelCase
 */
function normalizeToCamelCase(obj: any): any {
  const normalized: any = {};
  for (const key in obj) {
    const camelKey = toCamelCase(key);
    normalized[camelKey] = obj[key];
  }
  return normalized;
}

/**
 * Writes data to a TSV file
 */
function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.log(`  ⚠️  No data to write for ${path.basename(filePath)}`);
    return;
  }

  // Normalize all keys to camelCase
  const normalizedData = data.map(normalizeToCamelCase);

  // Get all unique keys (camelCase)
  const allKeys = new Set<string>();
  normalizedData.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key));
  });
  const headers = Array.from(allKeys);

  // Create TSV content
  const lines: string[] = [];
  lines.push(headers.join('\t'));

  normalizedData.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] ?? '';
      // Escape tabs and newlines in values
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    });
    lines.push(values.join('\t'));
  });

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log(`  ✓ Wrote ${normalizedData.length} rows to ${path.basename(filePath)}`);
}

/**
 * Checks if a row is a header/instruction row
 */
function isHeaderRow(row: any): boolean {
  const text = Object.values(row).join(' ').toLowerCase();
  return (
    text.includes('career cluster') ||
    text.includes('definition') ||
    text.includes('for more information') ||
    text.includes('for questions') ||
    text.includes('update') ||
    text.includes('workbook') ||
    text.includes('national career clusters') ||
    text.includes('framework crosswalk') ||
    text.length < 10
  );
}

/**
 * Process a single Excel file
 */
function processExcelFile(filePath: string, outputPrefix: string): void {
  console.log(`\nProcessing: ${path.basename(filePath)}`);

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  console.log(`  Found ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Filter out header/instruction rows
    const filtered = data.filter((row: any) => !isHeaderRow(row));

    if (filtered.length > 0) {
      const safeName = sheetName.replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `${outputPrefix}.${safeName}.tsv`;
      writeTSV(path.join(ADVANCECTE_DIR, filename), filtered);
    } else {
      console.log(`  ⚠️  Sheet "${sheetName}" has no data rows (only headers)`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Processing Advance CTE Excel files...\n');

  const files = [
    { path: 'Full_Framework_Crosswalk.xlsx', prefix: 'AdvanceCTE.FullCrosswalk' },
    { path: 'CIP_Career_Clusters_Crosswalk.xlsx', prefix: 'AdvanceCTE.CIP-CareerClusters' },
    { path: 'SOC_Career_Clusters_Crosswalk.xlsx', prefix: 'AdvanceCTE.SOC-CareerClusters' },
    { path: 'NAICS_Subclusters_Crosswalk.xlsx', prefix: 'AdvanceCTE.NAICS-CareerClusters' },
  ];

  for (const file of files) {
    const filePath = path.join(ADVANCECTE_DIR, file.path);
    if (fs.existsSync(filePath)) {
      processExcelFile(filePath, file.prefix);
    } else {
      console.log(`\n⚠️  File not found: ${file.path}`);
    }
  }

  console.log('\n✅ Processing complete!');
}

main();
