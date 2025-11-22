#!/usr/bin/env tsx

/**
 * Download BLS OES Metadata Files
 *
 * Downloads the metadata files needed to decode oe.data series IDs
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLS_DIR = path.join(PROJECT_ROOT, '.source', 'BLS');

const BASE_URL = 'https://download.bls.gov/pub/time.series/oe/';

const METADATA_FILES = [
  'oe.series',
  'oe.occupation',
  'oe.area',
  'oe.datatype',
  'oe.industry',
  'oe.seasonal',
  'oe.footnote',
];

async function downloadFile(filename: string): Promise<void> {
  const url = `${BASE_URL}${filename}`;
  const outputPath = path.join(BLS_DIR, filename);

  console.log(`  Downloading ${filename}...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`  ⚠️  Failed to download ${filename}: ${response.statusText}`);
      return;
    }

    const content = await response.text();
    fs.writeFileSync(outputPath, content, 'utf-8');

    const lines = content.split('\n').length - 1;
    console.log(`  ✅ Downloaded ${filename} (${lines.toLocaleString()} lines)`);
  } catch (error) {
    console.log(`  ❌ Error downloading ${filename}:`, error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('\n📦 Downloading BLS OES Metadata Files...\n');

  for (const file of METADATA_FILES) {
    await downloadFile(file);
  }

  console.log('\n✅ Download complete!\n');
}

main().catch(console.error);
