#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and process Apps file
const appsPath = path.join(__dirname, '../.source/Integrations/Integrations.Apps.tsv');
const servicesPath = path.join(__dirname, '../.source/Integrations/Integrations.Services.tsv');

const appsOutputPath = path.join(__dirname, '../.data/Apps.tsv');
const servicesOutputPath = path.join(__dirname, '../.data/IntegrationServices.tsv');

// Function to convert app name to ID
function nameToId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Function to determine type for Apps
function getAppType(name, key) {
  // Apps that are native Zapier tools/utilities are "Integration"
  const zapierTools = [
    'filter', 'formatter', 'webhook', 'schedule', 'paths',
    'code', 'delay', 'ai', 'looping', 'email-parser',
    'rss', 'email', 'sms', 'zapier-tables'
  ];

  if (zapierTools.includes(key) || name.toLowerCase().includes('by zapier')) {
    return 'Integration';
  }

  return 'App';
}

// Process Apps
function processApps() {
  console.log('Processing Apps...');
  const content = fs.readFileSync(appsPath, 'utf-8');
  const lines = content.split('\n');

  if (lines.length === 0) {
    console.error('Apps file is empty');
    return 0;
  }

  // Get header and add new columns
  const header = lines[0];
  const newHeader = `id\ttype\t${header}`;

  const outputLines = [newHeader];

  // Process each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split('\t');
    if (columns.length < 2) continue;

    const key = columns[0];
    const name = columns[1];

    const id = nameToId(name);
    const type = getAppType(name, key);

    outputLines.push(`${id}\t${type}\t${line}`);
  }

  fs.writeFileSync(appsOutputPath, outputLines.join('\n'), 'utf-8');
  console.log(`Wrote ${outputLines.length - 1} apps to ${appsOutputPath}`);

  return outputLines.length - 1;
}

// Process Services
function processServices() {
  console.log('Processing Integration Services...');
  const content = fs.readFileSync(servicesPath, 'utf-8');
  const lines = content.split('\n');

  if (lines.length === 0) {
    console.error('Services file is empty');
    return 0;
  }

  // Get header and add new columns
  const header = lines[0];
  const newHeader = `id\ttype\t${header}`;

  const outputLines = [newHeader];

  // Process each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split('\t');
    if (columns.length < 2) continue;

    const key = columns[0];
    const name = columns[1];

    const id = nameToId(name);
    const type = 'IntegrationService';

    outputLines.push(`${id}\t${type}\t${line}`);
  }

  fs.writeFileSync(servicesOutputPath, outputLines.join('\n'), 'utf-8');
  console.log(`Wrote ${outputLines.length - 1} integration services to ${servicesOutputPath}`);

  return outputLines.length - 1;
}

// Display sample rows
function displaySample(filePath, label, count = 5) {
  console.log(`\n${label} - First ${count} rows:`);
  console.log('='.repeat(80));

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < Math.min(count + 1, lines.length); i++) {
    console.log(lines[i]);
  }
  console.log('');
}

// Main execution
try {
  const appsCount = processApps();
  const servicesCount = processServices();

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Apps generated: ${appsCount}`);
  console.log(`Total Integration Services generated: ${servicesCount}`);

  displaySample(appsOutputPath, 'APPS SAMPLE', 5);
  displaySample(servicesOutputPath, 'INTEGRATION SERVICES SAMPLE', 5);

} catch (error) {
  console.error('Error processing files:', error);
  process.exit(1);
}
