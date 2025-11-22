#!/usr/bin/env tsx

/**
 * Create Career Cluster enrichment crosswalks
 * Generates enrichment files from Advance CTE source data
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ADVANCECTE_DIR = path.join(PROJECT_ROOT, '.source', 'AdvanceCTE');
const ENRICHMENT_DIR = path.join(PROJECT_ROOT, '.enrichment');

/**
 * Parse TSV file
 */
function parseTSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split('\t');
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Write TSV file
 */
function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.log(`  ⚠️  No data to write for ${path.basename(filePath)}`);
    return;
  }

  const headers = Object.keys(data[0]);
  const lines: string[] = [];
  lines.push(headers.join('\t'));

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] ?? '';
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    });
    lines.push(values.join('\t'));
  });

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log(`  ✓ Wrote ${data.length} rows to ${path.relative(ENRICHMENT_DIR, filePath)}`);
}

/**
 * Create Occupations.CareerClusters.tsv
 */
function createOccupationsCareerClusters(): void {
  console.log('\nCreating Occupations.CareerClusters.tsv...');

  const socData = parseTSV(
    path.join(ADVANCECTE_DIR, 'AdvanceCTE.SOC-CareerClusters.SOC---CC---Sub-Clusters.tsv')
  );

  const enriched = socData.map(row => ({
    socCode: row.sOCCode || row.socCode,
    occupationTitle: row.occupationTitle,
    careerCluster: row.careerCluster,
    subCluster: row.subCluster,
    source: 'Advance CTE Framework Crosswalk',
  }));

  writeTSV(path.join(ENRICHMENT_DIR, 'Occupations.CareerClusters.tsv'), enriched);
}

/**
 * Create Industries.CareerClusters.tsv
 */
function createIndustriesCareerClusters(): void {
  console.log('\nCreating Industries.CareerClusters.tsv...');

  const naicsData = parseTSV(
    path.join(ADVANCECTE_DIR, 'AdvanceCTE.NAICS-CareerClusters.CC---Sub-Cluster---NAICS.tsv')
  );

  const enriched = naicsData.map(row => ({
    naicsCode: row['2DigitNAICS'] || row['2digitNaics'],
    naicsTitle: row.nAICSTitle || row.naicsTitle,
    careerCluster: row.careerCluster,
    subCluster: row.subCluster,
    source: 'Advance CTE Framework Crosswalk',
  }));

  writeTSV(path.join(ENRICHMENT_DIR, 'Industries.CareerClusters.tsv'), enriched);
}

/**
 * Create Education.CareerClusters.tsv
 */
function createEducationCareerClusters(): void {
  console.log('\nCreating Education.CareerClusters.tsv...');

  const cipData = parseTSV(
    path.join(ADVANCECTE_DIR, 'AdvanceCTE.CIP-CareerClusters.CIP---CC---Sub-Clusters.tsv')
  );

  const enriched = cipData.map(row => ({
    cipCode: row.cIPCode || row.cipCode,
    cipTitle: row.cIPTitle || row.cipTitle,
    careerCluster: row.careerCluster,
    subCluster: row.subCluster,
    source: 'Advance CTE Framework Crosswalk',
  }));

  writeTSV(path.join(ENRICHMENT_DIR, 'Education.CareerClusters.tsv'), enriched);
}

/**
 * Create CareerClusters.Taxonomy.tsv
 */
function createCareerClustersTaxonomy(): void {
  console.log('\nCreating CareerClusters.Taxonomy.tsv...');

  const overview = parseTSV(
    path.join(ADVANCECTE_DIR, 'AdvanceCTE.FullCrosswalk.Overview.tsv')
  );

  const naicsData = parseTSV(
    path.join(ADVANCECTE_DIR, 'AdvanceCTE.NAICS-CareerClusters.CC---Sub-Cluster---NAICS.tsv')
  );

  // Extract unique clusters from overview
  const clusterMap = new Map<string, Set<string>>();

  // Add sub-clusters from NAICS data
  naicsData.forEach(row => {
    const cluster = row.careerCluster;
    const subCluster = row.subCluster;
    if (cluster && subCluster) {
      if (!clusterMap.has(cluster)) {
        clusterMap.set(cluster, new Set());
      }
      clusterMap.get(cluster)!.add(subCluster);
    }
  });

  // Create taxonomy
  const taxonomy: any[] = [];
  for (const [cluster, subClusters] of clusterMap.entries()) {
    const naicsRow = naicsData.find(r => r.careerCluster === cluster);
    taxonomy.push({
      careerCluster: cluster,
      naicsCode: naicsRow?.['2DigitNAICS'] || naicsRow?.['2digitNaics'] || '',
      subClusters: Array.from(subClusters).join(', '),
      subClusterCount: subClusters.size,
      source: 'Advance CTE Framework Crosswalk',
    });
  }

  writeTSV(path.join(ENRICHMENT_DIR, 'CareerClusters.Taxonomy.tsv'), taxonomy);
}

/**
 * Create InterdisciplinaryOccupations.tsv
 */
function createInterdisciplinaryOccupations(): void {
  console.log('\nCreating InterdisciplinaryOccupations.tsv...');

  const interdisciplinary = parseTSV(
    path.join(ADVANCECTE_DIR, 'AdvanceCTE.SOC-CareerClusters.Interdisciplinary-SOCs.tsv')
  );

  const enriched = interdisciplinary.map(row => ({
    socCode: row.sOCCode || row.socCode,
    occupationTitle: row.occupationTitle || row.sOCTitle,
    careerClusters: row.careerClusters || row.allCareerClusters,
    clusterCount: row.clusterCount || row.ofCareerClusters,
    note: 'Occupation spans multiple career clusters - transferable skills',
    source: 'Advance CTE Framework Crosswalk',
  }));

  writeTSV(path.join(ENRICHMENT_DIR, 'InterdisciplinaryOccupations.tsv'), enriched);
}

/**
 * Main execution
 */
function main() {
  console.log('Creating Career Cluster enrichment crosswalks...\n');

  createOccupationsCareerClusters();
  createIndustriesCareerClusters();
  createEducationCareerClusters();
  createCareerClustersTaxonomy();
  createInterdisciplinaryOccupations();

  console.log('\n✅ Enrichment crosswalks created successfully!');
}

main();
