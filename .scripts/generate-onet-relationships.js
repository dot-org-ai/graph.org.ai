#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = '/Users/nathanclevenger/projects/graph.org.ai/.source/ONET';
const dataDir = '/Users/nathanclevenger/projects/graph.org.ai/.data';

// Utility function to convert name to ID format
function nameToId(name) {
  return name
    .replace(/[\/,]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '');
}

// Parse TSV file
function parseTsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');

  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });
}

// Load entity lookup maps
function loadEntityMap(filename, keyField = 'elementID') {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Warning: ${filename} not found`);
    return new Map();
  }

  const data = parseTsv(filePath);
  const map = new Map();

  data.forEach(row => {
    // For files where id IS the elementID (like Skills, Abilities)
    if (keyField === 'id' && row.id) {
      map.set(row.id, row.id);
    }
    // For files with separate key field
    else if (row[keyField] && row.id) {
      map.set(row[keyField], row.id);
    }
    // Fallback to other fields
    else if ((row.elementID || row.code) && row.id) {
      map.set(row.elementID || row.code, row.id);
    }
  });

  return map;
}

// 1. Generate Tasks.Relationships.tsv
function generateTasksRelationships() {
  console.log('Generating Tasks.Relationships.tsv...');

  const tasksToDWAs = parseTsv(path.join(sourceDir, 'ONET.TasksToDWAs.tsv'));
  const tasksData = parseTsv(path.join(dataDir, 'Tasks.tsv'));
  const workActivitiesMap = loadEntityMap('WorkActivities.tsv', 'elementID');
  const dwaReference = parseTsv(path.join(sourceDir, 'ONET.DWAReference.tsv'));

  // Create task lookup by taskId
  const tasksMap = new Map();
  tasksData.forEach(row => {
    if (row.taskId && row.id) {
      // Store all task IDs for this taskId (there may be multiple)
      if (!tasksMap.has(row.taskId)) {
        tasksMap.set(row.taskId, []);
      }
      tasksMap.get(row.taskId).push(row.id);
    }
  });

  // Create DWA ID lookup
  const dwaIdMap = new Map();
  dwaReference.forEach(row => {
    if (row.dWAID) {
      // First try to get from workActivitiesMap using elementID
      const waId = workActivitiesMap.get(row.elementID);
      if (waId) {
        dwaIdMap.set(row.dWAID, waId);
      } else if (row.dWATitle) {
        // Fallback to name-based ID
        dwaIdMap.set(row.dWAID, nameToId(row.dWATitle));
      }
    }
  });

  const relationships = new Set();

  tasksToDWAs.forEach(row => {
    const taskId = row.taskID;
    const dwaId = row.dWAID;

    if (!taskId || !dwaId) return;

    // Get all task URL IDs for this taskId
    const taskUrlIds = tasksMap.get(taskId);
    const dwaUrlId = dwaIdMap.get(dwaId);

    if (taskUrlIds && dwaUrlId) {
      // Create relationship for each task variant
      taskUrlIds.forEach(taskUrlId => {
        relationships.add(`onet\t${taskUrlId}\t${dwaUrlId}\tcomposedOf\tpartOf`);
      });
    }
  });

  const output = 'ns\tfrom\tto\tpredicate\treverse\n' + Array.from(relationships).sort().join('\n');
  fs.writeFileSync(path.join(dataDir, 'Tasks.Relationships.tsv'), output);

  console.log(`Generated ${relationships.size} task → work activity relationships`);
  return relationships.size;
}

// 2. Generate WorkActivities.Relationships.tsv
function generateWorkActivitiesRelationships() {
  console.log('Generating WorkActivities.Relationships.tsv...');

  const relationships = new Set();

  // Load mappings
  const skillsToWA = parseTsv(path.join(sourceDir, 'ONET.SkillsToWorkActivities.tsv'));
  const abilitiesToWA = parseTsv(path.join(sourceDir, 'ONET.AbilitiesToWorkActivities.tsv'));
  const dwaReference = parseTsv(path.join(sourceDir, 'ONET.DWAReference.tsv'));
  const iwaReference = parseTsv(path.join(sourceDir, 'ONET.IWAReference.tsv'));

  const skillsMap = loadEntityMap('Skills.tsv', 'id');
  const abilitiesMap = loadEntityMap('Abilities.tsv', 'id');
  const workActivitiesMap = loadEntityMap('WorkActivities.tsv', 'elementID');

  // Skills → WorkActivities
  skillsToWA.forEach(row => {
    const skillId = skillsMap.get(row.skillsElementID);
    const waId = workActivitiesMap.get(row.workActivitiesElementID);

    if (skillId && waId) {
      relationships.add(`onet\t${waId}\t${skillId}\trequires\trequiredBy`);
    }
  });

  // Abilities → WorkActivities
  abilitiesToWA.forEach(row => {
    const abilityId = abilitiesMap.get(row.abilitiesElementID);
    const waId = workActivitiesMap.get(row.workActivitiesElementID);

    if (abilityId && waId) {
      relationships.add(`onet\t${waId}\t${abilityId}\trequires\trequiredBy`);
    }
  });

  // IWA → DWA hierarchy (DWAs are part of IWAs)
  const dwaToIwaMap = new Map();
  dwaReference.forEach(row => {
    if (row.dWAID && row.iWAID) {
      const dwaId = workActivitiesMap.get(row.elementID) || nameToId(row.dWATitle);
      const iwaTitle = iwaReference.find(i => i.iWAID === row.iWAID)?.iWATitle;
      const iwaId = workActivitiesMap.get(row.elementID) || (iwaTitle ? nameToId(iwaTitle) : null);

      if (dwaId && iwaId && dwaId !== iwaId) {
        relationships.add(`onet\t${dwaId}\t${iwaId}\tpartOf\tcomposedOf`);
      }
    }
  });

  const output = 'ns\tfrom\tto\tpredicate\treverse\n' + Array.from(relationships).sort().join('\n');
  fs.writeFileSync(path.join(dataDir, 'WorkActivities.Relationships.tsv'), output);

  console.log(`Generated ${relationships.size} work activity relationships`);
  return relationships.size;
}

// 3. Generate WorkContext.Relationships.tsv
function generateWorkContextRelationships() {
  console.log('Generating WorkContext.Relationships.tsv...');

  const workContext = parseTsv(path.join(sourceDir, 'ONET.WorkContext.tsv'));
  const occupationsMap = loadEntityMap('Occupations.tsv', 'code');
  const workContextMap = loadEntityMap('WorkContext.tsv', 'elementID');

  const relationships = new Set();

  workContext.forEach(row => {
    const occupationCode = row.oNETSOCCode;
    const contextElementId = row.elementID;

    // Find occupation URL ID
    const occupationId = occupationsMap.get(occupationCode);
    const contextId = workContextMap.get(contextElementId);

    if (occupationId && contextId) {
      relationships.add(`onet\t${occupationId}\t${contextId}\thasWorkContext\tworkContextOf`);
    }
  });

  const output = 'ns\tfrom\tto\tpredicate\treverse\n' + Array.from(relationships).sort().join('\n');
  fs.writeFileSync(path.join(dataDir, 'WorkContext.Relationships.tsv'), output);

  console.log(`Generated ${relationships.size} work context relationships`);
  return relationships.size;
}

// 4. Generate WorkStyles.Relationships.tsv
function generateWorkStylesRelationships() {
  console.log('Generating WorkStyles.Relationships.tsv...');

  const workStyles = parseTsv(path.join(sourceDir, 'ONET.WorkStyles.tsv'));
  const occupationsMap = loadEntityMap('Occupations.tsv', 'code');
  const workStylesMap = loadEntityMap('WorkStyles.tsv', 'elementID');

  const relationships = new Set();

  workStyles.forEach(row => {
    const occupationCode = row.oNETSOCCode;
    const styleElementId = row.elementID;

    const occupationId = occupationsMap.get(occupationCode);
    const styleId = workStylesMap.get(styleElementId);

    if (occupationId && styleId) {
      relationships.add(`onet\t${occupationId}\t${styleId}\trequiresWorkStyle\tworkStyleRequiredBy`);
    }
  });

  const output = 'ns\tfrom\tto\tpredicate\treverse\n' + Array.from(relationships).sort().join('\n');
  fs.writeFileSync(path.join(dataDir, 'WorkStyles.Relationships.tsv'), output);

  console.log(`Generated ${relationships.size} work style relationships`);
  return relationships.size;
}

// 5. Generate WorkValues.Relationships.tsv
function generateWorkValuesRelationships() {
  console.log('Generating WorkValues.Relationships.tsv...');

  const workValues = parseTsv(path.join(sourceDir, 'ONET.WorkValues.tsv'));
  const occupationsMap = loadEntityMap('Occupations.tsv', 'code');
  const workValuesMap = loadEntityMap('WorkValues.tsv', 'elementID');

  const relationships = new Set();

  workValues.forEach(row => {
    const occupationCode = row.oNETSOCCode;
    const valueElementId = row.elementID;

    const occupationId = occupationsMap.get(occupationCode);
    const valueId = workValuesMap.get(valueElementId);

    if (occupationId && valueId) {
      relationships.add(`onet\t${occupationId}\t${valueId}\tvalues\tvaluedBy`);
    }
  });

  const output = 'ns\tfrom\tto\tpredicate\treverse\n' + Array.from(relationships).sort().join('\n');
  fs.writeFileSync(path.join(dataDir, 'WorkValues.Relationships.tsv'), output);

  console.log(`Generated ${relationships.size} work value relationships`);
  return relationships.size;
}

// Main execution
function main() {
  console.log('Starting ONET relationship generation...\n');

  const results = {
    tasks: generateTasksRelationships(),
    workActivities: generateWorkActivitiesRelationships(),
    workContext: generateWorkContextRelationships(),
    workStyles: generateWorkStylesRelationships(),
    workValues: generateWorkValuesRelationships()
  };

  console.log('\n=== Summary ===');
  console.log(`Tasks: ${results.tasks} relationships`);
  console.log(`Work Activities: ${results.workActivities} relationships`);
  console.log(`Work Context: ${results.workContext} relationships`);
  console.log(`Work Styles: ${results.workStyles} relationships`);
  console.log(`Work Values: ${results.workValues} relationships`);
  console.log(`Total: ${Object.values(results).reduce((a, b) => a + b, 0)} relationships`);
}

main();
