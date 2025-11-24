#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '.data');
const OUTPUT_FILE = path.join(DATA_DIR, 'Nouns.tsv');

// Helper to parse TSV
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

// Helper to read TSV file
function readTSV(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filename} not found`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseTSV(content);
}

// Main function to generate nouns
function generateNouns() {
  const nouns = [];
  const stats = {
    sources: {},
    totalNouns: 0,
    hierarchyDepth: {},
    parentCounts: {}
  };

  // 1. Schema.org Types
  console.log('Processing Schema.org types...');
  const types = readTSV('Types.tsv');
  types.forEach(type => {
    const id = type.id.replace('schema:', '');
    nouns.push({
      id,
      type: 'Noun',
      name: type.name || type.label || id,
      description: (type.comment || '').replace(/\n/g, ' ').substring(0, 500),
      source: 'schema.org',
      properties: '',
      parent: type.subClassOf ? type.subClassOf.replace('schema:', '').split(',')[0] : ''
    });
    stats.sources['schema.org'] = (stats.sources['schema.org'] || 0) + 1;
  });

  // 2. Business Types
  console.log('Processing Business types...');
  const businessTypes = readTSV('BusinessTypes.tsv');
  businessTypes.forEach(bt => {
    nouns.push({
      id: bt.id,
      type: 'Noun',
      name: bt.id,
      description: bt.description || '',
      source: 'business.org.ai',
      properties: bt.properties || bt.keyCharacteristics || '',
      parent: bt.baseNoun || 'Business'
    });
    stats.sources['business.org.ai'] = (stats.sources['business.org.ai'] || 0) + 1;
  });

  // 3. Occupations (ONET/SOC)
  console.log('Processing Occupations...');
  const occupations = readTSV('Occupations.tsv');
  occupations.forEach(occ => {
    nouns.push({
      id: occ.id,
      type: 'Noun',
      name: occ.name,
      description: occ.description || '',
      source: 'onet.org.ai',
      properties: `code:${occ.code}`,
      parent: 'Occupation'
    });
    stats.sources['onet.org.ai'] = (stats.sources['onet.org.ai'] || 0) + 1;
  });

  // 4. Industries (NAICS)
  console.log('Processing Industries...');
  const industries = readTSV('Industries.tsv');
  industries.forEach(ind => {
    nouns.push({
      id: ind.id,
      type: 'Noun',
      name: ind.name,
      description: ind.description || '',
      source: 'naics.org.ai',
      properties: `code:${ind.code}`,
      parent: 'Industry'
    });
    stats.sources['naics.org.ai'] = (stats.sources['naics.org.ai'] || 0) + 1;
  });

  // 5. Departments
  console.log('Processing Departments...');
  const departments = readTSV('Departments.tsv');
  departments.forEach(dept => {
    nouns.push({
      id: dept.id,
      type: 'Noun',
      name: dept.id.replace('Department', ' Department'),
      description: dept.description || '',
      source: 'business.org.ai',
      properties: dept.keyFunctions || '',
      parent: 'Department'
    });
    stats.sources['business.org.ai'] = (stats.sources['business.org.ai'] || 0) + 1;
  });

  // 6. Career Clusters
  console.log('Processing Career Clusters...');
  const clusters = readTSV('CareerClusters.tsv');
  clusters.forEach(cluster => {
    nouns.push({
      id: cluster.id,
      type: 'Noun',
      name: cluster.name,
      description: cluster.description || '',
      source: 'careercluster.org.ai',
      properties: `subclusters:${cluster.subclusters},soc_count:${cluster.soc_count}`,
      parent: 'CareerCluster'
    });
    stats.sources['careercluster.org.ai'] = (stats.sources['careercluster.org.ai'] || 0) + 1;
  });

  // 7. Apps
  console.log('Processing Apps...');
  const apps = readTSV('Apps.tsv');
  apps.forEach(app => {
    nouns.push({
      id: app.id,
      type: 'Noun',
      name: app.name,
      description: (app.description || '').substring(0, 500),
      source: 'app.org.ai',
      properties: `category:${app.category}`,
      parent: 'App'
    });
    stats.sources['app.org.ai'] = (stats.sources['app.org.ai'] || 0) + 1;
  });

  // 8. AI Models
  console.log('Processing AI Models...');
  const models = readTSV('Models.tsv');
  models.forEach(model => {
    nouns.push({
      id: model.id,
      type: 'Noun',
      name: model.name,
      description: (model.description || '').substring(0, 500),
      source: 'aimodel.org.ai',
      properties: `architecture:${model.architecture},context:${model.contextLength}`,
      parent: 'AIModel'
    });
    stats.sources['aimodel.org.ai'] = (stats.sources['aimodel.org.ai'] || 0) + 1;
  });

  // 9. Concepts
  console.log('Processing Concepts...');
  const concepts = readTSV('Concepts.tsv');
  concepts.forEach(concept => {
    nouns.push({
      id: concept.id,
      type: 'Noun',
      name: concept.id,
      description: concept.description || '',
      source: 'concept.org.ai',
      properties: `category:${concept.category}`,
      parent: concept.baseNoun || 'Concept'
    });
    stats.sources['concept.org.ai'] = (stats.sources['concept.org.ai'] || 0) + 1;
  });

  // 10. Countries
  console.log('Processing Countries...');
  const countries = readTSV('Countries.tsv');
  countries.forEach(country => {
    nouns.push({
      id: country.id,
      type: 'Noun',
      name: country.Country,
      description: `Country: ${country.Country}, Capital: ${country.Capital}, Continent: ${country.Continent}`,
      source: 'place.org.ai',
      properties: `iso:${country.ISO},capital:${country.Capital},continent:${country.Continent}`,
      parent: 'Country'
    });
    stats.sources['place.org.ai'] = (stats.sources['place.org.ai'] || 0) + 1;
  });

  // 11. States
  console.log('Processing States...');
  const states = readTSV('States.tsv');
  states.forEach(state => {
    nouns.push({
      id: state.id,
      type: 'Noun',
      name: state.name,
      description: `State: ${state.name}, Code: ${state.code}`,
      source: 'place.org.ai',
      properties: `code:${state.code},country:${state.country}`,
      parent: 'State'
    });
    stats.sources['place.org.ai'] = (stats.sources['place.org.ai'] || 0) + 1;
  });

  // Add meta nouns (top-level classes)
  const metaNouns = [
    { id: 'Thing', name: 'Thing', description: 'The most generic type of item', source: 'schema.org', parent: '' },
    { id: 'Occupation', name: 'Occupation', description: 'A job or profession', source: 'onet.org.ai', parent: 'Thing' },
    { id: 'Industry', name: 'Industry', description: 'A category of economic activity', source: 'naics.org.ai', parent: 'Thing' },
    { id: 'Business', name: 'Business', description: 'An organization engaged in commercial activities', source: 'business.org.ai', parent: 'Organization' },
    { id: 'Department', name: 'Department', description: 'A specialized division within an organization', source: 'business.org.ai', parent: 'Thing' },
    { id: 'CareerCluster', name: 'Career Cluster', description: 'A grouping of occupations and industries', source: 'careercluster.org.ai', parent: 'Thing' },
    { id: 'App', name: 'Application', description: 'A software application or service', source: 'app.org.ai', parent: 'SoftwareApplication' },
    { id: 'AIModel', name: 'AI Model', description: 'An artificial intelligence model', source: 'aimodel.org.ai', parent: 'ComputationalModel' },
    { id: 'Concept', name: 'Concept', description: 'An abstract idea or notion', source: 'concept.org.ai', parent: 'Thing' },
    { id: 'Country', name: 'Country', description: 'A sovereign nation state', source: 'place.org.ai', parent: 'Place' },
    { id: 'State', name: 'State', description: 'A sub-national administrative division', source: 'place.org.ai', parent: 'Place' }
  ];

  metaNouns.forEach(mn => {
    nouns.unshift({
      id: mn.id,
      type: 'Noun',
      name: mn.name,
      description: mn.description,
      source: mn.source,
      properties: '',
      parent: mn.parent
    });
  });

  // Calculate statistics
  stats.totalNouns = nouns.length;

  // Count parent frequencies
  nouns.forEach(noun => {
    if (noun.parent) {
      stats.parentCounts[noun.parent] = (stats.parentCounts[noun.parent] || 0) + 1;
    }
  });

  // Calculate hierarchy depth
  function getDepth(id, visited = new Set()) {
    if (visited.has(id)) return 0; // circular reference
    visited.add(id);

    const noun = nouns.find(n => n.id === id);
    if (!noun || !noun.parent) return 0;
    return 1 + getDepth(noun.parent, visited);
  }

  nouns.forEach(noun => {
    const depth = getDepth(noun.id);
    stats.hierarchyDepth[depth] = (stats.hierarchyDepth[depth] || 0) + 1;
  });

  // Write TSV file
  console.log('\nWriting Nouns.tsv...');
  const headers = ['id', 'type', 'name', 'description', 'source', 'properties', 'parent'];
  const tsvContent = [
    headers.join('\t'),
    ...nouns.map(noun => headers.map(h => noun[h] || '').join('\t'))
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, tsvContent, 'utf-8');

  // Print statistics
  console.log('\n=== NOUNS GENERATION REPORT ===\n');
  console.log(`Total Nouns: ${stats.totalNouns.toLocaleString()}`);
  console.log('\nNouns by Source:');
  Object.entries(stats.sources)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`  ${source}: ${count.toLocaleString()}`);
    });

  console.log('\nMost Common Parent Classes:');
  Object.entries(stats.parentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([parent, count]) => {
      console.log(`  ${parent}: ${count.toLocaleString()}`);
    });

  console.log('\nHierarchy Depth Distribution:');
  Object.entries(stats.hierarchyDepth)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([depth, count]) => {
      console.log(`  Depth ${depth}: ${count.toLocaleString()} nouns`);
    });

  // Sample nouns from different sources
  console.log('\n=== SAMPLE NOUNS ===\n');
  const sampleSources = ['schema.org', 'onet.org.ai', 'naics.org.ai', 'business.org.ai', 'app.org.ai'];
  sampleSources.forEach(source => {
    const samples = nouns.filter(n => n.source === source).slice(0, 3);
    if (samples.length > 0) {
      console.log(`${source}:`);
      samples.forEach(s => {
        console.log(`  - ${s.id}: ${s.name} (parent: ${s.parent || 'none'})`);
      });
      console.log();
    }
  });

  console.log(`\nOutput written to: ${OUTPUT_FILE}`);
  console.log('Done!\n');
}

// Run the script
try {
  generateNouns();
} catch (error) {
  console.error('Error generating nouns:', error);
  process.exit(1);
}
