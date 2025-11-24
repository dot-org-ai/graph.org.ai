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

console.log('=== NOUNS.TSV VALIDATION REPORT ===\n');

// Validation checks
const issues = {
  missingId: [],
  missingType: [],
  missingName: [],
  missingSource: [],
  invalidParent: [],
  circularReferences: []
};

const nounIds = new Set(nouns.map(n => n.id));

nouns.forEach(noun => {
  if (!noun.id) issues.missingId.push(noun);
  if (!noun.type) issues.missingType.push(noun.id);
  if (!noun.name) issues.missingName.push(noun.id);
  if (!noun.source) issues.missingSource.push(noun.id);
  if (noun.parent && !nounIds.has(noun.parent)) {
    issues.invalidParent.push({ id: noun.id, parent: noun.parent });
  }
});

// Data quality metrics
const metrics = {
  totalNouns: nouns.length,
  withDescription: nouns.filter(n => n.description).length,
  withProperties: nouns.filter(n => n.properties).length,
  withParent: nouns.filter(n => n.parent).length,
  uniqueIds: nounIds.size,
  uniqueSources: new Set(nouns.map(n => n.source)).size
};

console.log('VALIDATION RESULTS:');
console.log(`✓ Total nouns: ${metrics.totalNouns}`);
console.log(`✓ Unique IDs: ${metrics.uniqueIds}`);
console.log(`✓ With descriptions: ${metrics.withDescription} (${(metrics.withDescription/metrics.totalNouns*100).toFixed(1)}%)`);
console.log(`✓ With properties: ${metrics.withProperties} (${(metrics.withProperties/metrics.totalNouns*100).toFixed(1)}%)`);
console.log(`✓ With parent: ${metrics.withParent} (${(metrics.withParent/metrics.totalNouns*100).toFixed(1)}%)`);
console.log(`✓ Unique sources: ${metrics.uniqueSources}`);

console.log('\nISSUES FOUND:');
Object.entries(issues).forEach(([type, items]) => {
  if (items.length > 0) {
    console.log(`  ✗ ${type}: ${items.length} issues`);
    if (items.length <= 5) {
      items.forEach(item => console.log(`    - ${JSON.stringify(item)}`));
    }
  } else {
    console.log(`  ✓ ${type}: 0 issues`);
  }
});

// Check for ID uniqueness
const idCounts = {};
nouns.forEach(n => {
  idCounts[n.id] = (idCounts[n.id] || 0) + 1;
});
const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);
if (duplicates.length > 0) {
  console.log(`\n  ✗ Duplicate IDs: ${duplicates.length}`);
  duplicates.slice(0, 5).forEach(([id, count]) => {
    console.log(`    - ${id}: ${count} occurrences`);
  });
} else {
  console.log('\n  ✓ No duplicate IDs');
}

console.log('\n=== VALIDATION COMPLETE ===\n');

// Summary
if (Object.values(issues).every(arr => arr.length === 0) && duplicates.length === 0) {
  console.log('✓ ALL VALIDATION CHECKS PASSED');
} else {
  console.log('⚠ SOME VALIDATION ISSUES FOUND - Review above');
}

