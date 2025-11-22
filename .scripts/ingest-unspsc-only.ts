#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

const SOURCE_DIR = '.source'
const UNSPSC_DIR = path.join(SOURCE_DIR, 'UNSPSC')

function writeTSV(filepath: string, data: any[]) {
  if (data.length === 0) {
    console.log(`  ⚠️  No data to write to ${path.basename(filepath)}`);
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(h => obj[h] ?? '').join('\t'));
  const tsv = [headers.join('\t'), ...rows].join('\n');

  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, tsv, 'utf-8');
  console.log(`   Wrote ${data.length} rows to ${path.relative(SOURCE_DIR, filepath)}`);
}

async function fetchBinary(url: string, useBrowserHeaders = false): Promise<ArrayBuffer> {
  const headers: Record<string, string> = {};

  if (useBrowserHeaders) {
    headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return await response.arrayBuffer();
}

async function ingestUNSPSC() {
  console.log('\n📦 Ingesting UNSPSC Products/Services...');

  try {
    const url = 'https://www.undp.org/sites/g/files/zskgke326/files/2025-03/unspsc-english-v260801.1.xlsx';

    console.log(`  Fetching: ${url}`);
    const buffer = await fetchBinary(url, true);

    // Parse XLSX file
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`  ℹ️  Found ${data.length} rows in UNSPSC XLSX`);

    // Skip copyright rows (first 6 rows) and use proper column mapping
    // Columns: __EMPTY_2=Segment, UNSPSC UNv260801=Segment Title, __EMPTY_4=Family, __EMPTY_5=Family Title,
    //          __EMPTY_7=Class, __EMPTY_8=Class Title, __EMPTY_10=Commodity, __EMPTY_11=Commodity Title, __EMPTY_12=Commodity Definition
    const codes = data.slice(6).map((row: any) => ({
      segmentCode: row['__EMPTY_2'] || '',
      segmentTitle: row['UNSPSC UNv260801'] || '',
      familyCode: row['__EMPTY_4'] || '',
      familyTitle: row['__EMPTY_5'] || '',
      classCode: row['__EMPTY_7'] || '',
      classTitle: row['__EMPTY_8'] || '',
      commodityCode: row['__EMPTY_10'] || '',
      commodityTitle: row['__EMPTY_11'] || '',
      definition: row['__EMPTY_12'] || '',
    })).filter(row => row.segmentCode || row.familyCode || row.classCode || row.commodityCode);

    console.log(`  ℹ️  Filtered to ${codes.length} valid rows`);

    // Show a sample
    console.log(`  ℹ️  Sample row:`, codes[0]);

    writeTSV(path.join(UNSPSC_DIR, 'UNSPSC.Codes.tsv'), codes);

  } catch (error) {
    console.error('  ❌ Error ingesting UNSPSC:', error);
  }
}

ingestUNSPSC()
