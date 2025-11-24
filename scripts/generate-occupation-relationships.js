#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = '/Users/nathanclevenger/projects/graph.org.ai';
const SOURCE_DIR = path.join(BASE_DIR, '.source/ONET');
const DATA_DIR = path.join(BASE_DIR, '.data');

// Helper to convert text to name-based ID
function toNameId(text) {
  return text
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

// Load occupation mapping from SOC code to name
function loadOccupationMapping() {
  console.log('Loading occupation mapping...');
  const content = fs.readFileSync(path.join(SOURCE_DIR, 'ONET.OccupationData.tsv'), 'utf8');
  const lines = content.split('\n');
  const mapping = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('\t');
    if (parts.length >= 2) {
      const socCode = parts[0];
      const title = parts[1];
      mapping.set(socCode, toNameId(title));
    }
  }

  console.log(`Loaded ${mapping.size} occupation mappings`);
  return mapping;
}

// Parse TSV file
function parseTsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split('\t').map(h => h.trim().replace(/^→/, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split('\t').map(v => v.trim().replace(/^→/, ''));
    if (values.length > 0 && values[0]) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return { headers, rows };
}

// Write relationships to TSV
function writeRelationships(filePath, relationships) {
  const header = 'ns\tfrom\tto\tpredicate\treverse\n';
  const lines = relationships.map(r =>
    `${r.ns}\t${r.from}\t${r.to}\t${r.predicate}\t${r.reverse}`
  ).join('\n');

  fs.writeFileSync(filePath, header + lines + '\n', 'utf8');
}

// Generate Occupations.Relationships.tsv
function generateOccupationRelationships(occupationMapping) {
  console.log('\nGenerating Occupations.Relationships.tsv...');
  const relationships = [];

  // Related Occupations
  const relatedOccupations = parseTsv(path.join(SOURCE_DIR, 'ONET.RelatedOccupations.tsv'));
  for (const row of relatedOccupations.rows) {
    const fromOcc = occupationMapping.get(row.oNETSOCCode);
    const toOcc = occupationMapping.get(row.relatedONETSOCCode);

    if (fromOcc && toOcc) {
      relationships.push({
        ns: 'onet',
        from: fromOcc,
        to: toOcc,
        predicate: 'relatedTo',
        reverse: 'relatedTo'
      });
    }
  }

  // Knowledge relationships
  const knowledge = parseTsv(path.join(SOURCE_DIR, 'ONET.Knowledge.tsv'));
  const knowledgeMap = new Map();
  for (const row of knowledge.rows) {
    const occ = occupationMapping.get(row.oNETSOCCode);
    const knowledgeName = toNameId(row.elementName);

    if (occ && knowledgeName) {
      const key = `${occ}|${knowledgeName}`;
      if (!knowledgeMap.has(key)) {
        knowledgeMap.set(key, true);
        relationships.push({
          ns: 'onet',
          from: occ,
          to: knowledgeName,
          predicate: 'requires',
          reverse: 'requiredBy'
        });
      }
    }
  }

  // Skills relationships
  const skills = parseTsv(path.join(SOURCE_DIR, 'ONET.Skills.tsv'));
  const skillsMap = new Map();
  for (const row of skills.rows) {
    const occ = occupationMapping.get(row.oNETSOCCode);
    const skillName = toNameId(row.elementName);

    if (occ && skillName) {
      const key = `${occ}|${skillName}`;
      if (!skillsMap.has(key)) {
        skillsMap.set(key, true);
        relationships.push({
          ns: 'onet',
          from: occ,
          to: skillName,
          predicate: 'requires',
          reverse: 'requiredBy'
        });
      }
    }
  }

  // Abilities relationships
  const abilities = parseTsv(path.join(SOURCE_DIR, 'ONET.Abilities.tsv'));
  const abilitiesMap = new Map();
  for (const row of abilities.rows) {
    const occ = occupationMapping.get(row.oNETSOCCode);
    const abilityName = toNameId(row.elementName);

    if (occ && abilityName) {
      const key = `${occ}|${abilityName}`;
      if (!abilitiesMap.has(key)) {
        abilitiesMap.set(key, true);
        relationships.push({
          ns: 'onet',
          from: occ,
          to: abilityName,
          predicate: 'requires',
          reverse: 'requiredBy'
        });
      }
    }
  }

  writeRelationships(path.join(DATA_DIR, 'Occupations.Relationships.tsv'), relationships);
  console.log(`Generated ${relationships.length} occupation relationships`);
  return relationships.length;
}

// Generate Tools.Relationships.tsv
function generateToolRelationships(occupationMapping) {
  console.log('\nGenerating Tools.Relationships.tsv...');
  const relationships = [];
  const uniqueMap = new Map();

  const toolsUsed = parseTsv(path.join(SOURCE_DIR, 'ONET.ToolsUsed.tsv'));

  for (const row of toolsUsed.rows) {
    const occ = occupationMapping.get(row.oNETSOCCode);
    const toolName = toNameId(row.example);

    if (occ && toolName) {
      const key = `${occ}|${toolName}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, true);
        relationships.push({
          ns: 'onet',
          from: occ,
          to: toolName,
          predicate: 'uses',
          reverse: 'usedBy'
        });
      }
    }
  }

  writeRelationships(path.join(DATA_DIR, 'Tools.Relationships.tsv'), relationships);
  console.log(`Generated ${relationships.length} tool relationships`);
  return relationships.length;
}

// Generate Technologies.Relationships.tsv
function generateTechnologyRelationships(occupationMapping) {
  console.log('\nGenerating Technologies.Relationships.tsv...');
  const relationships = [];
  const uniqueMap = new Map();

  const techSkills = parseTsv(path.join(SOURCE_DIR, 'ONET.TechnologySkills.tsv'));

  for (const row of techSkills.rows) {
    const occ = occupationMapping.get(row.oNETSOCCode);
    const techName = toNameId(row.example);

    if (occ && techName) {
      const key = `${occ}|${techName}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, true);
        relationships.push({
          ns: 'onet',
          from: occ,
          to: techName,
          predicate: 'uses',
          reverse: 'usedBy'
        });
      }
    }
  }

  writeRelationships(path.join(DATA_DIR, 'Technologies.Relationships.tsv'), relationships);
  console.log(`Generated ${relationships.length} technology relationships`);
  return relationships.length;
}

// Main execution
function main() {
  console.log('Starting occupation relationship generation...\n');

  // Ensure output directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const occupationMapping = loadOccupationMapping();

  const occCount = generateOccupationRelationships(occupationMapping);
  const toolCount = generateToolRelationships(occupationMapping);
  const techCount = generateTechnologyRelationships(occupationMapping);

  console.log('\n=== Summary ===');
  console.log(`Occupations.Relationships.tsv: ${occCount} relationships`);
  console.log(`Tools.Relationships.tsv: ${toolCount} relationships`);
  console.log(`Technologies.Relationships.tsv: ${techCount} relationships`);
  console.log(`Total: ${occCount + toolCount + techCount} relationships`);
}

main();
