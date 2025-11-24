#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = '/Users/nathanclevenger/projects/graph.org.ai/.source';
const DATA_DIR = '/Users/nathanclevenger/projects/graph.org.ai/.data';

// Helper to create URL-friendly ID from name
function createId(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');  // Trim hyphens from start/end
}

// Helper to escape TSV field
function escapeTsv(value) {
  if (!value) return '';
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
}

// Process UNSPSC codes
async function processUNSPSC() {
  const products = new Map();
  const serviceKeywords = ['service', 'consulting', 'training', 'support', 'maintenance', 'installation', 'repair'];

  console.log('Processing UNSPSC.Codes.tsv...');

  const fileStream = fs.createReadStream(path.join(SOURCE_DIR, 'UNSPSC/UNSPSC.Codes.tsv'));
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  let header = null;

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) {
      header = line.split('\t');
      continue;
    }

    const fields = line.split('\t');
    if (fields.length < 9) continue;

    const [segmentCode, segmentTitle, familyCode, familyTitle, classCode, classTitle, commodityCode, commodityTitle, definition] = fields;

    // Filter out pure services based on title keywords
    const titleLower = (commodityTitle || '').toLowerCase();
    const isService = serviceKeywords.some(keyword => titleLower.includes(keyword));

    // Skip if it's clearly a service
    if (isService) continue;

    // Add commodity level (most specific)
    if (commodityCode && commodityTitle) {
      const id = createId(commodityTitle);
      if (!products.has(id)) {
        products.set(id, {
          id,
          type: 'Product',
          name: escapeTsv(commodityTitle),
          code: commodityCode,
          source: 'UNSPSC',
          level: 'commodity',
          segment: escapeTsv(segmentTitle),
          segmentCode,
          family: escapeTsv(familyTitle),
          familyCode,
          class: escapeTsv(classTitle),
          classCode,
          definition: escapeTsv(definition)
        });
      }
    }
  }

  console.log(`  Extracted ${products.size} products from UNSPSC`);
  return products;
}

// Process GS1 Schema
async function processGS1() {
  const products = new Map();

  console.log('Processing GS1.Schema.tsv...');

  const fileStream = fs.createReadStream(path.join(SOURCE_DIR, 'GS1/GS1.Schema.tsv'));
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  let header = null;
  const bricks = new Map();

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) {
      header = line.split('\t');
      continue;
    }

    const fields = line.split('\t');
    if (fields.length < 19) continue;

    const [
      segmentCode, segmentTitle, segmentDefinition,
      familyCode, familyTitle, familyDefinition,
      classCode, classTitle, classDefinition,
      brickCode, brickTitle, brickIncludes, brickExcludes
    ] = fields;

    // Process at brick level (most specific product classification in GS1)
    if (brickCode && brickTitle && !bricks.has(brickCode)) {
      bricks.set(brickCode, true);

      const id = createId(brickTitle);
      if (!products.has(id)) {
        products.set(id, {
          id,
          type: 'Product',
          name: escapeTsv(brickTitle),
          code: brickCode,
          source: 'GS1',
          level: 'brick',
          segment: escapeTsv(segmentTitle),
          segmentCode,
          family: escapeTsv(familyTitle),
          familyCode,
          class: escapeTsv(classTitle),
          classCode,
          definition: escapeTsv(brickIncludes),
          excludes: escapeTsv(brickExcludes)
        });
      }
    }
  }

  console.log(`  Extracted ${products.size} products from GS1`);
  return products;
}

// Main processing function
async function generateProducts() {
  console.log('Generating unified Products.tsv...\n');

  const startTime = Date.now();

  // Process both sources
  const unspscProducts = await processUNSPSC();
  const gs1Products = await processGS1();

  // Combine products with source-prefixed IDs to avoid collisions
  const allProducts = new Map();

  // Add UNSPSC products with unspsc- prefix
  for (const [id, product] of unspscProducts) {
    product.id = `unspsc-${id}`;
    allProducts.set(product.id, product);
  }

  // Add GS1 products with gs1- prefix
  for (const [id, product] of gs1Products) {
    product.id = `gs1-${id}`;
    allProducts.set(product.id, product);
  }

  console.log('\nCombining results...');
  console.log(`  UNSPSC products: ${unspscProducts.size}`);
  console.log(`  GS1 products: ${gs1Products.size}`);
  console.log(`  Total products: ${allProducts.size}`);

  // Write to TSV file
  const outputPath = path.join(DATA_DIR, 'Products.tsv');
  const writeStream = fs.createWriteStream(outputPath);

  // Write header
  writeStream.write('id\ttype\tname\tcode\tsource\tlevel\tsegment\tsegmentCode\tfamily\tfamilyCode\tclass\tclassCode\tdefinition\texcludes\n');

  // Write products
  for (const [_, product] of allProducts) {
    const row = [
      product.id,
      product.type,
      product.name,
      product.code,
      product.source,
      product.level,
      product.segment || '',
      product.segmentCode || '',
      product.family || '',
      product.familyCode || '',
      product.class || '',
      product.classCode || '',
      product.definition || '',
      product.excludes || ''
    ].join('\t');
    writeStream.write(row + '\n');
  }

  writeStream.end();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\nGeneration complete in ${duration}s`);
  console.log(`Output: ${outputPath}`);

  // Get file size
  await new Promise(resolve => writeStream.on('finish', resolve));
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`File size: ${sizeMB} MB`);

  // Show some samples
  console.log('\nSample products (showing ID vs code separation):');
  let count = 0;
  for (const [_, product] of allProducts) {
    if (count < 5) {
      console.log(`  ID: ${product.id}`);
      console.log(`  Code: ${product.code}`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Source: ${product.source}`);
      console.log(`  Level: ${product.level}`);
      console.log('');
      count++;
    } else {
      break;
    }
  }
}

// Run the script
generateProducts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
