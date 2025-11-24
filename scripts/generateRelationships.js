#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../.data');

// Helper to read TSV file
function readTSV(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }
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

// Helper to write TSV file
function writeTSV(filename, headers, rows) {
  const filePath = path.join(dataDir, filename);
  const content = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
  fs.writeFileSync(filePath, content);
  console.log(`✓ Generated ${filename} with ${rows.length} relationships`);
  return rows.length;
}

// 1. Generate Types.Relationships.tsv
function generateTypesRelationships() {
  const types = readTSV('Types.tsv');
  const relationships = [];

  types.forEach(type => {
    if (type.subClassOf && type.subClassOf.trim()) {
      const from = type.id || type.name;
      const to = type.subClassOf;
      relationships.push(['schema', from, to, 'subClassOf', 'superClassOf']);
    }
  });

  return writeTSV('Types.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// 2. Generate Properties.Relationships.tsv
function generatePropertiesRelationships() {
  const properties = readTSV('Properties.tsv');
  const relationships = [];

  properties.forEach(prop => {
    const propId = prop.id || prop.name;

    // Handle domainIncludes (property belongs to these types)
    if (prop.domainIncludes && prop.domainIncludes.trim()) {
      const domains = prop.domainIncludes.split(',').map(d => d.trim()).filter(Boolean);
      domains.forEach(domain => {
        relationships.push(['schema', propId, domain, 'domainIncludes', 'hasDomainProperty']);
      });
    }

    // Handle rangeIncludes (property values are of these types)
    if (prop.rangeIncludes && prop.rangeIncludes.trim()) {
      const ranges = prop.rangeIncludes.split(',').map(r => r.trim()).filter(Boolean);
      ranges.forEach(range => {
        relationships.push(['schema', propId, range, 'rangeIncludes', 'hasRangeProperty']);
      });
    }

    // Handle subPropertyOf
    if (prop.subClassOf && prop.subClassOf.trim()) {
      relationships.push(['schema', propId, prop.subClassOf, 'subPropertyOf', 'superPropertyOf']);
    }
  });

  return writeTSV('Properties.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// 3. Generate Products.Relationships.tsv
function generateProductsRelationships() {
  const products = readTSV('Products.tsv');
  const relationships = [];

  // Group by hierarchy levels
  const bySegment = {};
  const byFamily = {};
  const byClass = {};

  products.forEach(product => {
    const prodId = product.id || product.name;
    const level = product.level;

    if (level === 'commodity') {
      // Commodity -> Class
      if (product.classCode && product.class) {
        const classId = `unspsc-class-${product.classCode}`;
        relationships.push(['unspsc', prodId, classId, 'partOfProductCategory', 'hasSubProduct']);

        // Store class info
        if (!byClass[product.classCode]) {
          byClass[product.classCode] = {
            id: classId,
            name: product.class,
            familyCode: product.familyCode,
            family: product.family
          };
        }
      }
    }
  });

  // Class -> Family relationships
  Object.values(byClass).forEach(classInfo => {
    if (classInfo.familyCode && classInfo.family) {
      const familyId = `unspsc-family-${classInfo.familyCode}`;
      relationships.push(['unspsc', classInfo.id, familyId, 'partOfProductCategory', 'hasSubProduct']);

      if (!byFamily[classInfo.familyCode]) {
        byFamily[classInfo.familyCode] = {
          id: familyId,
          name: classInfo.family
        };
      }
    }
  });

  // Extract segment info from products
  products.forEach(product => {
    if (product.segmentCode && product.segment) {
      const familyId = `unspsc-family-${product.familyCode}`;
      const segmentId = `unspsc-segment-${product.segmentCode}`;

      if (!bySegment[product.segmentCode]) {
        bySegment[product.segmentCode] = {
          id: segmentId,
          name: product.segment
        };
      }

      // Check if we need to add family -> segment relationship
      if (byFamily[product.familyCode]) {
        const existingRel = relationships.find(r =>
          r[1] === familyId && r[2] === segmentId && r[3] === 'partOfProductCategory'
        );
        if (!existingRel) {
          relationships.push(['unspsc', familyId, segmentId, 'partOfProductCategory', 'hasSubProduct']);
        }
      }
    }
  });

  return writeTSV('Products.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// 4. Generate Services.Relationships.tsv
function generateServicesRelationships() {
  const services = readTSV('Services.NAPCS.tsv');
  const relationships = [];

  services.forEach(service => {
    const serviceId = service.id || service.code;

    if (service.parent && service.parent.trim()) {
      relationships.push(['napcs', serviceId, service.parent, 'partOfServiceCategory', 'hasSubService']);
    }
  });

  return writeTSV('Services.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// 5. Generate Nouns.Relationships.tsv
function generateNounsRelationships() {
  const nouns = readTSV('Nouns.tsv');
  const relationships = [];

  nouns.forEach(noun => {
    const nounId = noun.id || noun.name;

    // Parent type relationship
    if (noun.parent && noun.parent.trim()) {
      relationships.push(['noun', nounId, noun.parent, 'subClassOf', 'superClassOf']);
    }

    // Source/definition relationship
    if (noun.source && noun.source.trim()) {
      relationships.push(['noun', nounId, noun.source, 'definedBy', 'defines']);
    }
  });

  return writeTSV('Nouns.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// 6. Generate Models.Relationships.tsv
function generateModelsRelationships() {
  const models = readTSV('Models.tsv');
  const relationships = [];

  models.forEach(model => {
    const modelId = model.id || model.name;

    // All models are instances of AIModel
    relationships.push(['model', modelId, 'AIModel', 'instanceOf', 'hasInstance']);

    // Architecture relationship
    if (model.architecture && model.architecture.trim()) {
      const arch = model.architecture.toLowerCase();

      // Text to text models
      if (arch.includes('text')) {
        relationships.push(['model', modelId, 'TextModel', 'hasCapability', 'capabilityOf']);
      }

      // Multimodal models
      if (arch.includes('image') || arch.includes('vision')) {
        relationships.push(['model', modelId, 'VisionModel', 'hasCapability', 'capabilityOf']);
      }

      if (arch.includes('audio')) {
        relationships.push(['model', modelId, 'AudioModel', 'hasCapability', 'capabilityOf']);
      }
    }

    // Provider relationship
    if (model.topProvider && model.topProvider.trim() && model.topProvider !== '[object Object]') {
      relationships.push(['model', modelId, model.topProvider, 'providedBy', 'provides']);
    }
  });

  return writeTSV('Models.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// 7. Generate Language.Relationships.tsv
function generateLanguageRelationships() {
  const relationships = [];

  // Process each language file
  const languageFiles = [
    { file: 'Language.Adverbs.tsv', type: 'Adverb', baseClass: 'Adverb' },
    { file: 'Language.Prepositions.tsv', type: 'Preposition', baseClass: 'Preposition' },
    { file: 'Language.Pronouns.tsv', type: 'Pronoun', baseClass: 'Pronoun' },
    { file: 'Language.Conjunctions.tsv', type: 'Conjunction', baseClass: 'Conjunction' },
    { file: 'Language.Determiners.tsv', type: 'Determiner', baseClass: 'Determiner' }
  ];

  languageFiles.forEach(({ file, type, baseClass }) => {
    const items = readTSV(file);

    items.forEach(item => {
      const itemId = item.id || item.name;

      // Each item is an instance of its base class
      relationships.push(['language', itemId, baseClass, 'instanceOf', 'hasInstance']);

      // Category relationship if available
      if (item.category && item.category.trim()) {
        relationships.push(['language', itemId, item.category, 'hasCategory', 'categoryOf']);
      }
    });
  });

  return writeTSV('Language.Relationships.tsv', ['ns', 'from', 'to', 'predicate', 'reverse'], relationships);
}

// Main execution
function main() {
  console.log('Generating relationship files...\n');

  const stats = {
    'Types.Relationships.tsv': generateTypesRelationships(),
    'Properties.Relationships.tsv': generatePropertiesRelationships(),
    'Products.Relationships.tsv': generateProductsRelationships(),
    'Services.Relationships.tsv': generateServicesRelationships(),
    'Nouns.Relationships.tsv': generateNounsRelationships(),
    'Models.Relationships.tsv': generateModelsRelationships(),
    'Language.Relationships.tsv': generateLanguageRelationships()
  };

  console.log('\n=== Summary ===');
  let total = 0;
  Object.entries(stats).forEach(([file, count]) => {
    console.log(`${file}: ${count} relationships`);
    total += count;
  });
  console.log(`\nTotal: ${total} relationships generated`);
}

main();
