#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Helper function to create ID from name
function createId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to parse TSV
function parseTSV(content) {
  // Handle both \r\n and \n line endings
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split('\t').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj = {};
    headers.forEach((header, i) => {
      // Trim values to remove any \r characters
      obj[header] = (values[i] || '').trim();
    });
    return obj;
  });
}

// Process Tools
function processTools() {
  console.log('Processing ONET.ToolsUsed.tsv...');

  const toolsContent = fs.readFileSync(
    '/Users/nathanclevenger/projects/graph.org.ai/.source/ONET/ONET.ToolsUsed.tsv',
    'utf-8'
  );

  const toolsData = parseTSV(toolsContent);
  console.log(`Total tool-occupation mappings: ${toolsData.length}`);

  // Create a map to track unique tools by example name
  const uniqueToolsMap = new Map();

  toolsData.forEach(row => {
    const toolName = row.example;

    if (!uniqueToolsMap.has(toolName)) {
      uniqueToolsMap.set(toolName, {
        id: createId(toolName),
        type: 'Tool',
        name: toolName,
        commodityCode: row.commodityCode,
        commodityTitle: row.commodityTitle
      });
    } else {
      // If we see this tool again and it has a commodityTitle, update if current is empty
      const existing = uniqueToolsMap.get(toolName);
      if (!existing.commodityTitle && row.commodityTitle) {
        existing.commodityTitle = row.commodityTitle;
      }
    }
  });

  const uniqueTools = Array.from(uniqueToolsMap.values());
  console.log(`Unique tools found: ${uniqueTools.length}`);

  // Sort by name
  uniqueTools.sort((a, b) => a.name.localeCompare(b.name));

  // Write to TSV
  const headers = ['id', 'type', 'name', 'commodityCode', 'commodityTitle'];
  const tsvContent = [
    headers.join('\t'),
    ...uniqueTools.map(tool =>
      headers.map(h => tool[h] || '').join('\t')
    )
  ].join('\n');

  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Tools.tsv';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, tsvContent);
  console.log(`Written to ${outputPath}`);

  return {
    count: uniqueTools.length,
    sample: uniqueTools.slice(0, 5)
  };
}

// Process Technologies
function processTechnologies() {
  console.log('\nProcessing ONET.TechnologySkills.tsv...');

  const techContent = fs.readFileSync(
    '/Users/nathanclevenger/projects/graph.org.ai/.source/ONET/ONET.TechnologySkills.tsv',
    'utf-8'
  );

  const techData = parseTSV(techContent);
  console.log(`Total technology-occupation mappings: ${techData.length}`);

  // Create a map to track unique technologies by example name
  const uniqueTechMap = new Map();

  techData.forEach(row => {
    const techName = row.example;

    if (!uniqueTechMap.has(techName)) {
      uniqueTechMap.set(techName, {
        id: createId(techName),
        type: 'Technology',
        name: techName,
        commodityCode: row.commodityCode,
        commodityTitle: row.commodityTitle,
        hotTechnology: row.hotTechnology || 'N',
        inDemand: row.inDemand || 'N'
      });
    } else {
      // If we see this tech again, update with best values
      const existing = uniqueTechMap.get(techName);
      if (row.hotTechnology === 'Y') {
        existing.hotTechnology = 'Y';
      }
      if (row.inDemand === 'Y') {
        existing.inDemand = 'Y';
      }
      if (!existing.commodityTitle && row.commodityTitle) {
        existing.commodityTitle = row.commodityTitle;
      }
    }
  });

  const uniqueTech = Array.from(uniqueTechMap.values());
  console.log(`Unique technologies found: ${uniqueTech.length}`);

  // Sort by name
  uniqueTech.sort((a, b) => a.name.localeCompare(b.name));

  // Count hot technologies
  const hotTechCount = uniqueTech.filter(t => t.hotTechnology === 'Y').length;
  const inDemandCount = uniqueTech.filter(t => t.inDemand === 'Y').length;
  console.log(`Hot technologies: ${hotTechCount}`);
  console.log(`In-demand technologies: ${inDemandCount}`);

  // Write to TSV
  const headers = ['id', 'type', 'name', 'commodityCode', 'commodityTitle', 'hotTechnology', 'inDemand'];
  const tsvContent = [
    headers.join('\t'),
    ...uniqueTech.map(tech =>
      headers.map(h => tech[h] || '').join('\t')
    )
  ].join('\n');

  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Technologies.tsv';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, tsvContent);
  console.log(`Written to ${outputPath}`);

  return {
    count: uniqueTech.length,
    hotTechCount,
    inDemandCount,
    sample: uniqueTech.slice(0, 5)
  };
}

// Analyze commodity codes
function analyzeCommodityCodes() {
  console.log('\n=== Commodity Code Analysis ===');

  const toolsContent = fs.readFileSync(
    '/Users/nathanclevenger/projects/graph.org.ai/.source/ONET/ONET.ToolsUsed.tsv',
    'utf-8'
  );
  const techContent = fs.readFileSync(
    '/Users/nathanclevenger/projects/graph.org.ai/.source/ONET/ONET.TechnologySkills.tsv',
    'utf-8'
  );

  const toolsData = parseTSV(toolsContent);
  const techData = parseTSV(techContent);

  const toolCommodityCodes = new Set(toolsData.map(r => r.commodityCode).filter(Boolean));
  const techCommodityCodes = new Set(techData.map(r => r.commodityCode).filter(Boolean));

  console.log(`Unique commodity codes in Tools: ${toolCommodityCodes.size}`);
  console.log(`Unique commodity codes in Technologies: ${techCommodityCodes.size}`);

  // Find overlaps
  const overlap = [...toolCommodityCodes].filter(code => techCommodityCodes.has(code));
  console.log(`Overlapping commodity codes: ${overlap.length}`);

  if (overlap.length > 0) {
    console.log('Sample overlapping codes:', overlap.slice(0, 3));
  }
}

// Main execution
console.log('=== ONET Tools & Technologies Extraction ===\n');

const toolsResult = processTools();
const techResult = processTechnologies();
analyzeCommodityCodes();

console.log('\n=== Summary ===');
console.log(`Tools extracted: ${toolsResult.count}`);
console.log(`Technologies extracted: ${techResult.count}`);
console.log(`Hot technologies: ${techResult.hotTechCount}`);
console.log(`In-demand technologies: ${techResult.inDemandCount}`);

console.log('\n=== Sample Tools ===');
toolsResult.sample.forEach(tool => {
  console.log(`  ${tool.id}: ${tool.name} (${tool.commodityCode})`);
});

console.log('\n=== Sample Technologies ===');
techResult.sample.forEach(tech => {
  console.log(`  ${tech.id}: ${tech.name} (${tech.commodityCode}) Hot:${tech.hotTechnology} InDemand:${tech.inDemand}`);
});

console.log('\nDone!');
