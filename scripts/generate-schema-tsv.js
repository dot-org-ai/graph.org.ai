#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, '.source/Schema.org');
const dataDir = path.join(projectRoot, '.data');

// Ensure .data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function processTypes() {
  console.log('Processing Types...');
  const inputPath = path.join(sourceDir, 'Schema.org.Types.tsv');
  const outputPath = path.join(dataDir, 'Types.tsv');

  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');

  if (lines.length === 0) {
    throw new Error('Types file is empty');
  }

  // Parse header
  const header = lines[0].split('\t');
  const idIndex = header.indexOf('id');
  const nameIndex = header.indexOf('name');
  const typeIndex = header.indexOf('type');

  console.log(`Header columns: ${header.join(', ')}`);
  console.log(`ID index: ${idIndex}, Name index: ${nameIndex}, Type index: ${typeIndex}`);

  // Check if 'type' column exists and what it contains
  let needsTypeColumn = false;
  if (typeIndex === -1) {
    needsTypeColumn = true;
    header.push('type');
  } else {
    // Check first data row to see what's in the type column
    if (lines.length > 1) {
      const firstRow = lines[1].split('\t');
      console.log(`First row type value: "${firstRow[typeIndex]}"`);
      // If it's "rdfs:Class", we should replace it with "Type"
      if (firstRow[typeIndex] === 'rdfs:Class') {
        needsTypeColumn = true;
      }
    }
  }

  // Process rows
  const outputLines = [header.join('\t')];
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const cols = lines[i].split('\t');

    if (needsTypeColumn) {
      if (typeIndex === -1) {
        // Add new type column
        cols.push('Type');
      } else {
        // Replace existing type column value
        cols[typeIndex] = 'Type';
      }
    }

    outputLines.push(cols.join('\t'));
    count++;
  }

  fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');
  console.log(`✓ Generated ${count} types`);

  // Show sample
  console.log('\nSample (first 5 types):');
  for (let i = 0; i < Math.min(6, outputLines.length); i++) {
    console.log(outputLines[i]);
  }

  return count;
}

function processProperties() {
  console.log('\n\nProcessing Properties...');
  const inputPath = path.join(sourceDir, 'Schema.org.Properties.tsv');
  const outputPath = path.join(dataDir, 'Properties.tsv');

  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');

  if (lines.length === 0) {
    throw new Error('Properties file is empty');
  }

  // Parse header
  const header = lines[0].split('\t');
  const idIndex = header.indexOf('id');
  const nameIndex = header.indexOf('name');
  const typeIndex = header.indexOf('type');

  console.log(`Header columns: ${header.join(', ')}`);
  console.log(`ID index: ${idIndex}, Name index: ${nameIndex}, Type index: ${typeIndex}`);

  // Check if 'type' column exists and what it contains
  let needsTypeColumn = false;
  if (typeIndex === -1) {
    needsTypeColumn = true;
    header.push('type');
  } else {
    // Check first data row to see what's in the type column
    if (lines.length > 1) {
      const firstRow = lines[1].split('\t');
      console.log(`First row type value: "${firstRow[typeIndex]}"`);
      // If it's "rdf:Property", we should replace it with "Property"
      if (firstRow[typeIndex] === 'rdf:Property') {
        needsTypeColumn = true;
      }
    }
  }

  // Process rows
  const outputLines = [header.join('\t')];
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const cols = lines[i].split('\t');

    if (needsTypeColumn) {
      if (typeIndex === -1) {
        // Add new type column
        cols.push('Property');
      } else {
        // Replace existing type column value
        cols[typeIndex] = 'Property';
      }
    }

    outputLines.push(cols.join('\t'));
    count++;
  }

  fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');
  console.log(`✓ Generated ${count} properties`);

  // Show sample
  console.log('\nSample (first 5 properties):');
  for (let i = 0; i < Math.min(6, outputLines.length); i++) {
    console.log(outputLines[i]);
  }

  return count;
}

try {
  const typeCount = processTypes();
  const propertyCount = processProperties();

  console.log('\n\n=== SUMMARY ===');
  console.log(`✓ Types generated: ${typeCount}`);
  console.log(`✓ Properties generated: ${propertyCount}`);
  console.log(`✓ Output directory: ${dataDir}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
