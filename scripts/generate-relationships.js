#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../.data');

// Helper to parse TSV
function parseTSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');

  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

// Helper to write TSV
function writeTSV(filePath, rows) {
  const headers = ['ns', 'from', 'to', 'predicate', 'reverse'];
  const lines = [headers.join('\t')];

  rows.forEach(row => {
    lines.push([
      row.ns || '',
      row.from || '',
      row.to || '',
      row.predicate || '',
      row.reverse || ''
    ].join('\t'));
  });

  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
  console.log(`Wrote ${rows.length} relationships to ${path.basename(filePath)}`);
}

// 1. Generate Verbs.Relationships.tsv
function generateVerbRelationships() {
  const verbs = parseTSV(path.join(dataDir, 'Verbs.tsv'));
  const relationships = [];

  verbs.forEach(verb => {
    if (verb.inverse && verb.inverse.trim()) {
      relationships.push({
        ns: 'Verbs',
        from: verb.id,
        to: verb.inverse,
        predicate: 'inverseOf',
        reverse: 'inverseOf'
      });
    }
  });

  writeTSV(path.join(dataDir, 'Verbs.Relationships.tsv'), relationships);
  return relationships.length;
}

// 2. Generate Industries.Relationships.tsv
function generateIndustryRelationships() {
  const industries = parseTSV(path.join(dataDir, 'Industries.tsv'));
  const relationships = [];

  // Group by code to handle the hierarchical structure
  const byCode = new Map();
  industries.forEach(ind => {
    const code = ind.code;
    if (code) {
      if (!byCode.has(code)) {
        byCode.set(code, []);
      }
      byCode.get(code).push(ind);
    }
  });

  // NAICS codes have hierarchical structure:
  // 2-digit (sector) -> 3-digit (subsector) -> 4-digit (industry group) -> 5-digit (industry) -> 6-digit (national industry)
  industries.forEach(ind => {
    const code = ind.code;
    if (!code) return;

    // Find parent code
    let parentCode = null;
    if (code.length === 6) {
      parentCode = code.substring(0, 5); // 6-digit -> 5-digit
    } else if (code.length === 5) {
      parentCode = code.substring(0, 4); // 5-digit -> 4-digit
    } else if (code.length === 4) {
      parentCode = code.substring(0, 3); // 4-digit -> 3-digit
    } else if (code.length === 3) {
      parentCode = code.substring(0, 2); // 3-digit -> 2-digit
    }

    if (parentCode && byCode.has(parentCode)) {
      // Find parent industries with this code
      const parents = byCode.get(parentCode);
      parents.forEach(parent => {
        relationships.push({
          ns: 'Industries',
          from: parent.id,
          to: ind.id,
          predicate: 'hasSubIndustry',
          reverse: 'partOfIndustry'
        });
      });
    }
  });

  writeTSV(path.join(dataDir, 'Industries.Relationships.tsv'), relationships);
  return relationships.length;
}

// 3. Generate Processes.Relationships.tsv
function generateProcessRelationships() {
  const processes = parseTSV(path.join(dataDir, 'Processes.tsv'));
  const relationships = [];

  // APQC hierarchyId structure: 1.0 -> 1.1 -> 1.1.1 -> 1.1.1.1
  const byHierarchy = new Map();
  processes.forEach(proc => {
    const hierarchyId = proc.hierarchyId;
    if (hierarchyId) {
      if (!byHierarchy.has(hierarchyId)) {
        byHierarchy.set(hierarchyId, []);
      }
      byHierarchy.get(hierarchyId).push(proc);
    }
  });

  processes.forEach(proc => {
    const hierarchyId = proc.hierarchyId;
    if (!hierarchyId) return;

    // Find parent hierarchy ID
    const parts = hierarchyId.split('.');
    if (parts.length > 1) {
      const parentParts = parts.slice(0, -1);
      const parentHierarchyId = parentParts.join('.');

      if (byHierarchy.has(parentHierarchyId)) {
        const parents = byHierarchy.get(parentHierarchyId);
        parents.forEach(parent => {
          relationships.push({
            ns: 'Processes',
            from: parent.id,
            to: proc.id,
            predicate: 'hasSubProcess',
            reverse: 'partOfProcess'
          });
        });
      }
    }
  });

  writeTSV(path.join(dataDir, 'Processes.Relationships.tsv'), relationships);
  return relationships.length;
}

// 4. Generate Concepts.Relationships.tsv
function generateConceptRelationships() {
  const concepts = parseTSV(path.join(dataDir, 'Concepts.tsv'));
  const relationships = [];

  concepts.forEach(concept => {
    // Link to source ontologies
    if (concept.source) {
      const sources = concept.source.split(',').map(s => s.trim());
      sources.forEach(source => {
        if (source === 'APQC PCF 7.0') {
          relationships.push({
            ns: 'Concepts',
            from: concept.id,
            to: 'APQC',
            predicate: 'definedIn',
            reverse: 'defines'
          });
        } else if (source === 'ONET' || source.startsWith('O*NET')) {
          relationships.push({
            ns: 'Concepts',
            from: concept.id,
            to: 'ONET',
            predicate: 'definedIn',
            reverse: 'defines'
          });
        } else if (source.startsWith('Schema.org')) {
          relationships.push({
            ns: 'Concepts',
            from: concept.id,
            to: 'SchemaOrg',
            predicate: 'definedIn',
            reverse: 'defines'
          });
        }
      });
    }

    // Link to occupations
    if (concept.occupations) {
      const occupations = concept.occupations.split(',').map(o => o.trim()).filter(o => o);
      occupations.forEach(occupation => {
        relationships.push({
          ns: 'Concepts',
          from: concept.id,
          to: occupation,
          predicate: 'usedByOccupation',
          reverse: 'usesConcept'
        });
      });
    }

    // Link to industries
    if (concept.industries) {
      const industries = concept.industries.split(',').map(i => i.trim()).filter(i => i);
      industries.forEach(industry => {
        relationships.push({
          ns: 'Concepts',
          from: concept.id,
          to: industry,
          predicate: 'usedByIndustry',
          reverse: 'usesConcept'
        });
      });
    }

    // Link to processes
    if (concept.processes) {
      const processes = concept.processes.split(',').map(p => p.trim()).filter(p => p);
      processes.forEach(process => {
        // Find the process ID by name
        relationships.push({
          ns: 'Concepts',
          from: concept.id,
          to: process.replace(/\s+/g, ''),
          predicate: 'usedInProcess',
          reverse: 'usesConcept'
        });
      });
    }

    // Link to tasks
    if (concept.tasks) {
      const tasks = concept.tasks.split(',').map(t => t.trim()).filter(t => t);
      tasks.forEach(task => {
        relationships.push({
          ns: 'Concepts',
          from: concept.id,
          to: task.replace(/\s+/g, ''),
          predicate: 'usedInTask',
          reverse: 'usesConcept'
        });
      });
    }
  });

  writeTSV(path.join(dataDir, 'Concepts.Relationships.tsv'), relationships);
  return relationships.length;
}

// Main execution
console.log('Generating relationship files...\n');

const counts = {
  verbs: generateVerbRelationships(),
  industries: generateIndustryRelationships(),
  processes: generateProcessRelationships(),
  concepts: generateConceptRelationships()
};

console.log('\n=== Summary ===');
console.log(`Verbs relationships: ${counts.verbs}`);
console.log(`Industries relationships: ${counts.industries}`);
console.log(`Processes relationships: ${counts.processes}`);
console.log(`Concepts relationships: ${counts.concepts}`);
console.log(`Total relationships: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
