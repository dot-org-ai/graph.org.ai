#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '.data');
const NOUNS_FILE = path.join(DATA_DIR, 'Nouns.tsv');

function parseTSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  return lines.slice(1).map(line => {
    const values = line.split('\t');
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || '';
      return obj;
    }, {});
  });
}

const content = fs.readFileSync(NOUNS_FILE, 'utf-8');
const nouns = parseTSV(content);

console.log('=== INTERESTING NOUNS SAMPLES ===\n');

// Sample by different characteristics
const samples = {
  'Tech & Software': nouns.filter(n => 
    n.source === 'app.org.ai' || 
    n.source === 'aimodel.org.ai' ||
    (n.source === 'schema.org' && (n.id.includes('Software') || n.id.includes('Web')))
  ).slice(0, 5),
  
  'Business & Organizations': nouns.filter(n => 
    n.source === 'business.org.ai' && n.parent !== 'Business'
  ).slice(0, 5),
  
  'Healthcare & Medical': nouns.filter(n => 
    n.source === 'schema.org' && (n.id.includes('Medical') || n.id.includes('Health'))
  ).slice(0, 5),
  
  'Places & Geography': nouns.filter(n => 
    n.source === 'place.org.ai'
  ).slice(0, 5),
  
  'Creative & Media': nouns.filter(n => 
    n.parent === 'CreativeWork' || n.description.toLowerCase().includes('creative')
  ).slice(0, 5),
  
  'Finance & Economics': nouns.filter(n => 
    n.description.toLowerCase().includes('financial') || 
    n.description.toLowerCase().includes('payment') ||
    n.description.toLowerCase().includes('economic')
  ).slice(0, 5)
};

Object.entries(samples).forEach(([category, items]) => {
  console.log(`${category}:`);
  items.forEach(item => {
    const desc = item.description.substring(0, 60);
    console.log(`  ${item.id}`);
    console.log(`    Source: ${item.source}, Parent: ${item.parent || 'none'}`);
    if (desc) console.log(`    ${desc}${item.description.length > 60 ? '...' : ''}`);
  });
  console.log();
});

// Find some interesting patterns
console.log('=== ONTOLOGY PATTERNS ===\n');

const sourceParentCombos = {};
nouns.forEach(n => {
  if (n.parent) {
    const key = `${n.source} -> ${n.parent}`;
    sourceParentCombos[key] = (sourceParentCombos[key] || 0) + 1;
  }
});

console.log('Most Common Source -> Parent Relationships:');
Object.entries(sourceParentCombos)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([combo, count]) => {
    console.log(`  ${combo}: ${count} nouns`);
  });

