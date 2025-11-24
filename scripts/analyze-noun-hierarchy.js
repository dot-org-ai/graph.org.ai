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

// Build a map for quick lookup
const nounMap = {};
nouns.forEach(noun => {
  nounMap[noun.id] = noun;
});

// Find hierarchy examples at different depths
function getAncestors(id, visited = new Set()) {
  if (visited.has(id)) return [];
  visited.add(id);
  
  const noun = nounMap[id];
  if (!noun || !noun.parent) return [id];
  
  return [id, ...getAncestors(noun.parent, visited)];
}

console.log('=== HIERARCHY EXAMPLES ===\n');

// Find examples at each depth level
const depthExamples = {};
nouns.forEach(noun => {
  const ancestors = getAncestors(noun.id);
  const depth = ancestors.length - 1;
  
  if (!depthExamples[depth]) {
    depthExamples[depth] = [];
  }
  if (depthExamples[depth].length < 3) {
    depthExamples[depth].push({ noun, ancestors });
  }
});

Object.keys(depthExamples).sort((a, b) => parseInt(a) - parseInt(b)).forEach(depth => {
  console.log(`Depth ${depth}:`);
  depthExamples[depth].forEach(({ noun, ancestors }) => {
    const chain = ancestors.reverse().join(' -> ');
    console.log(`  ${noun.id} (${noun.source})`);
    console.log(`    Hierarchy: ${chain}`);
  });
  console.log();
});

// Most common parent classes with examples
console.log('=== TOP PARENT CLASSES WITH EXAMPLES ===\n');
const parentCounts = {};
nouns.forEach(noun => {
  if (noun.parent) {
    if (!parentCounts[noun.parent]) {
      parentCounts[noun.parent] = [];
    }
    if (parentCounts[noun.parent].length < 3) {
      parentCounts[noun.parent].push(noun.id);
    }
  }
});

Object.entries(parentCounts)
  .map(([parent, children]) => ({ parent, count: children.length, examples: children }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10)
  .forEach(({ parent, examples }) => {
    console.log(`${parent}:`);
    examples.forEach(ex => console.log(`  - ${ex}`));
    console.log();
  });

