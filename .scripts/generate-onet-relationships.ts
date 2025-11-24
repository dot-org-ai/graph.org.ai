#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const sourceDir = '/Users/nathanclevenger/projects/graph.org.ai/.source/ONET';
const dataDir = '/Users/nathanclevenger/projects/graph.org.ai/.data';

// Helper function to convert names to URL-safe format
function toUrlSafe(name: string | undefined): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/[,\(\)]/g, '') // Remove commas and parentheses
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[\/]/g, '_') // Replace forward slashes with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

// Parse TSV file
function parseTsv(filePath: string): Array<Record<string, string>> {
  const content = readFileSync(filePath, 'utf-8');
  // Handle both \r\n and \n line endings
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split('\t').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split('\t').map(v => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    return record;
  }).filter(record => {
    // Filter out empty records
    return Object.values(record).some(v => v !== '');
  });
}

// Write TSV file
function writeTsv(filePath: string, headers: string[], rows: string[][]): void {
  const content = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
  writeFileSync(filePath, content, 'utf-8');
}

// Generate Skills relationships
function generateSkillsRelationships(): number {
  console.log('Generating Skills.Relationships.tsv...');

  const relationships: string[][] = [];

  // Process SkillsToWorkActivities
  const skillsToActivities = parseTsv(join(sourceDir, 'ONET.SkillsToWorkActivities.tsv'));
  for (const row of skillsToActivities) {
    const skillName = toUrlSafe(row.skillsElementName);
    const activityName = toUrlSafe(row.workActivitiesElementName);

    // Skip if either name is empty
    if (!skillName || !activityName) continue;

    relationships.push([
      'onet.org.ai',
      `https://onet.org.ai/Skill/${skillName}`,
      `https://onet.org.ai/WorkActivity/${activityName}`,
      'enables',
      'requiresSkill'
    ]);
  }

  // Process SkillsToWorkContext
  const skillsToContext = parseTsv(join(sourceDir, 'ONET.SkillsToWorkContext.tsv'));
  for (const row of skillsToContext) {
    const skillName = toUrlSafe(row.skillsElementName);
    const contextName = toUrlSafe(row.workContextElementName);

    // Skip if either name is empty
    if (!skillName || !contextName) continue;

    relationships.push([
      'onet.org.ai',
      `https://onet.org.ai/Skill/${skillName}`,
      `https://onet.org.ai/WorkContext/${contextName}`,
      'usedIn',
      'requiresSkill'
    ]);
  }

  // Write to file
  writeTsv(
    join(dataDir, 'Skills.Relationships.tsv'),
    ['ns', 'from', 'to', 'predicate', 'reverse'],
    relationships
  );

  console.log(`Generated ${relationships.length} Skills relationships`);
  return relationships.length;
}

// Generate Abilities relationships
function generateAbilitiesRelationships(): number {
  console.log('Generating Abilities.Relationships.tsv...');

  const relationships: string[][] = [];

  // Process AbilitiesToWorkActivities
  const abilitiesToActivities = parseTsv(join(sourceDir, 'ONET.AbilitiesToWorkActivities.tsv'));
  for (const row of abilitiesToActivities) {
    const abilityName = toUrlSafe(row.abilitiesElementName);
    const activityName = toUrlSafe(row.workActivitiesElementName);

    // Skip if either name is empty
    if (!abilityName || !activityName) continue;

    relationships.push([
      'onet.org.ai',
      `https://onet.org.ai/Ability/${abilityName}`,
      `https://onet.org.ai/WorkActivity/${activityName}`,
      'enables',
      'requiresAbility'
    ]);
  }

  // Process AbilitiesToWorkContext
  const abilitiesToContext = parseTsv(join(sourceDir, 'ONET.AbilitiesToWorkContext.tsv'));
  for (const row of abilitiesToContext) {
    const abilityName = toUrlSafe(row.abilitiesElementName);
    const contextName = toUrlSafe(row.workContextElementName);

    // Skip if either name is empty
    if (!abilityName || !contextName) continue;

    relationships.push([
      'onet.org.ai',
      `https://onet.org.ai/Ability/${abilityName}`,
      `https://onet.org.ai/WorkContext/${contextName}`,
      'usedIn',
      'requiresAbility'
    ]);
  }

  // Write to file
  writeTsv(
    join(dataDir, 'Abilities.Relationships.tsv'),
    ['ns', 'from', 'to', 'predicate', 'reverse'],
    relationships
  );

  console.log(`Generated ${relationships.length} Abilities relationships`);
  return relationships.length;
}

// Generate Knowledge relationships
// Note: There are no Knowledge-to-X mapping files in the source, so we'll create an empty file
function generateKnowledgeRelationships(): number {
  console.log('Generating Knowledge.Relationships.tsv...');
  console.log('Note: No Knowledge mapping files found in source data');

  // Write empty file with just headers
  writeTsv(
    join(dataDir, 'Knowledge.Relationships.tsv'),
    ['ns', 'from', 'to', 'predicate', 'reverse'],
    []
  );

  console.log('Generated 0 Knowledge relationships (no source data available)');
  return 0;
}

// Main execution
function main() {
  console.log('Starting ONET relationship generation...\n');

  const skillsCount = generateSkillsRelationships();
  console.log('');

  const abilitiesCount = generateAbilitiesRelationships();
  console.log('');

  const knowledgeCount = generateKnowledgeRelationships();
  console.log('');

  console.log('Summary:');
  console.log(`- Skills relationships: ${skillsCount}`);
  console.log(`- Abilities relationships: ${abilitiesCount}`);
  console.log(`- Knowledge relationships: ${knowledgeCount}`);
  console.log(`- Total: ${skillsCount + abilitiesCount + knowledgeCount}`);
}

main();
