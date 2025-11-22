#!/usr/bin/env tsx

/**
 * Data Ingestion Script
 *
 * This script downloads data from various public sources and converts them
 * into standardized TSV files in the .source directory.
 *
 * Each source gets its own subdirectory with files named [SourceName.TypeName].tsv
 * All column names use camelCase formatting.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, '.source');

// Ensure source directory exists
if (!fs.existsSync(SOURCE_DIR)) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Browser-like headers for requests that need them
 */
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

/**
 * Downloads text content from a URL
 */
async function fetchText(url: string, useBrowserHeaders = false): Promise<string> {
  console.log(`  Fetching: ${url}`);
  const response = await fetch(url, useBrowserHeaders ? { headers: BROWSER_HEADERS } : undefined);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.text();
}

/**
 * Downloads JSON content from a URL
 */
async function fetchJSON<T = any>(url: string, useBrowserHeaders = false): Promise<T> {
  console.log(`  Fetching: ${url}`);
  const response = await fetch(url, useBrowserHeaders ? { headers: BROWSER_HEADERS } : undefined);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Downloads binary content from a URL
 */
async function fetchBinary(url: string, useBrowserHeaders = true): Promise<ArrayBuffer> {
  console.log(`  Fetching: ${url}`);
  const response = await fetch(url, useBrowserHeaders ? { headers: BROWSER_HEADERS } : undefined);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.arrayBuffer();
}

/**
 * Parses CSV/TSV content into an array of objects
 */
function parseCSV(content: string, delimiter: string = ','): any[] {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Converts camelCase to Title Case
 */
function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase());
}

/**
 * Normalizes header names to camelCase
 */
function normalizeToCamelCase(obj: any): any {
  const normalized: any = {};
  for (const key in obj) {
    const camelKey = toCamelCase(key);
    normalized[camelKey] = obj[key];
  }
  return normalized;
}

/**
 * Writes data to a TSV file
 */
function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.log(`  �  No data to write for ${path.basename(filePath)}`);
    return;
  }

  // Normalize all keys to camelCase
  const normalizedData = data.map(normalizeToCamelCase);

  // Get all unique keys (camelCase)
  const allKeys = new Set<string>();
  normalizedData.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key));
  });
  const headers = Array.from(allKeys);

  // Create TSV content
  const lines: string[] = [];
  lines.push(headers.join('\t'));

  normalizedData.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] ?? '';
      // Escape tabs and newlines in values
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    });
    lines.push(values.join('\t'));
  });

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log(`   Wrote ${normalizedData.length} rows to ${path.relative(SOURCE_DIR, filePath)}`);
}

// ============================================================================
// Schema.org Ingestion
// ============================================================================

async function ingestSchemaOrg(): Promise<void> {
  console.log('\n=� Ingesting Schema.org...');

  const SCHEMA_DIR = path.join(SOURCE_DIR, 'Schema.org');

  try {
    // Fetch the latest Schema.org vocabulary
    const schemaData = await fetchJSON('https://schema.org/version/latest/schemaorg-current-https.jsonld');

    const types: any[] = [];
    const properties: any[] = [];
    const enumerations: any[] = [];

    // Parse the @graph array
    const graph = schemaData['@graph'] || [];

    for (const item of graph) {
      const type = item['@type'];
      const id = item['@id'];

      if (!id) continue;

      const name = id.replace('https://schema.org/', '');

      const obj = {
        id: name,
        name: name,
        type: Array.isArray(type) ? type.join(',') : type,
        label: item['rdfs:label'] || name,
        comment: item['rdfs:comment'] || '',
        subClassOf: item['rdfs:subClassOf'] ?
          (Array.isArray(item['rdfs:subClassOf']) ?
            item['rdfs:subClassOf'].map((s: any) => s['@id']?.replace('https://schema.org/', '')).join(',') :
            item['rdfs:subClassOf']['@id']?.replace('https://schema.org/', '')) : '',
        supersededBy: item['schema:supersededBy'] ? item['schema:supersededBy']['@id']?.replace('https://schema.org/', '') : '',
      };

      if (type?.includes('rdfs:Class')) {
        types.push(obj);
      } else if (type?.includes('rdf:Property')) {
        properties.push({
          ...obj,
          domainIncludes: item['schema:domainIncludes'] ?
            (Array.isArray(item['schema:domainIncludes']) ?
              item['schema:domainIncludes'].map((d: any) => d['@id']?.replace('https://schema.org/', '')).join(',') :
              item['schema:domainIncludes']['@id']?.replace('https://schema.org/', '')) : '',
          rangeIncludes: item['schema:rangeIncludes'] ?
            (Array.isArray(item['schema:rangeIncludes']) ?
              item['schema:rangeIncludes'].map((r: any) => r['@id']?.replace('https://schema.org/', '')).join(',') :
              item['schema:rangeIncludes']['@id']?.replace('https://schema.org/', '')) : '',
        });
      }
    }

    writeTSV(path.join(SCHEMA_DIR, 'Schema.org.Types.tsv'), types);
    writeTSV(path.join(SCHEMA_DIR, 'Schema.org.Properties.tsv'), properties);

  } catch (error) {
    console.error('  L Error ingesting Schema.org:', error);
  }
}

// ============================================================================
// O*NET Ingestion
// ============================================================================

async function ingestONET(): Promise<void> {
  console.log('\n=� Ingesting O*NET...');

  const ONET_DIR = path.join(SOURCE_DIR, 'ONET');
  const ONET_BASE = 'https://www.onetcenter.org/dl_files/database/db_30_0_text';

  // List of all O*NET database files
  // Note: Some files like Tasks.txt and Unspsc Reference.txt may not be available in the current release
  const files = [
    'Occupation Data.txt',
    'Abilities.txt',
    'Alternate Titles.txt',
    'Content Model Reference.txt',
    'DWA Reference.txt',
    'Education, Training, and Experience.txt',
    'Education, Training, and Experience Categories.txt',
    'Emerging Tasks.txt',
    'IWA Reference.txt',
    'Job Zone Reference.txt',
    'Job Zones.txt',
    'Knowledge.txt',
    'Interests.txt',
    'Level Scale Anchors.txt',
    'Occupation Level Metadata.txt',
    'Scales Reference.txt',
    'Skills.txt',
    'Task Categories.txt',
    'Task Ratings.txt',
    // 'Tasks.txt',  // Not available in current release
    'Technology Skills.txt',
    'Tools Used.txt',
    // 'Unspsc Reference.txt',  // Not available in current release
    'Work Activities.txt',
    'Work Context.txt',
    'Work Context Categories.txt',
    'Work Styles.txt',
    'Work Values.txt',
  ];

  for (const file of files) {
    try {
      const url = `${ONET_BASE}/${encodeURIComponent(file)}`;
      const content = await fetchText(url);
      const data = parseCSV(content, '\t');

      // Create filename from the original file name
      const fileName = file.replace('.txt', '.tsv').replace(/ /g, '');
      writeTSV(path.join(ONET_DIR, `ONET.${fileName}`), data);

    } catch (error) {
      console.error(`  L Error ingesting ${file}:`, error);
    }
  }
}

// ============================================================================
// GS1 Ingestion
// ============================================================================

async function ingestGS1(): Promise<void> {
  console.log('\n=� Ingesting GS1...');

  const GS1_DIR = path.join(SOURCE_DIR, 'GS1');

  try {
    // GS1 Web Vocabulary - EPCIS & CBV
    // Note: GS1 data may require authentication or special access
    // For now, we'll create placeholder structure

    console.log('  9  GS1 EPCIS/CBV data requires authentication');
    console.log('  9  Please manually download GS1 standards from https://www.gs1.org/');
    console.log('  9  Suggested files:');
    console.log('      - EPCIS Event definitions');
    console.log('      - CBV Standard vocabulary');
    console.log('      - GS1 identifiers (GTIN, GLN, SSCC, etc.)');

    // Create directory structure
    if (!fs.existsSync(GS1_DIR)) {
      fs.mkdirSync(GS1_DIR, { recursive: true });
    }

    // Create a README for manual steps
    const readme = `# GS1 Data Sources

## Required Manual Downloads

GS1 standards data is not freely available via public APIs. Please download the following:

1. **EPCIS Standard**: https://www.gs1.org/standards/epcis
2. **CBV (Core Business Vocabulary)**: https://www.gs1.org/standards/epcis
3. **GS1 Identifiers**: https://www.gs1.org/standards/id-keys
4. **GPC (Global Product Classification)**: https://www.gs1.org/standards/gpc

## File Format

Convert downloaded files to TSV format with camelCase column names and save as:
- GS1.EPCIS.Events.tsv
- GS1.CBV.Vocabulary.tsv
- GS1.Identifiers.tsv
- GS1.GPC.tsv
`;

    fs.writeFileSync(path.join(GS1_DIR, 'README.md'), readme);
    console.log('   Created GS1 directory with README');

  } catch (error) {
    console.error('  L Error with GS1 setup:', error);
  }
}

// ============================================================================
// NAICS Ingestion
// ============================================================================

async function ingestNAICS(): Promise<void> {
  console.log('\n=� Ingesting NAICS Industries...');

  const NAICS_DIR = path.join(SOURCE_DIR, 'NAICS');

  try {
    // Download the 2022 NAICS codes
    console.log('  ℹ️  NAICS data is available in XLSX format');
    console.log('  ℹ️  Download from: https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx');
    
    if (!fs.existsSync(NAICS_DIR)) {
      fs.mkdirSync(NAICS_DIR, { recursive: true });
    }
    
    const readme = `# NAICS Data

1. Download: https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx
2. Convert to TSV with camelCase columns
3. Save as: NAICS.Industries.tsv
`;
    fs.writeFileSync(path.join(NAICS_DIR, 'README.md'), readme);
    console.log('  ✓ Created NAICS directory with README');

  } catch (error) {
    console.error('  L Error ingesting NAICS:', error);
  }
}

// ============================================================================
// NAPCS Ingestion
// ============================================================================

async function ingestNAPCS(): Promise<void> {
  console.log('\n=� Ingesting NAPCS Products/Services...');

  const NAPCS_DIR = path.join(SOURCE_DIR, 'NAPCS');

  try {
    // NAPCS 2022
    const url = 'https://www.census.gov/naics/napcs/napcs22.txt';
    const content = await fetchText(url);
    const data = parseCSV(content, '\t');

    writeTSV(path.join(NAPCS_DIR, 'NAPCS.ProductsServices.tsv'), data);

  } catch (error) {
    console.error('  L Error ingesting NAPCS:', error);
    console.log('  9  NAPCS data may require manual download from https://www.census.gov/naics/');
  }
}

// ============================================================================
// UNSPSC Ingestion
// ============================================================================

async function ingestUNSPSC(): Promise<void> {
  console.log('\n=� Ingesting UNSPSC Products/Services...');

  const UNSPSC_DIR = path.join(SOURCE_DIR, 'UNSPSC');

  try {
    // UNSPSC is available from UNDP with browser headers
    const url = 'https://www.undp.org/sites/g/files/zskgke326/files/2025-03/unspsc-english-v260801.1.xlsx';

    const buffer = await fetchBinary(url, true);

    // Parse XLSX file
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get the first sheet (usually contains the codes)
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`  ℹ️  Found ${data.length} rows in UNSPSC XLSX`);

    // Skip copyright/header rows (first 6 rows) and use proper column mapping
    // Columns: __EMPTY_2=Segment, UNSPSC UNv260801=Segment Title, __EMPTY_4=Family, __EMPTY_5=Family Title,
    //          __EMPTY_7=Class, __EMPTY_8=Class Title, __EMPTY_10=Commodity, __EMPTY_11=Commodity Title, __EMPTY_12=Commodity Definition
    const codes = data.slice(6).map((row: any) => ({
      segmentCode: row['__EMPTY_2'] || '',
      segmentTitle: row['UNSPSC UNv260801'] || '',
      familyCode: row['__EMPTY_4'] || '',
      familyTitle: row['__EMPTY_5'] || '',
      classCode: row['__EMPTY_7'] || '',
      classTitle: row['__EMPTY_8'] || '',
      commodityCode: row['__EMPTY_10'] || '',
      commodityTitle: row['__EMPTY_11'] || '',
      definition: row['__EMPTY_12'] || '',
    })).filter(row => row.segmentCode || row.familyCode || row.classCode || row.commodityCode);

    writeTSV(path.join(UNSPSC_DIR, 'UNSPSC.Codes.tsv'), codes);

  } catch (error) {
    console.error('  ❌ Error ingesting UNSPSC:', error);
  }
}

// ============================================================================
// APQC Process Ingestion
// ============================================================================

async function ingestAPQC(): Promise<void> {
  console.log('\n=� Ingesting APQC Process...');

  const APQC_DIR = path.join(SOURCE_DIR, 'APQC');

  try {
    // APQC data already exists in .source/APQC
    // Let's convert the parsed JSON to TSV format

    const apqcParsedPath = path.join(APQC_DIR, 'apqc-parsed.json');
    if (fs.existsSync(apqcParsedPath)) {
      const apqcData = JSON.parse(fs.readFileSync(apqcParsedPath, 'utf-8'));

      // Flatten the hierarchical structure
      const processes: any[] = [];

      function flattenProcess(proc: any) {
        processes.push({
          pcfId: proc.pcfId,
          hierarchyId: proc.hierarchyId,
          name: proc.name,
          description: proc.description,
          level: proc.level,
          category: proc.category,
          parent: proc.parent,
          metricsAvailable: proc.metricsAvailable,
          differenceIndex: proc.differenceIndex,
          changeDetails: proc.changeDetails,
        });

        // Recursively process children if they exist
        if (proc.children && Array.isArray(proc.children)) {
          // Children are hierarchyIds, not objects, in this structure
          // We'll need to look them up if we want to flatten
        }
      }

      if (Array.isArray(apqcData)) {
        apqcData.forEach(flattenProcess);
      } else {
        flattenProcess(apqcData);
      }

      writeTSV(path.join(APQC_DIR, 'APQC.Processes.tsv'), processes);
    } else {
      console.log('  �  apqc-parsed.json not found, skipping');
    }

    // Also check for all-industries-parsed.json
    const allIndustriesPath = path.join(APQC_DIR, 'all-industries-parsed.json');
    if (fs.existsSync(allIndustriesPath)) {
      const allIndustries = JSON.parse(fs.readFileSync(allIndustriesPath, 'utf-8'));

      // This might be a more complex structure, adapt as needed
      if (Array.isArray(allIndustries)) {
        const flattened = allIndustries.map(industry => ({
          ...industry,
          // Flatten any nested structures
        }));
        writeTSV(path.join(APQC_DIR, 'APQC.Industries.tsv'), flattened);
      }
    }

  } catch (error) {
    console.error('  L Error ingesting APQC:', error);
  }
}

// ============================================================================
// Simple Icons / React Icons Ingestion
// ============================================================================

async function ingestIcons(): Promise<void> {
  console.log('\n=� Ingesting Icons (Simple Icons)...');

  const ICONS_DIR = path.join(SOURCE_DIR, 'Icons');

  try {
    // Simple Icons provides a JSON file in their repo
    // Try different branch names
    let simpleIcons: any;

    try {
      // Try develop branch first
      simpleIcons = await fetchJSON('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/data/simple-icons.json');
    } catch {
      try {
        // Try main branch
        simpleIcons = await fetchJSON('https://raw.githubusercontent.com/simple-icons/simple-icons/main/data/simple-icons.json');
      } catch {
        // Try master branch as fallback
        simpleIcons = await fetchJSON('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
      }
    }

    const icons = simpleIcons.icons.map((icon: any) => ({
      slug: icon.slug,
      title: icon.title,
      hex: icon.hex,
      source: icon.source || '',
      guidelines: icon.guidelines || '',
      license: icon.license?.type || icon.license || '',
    }));

    writeTSV(path.join(ICONS_DIR, 'SimpleIcons.Icons.tsv'), icons);

  } catch (error) {
    console.error('  ❌ Error ingesting Simple Icons:', error);
    console.log('  ℹ️  Please download manually from: https://github.com/simple-icons/simple-icons');
  }
}

// ============================================================================
// .do Models/Providers/Labs Ingestion
// ============================================================================

async function ingestModels(): Promise<void> {
  console.log('\n=� Ingesting .do Models/Providers/Labs...');

  const MODELS_DIR = path.join(SOURCE_DIR, 'Models');

  try {
    // Read MODELS_URL from .env
    const envPath = path.join(PROJECT_ROOT, '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const modelsUrlMatch = envContent.match(/MODELS_URL=(.+)/);

    if (!modelsUrlMatch) {
      throw new Error('MODELS_URL not found in .env');
    }

    const modelsUrl = modelsUrlMatch[1].trim();
    console.log(`  Using MODELS_URL: ${modelsUrl}`);

    // Fetch models data
    const modelsData = await fetchJSON(modelsUrl);

    // The structure depends on the OpenRouter API
    // Typically it returns { data: [...models] }
    const models = modelsData.data || modelsData;

    if (Array.isArray(models)) {
      // First, create a map to track which models have both free and paid versions
      const modelIdMap = new Map<string, any>();

      for (const model of models) {
        const id = model.id;
        const baseId = id.replace(':free', '');
        const isFree = id.endsWith(':free');

        if (!modelIdMap.has(baseId)) {
          modelIdMap.set(baseId, { free: null, paid: null });
        }

        const entry = modelIdMap.get(baseId)!;
        if (isFree) {
          entry.free = model;
        } else {
          entry.paid = model;
        }
      }

      // Now process the models:
      // - If both free and paid exist, keep only paid version
      // - If only free exists, use it but remove :free suffix and (free) from name
      const processedModels: any[] = [];

      for (const [baseId, entry] of modelIdMap.entries()) {
        let modelToUse: any;

        if (entry.paid) {
          // Paid version exists, use it (ignore free version)
          modelToUse = entry.paid;
        } else if (entry.free) {
          // Only free version exists, clean it up
          modelToUse = {
            ...entry.free,
            id: entry.free.id.replace(':free', ''),
            name: (entry.free.name || entry.free.id).replace(/\s*\(free\)\s*/i, '').trim(),
          };
        }

        if (modelToUse) {
          processedModels.push({
            id: modelToUse.id,
            name: modelToUse.name || modelToUse.id,
            description: modelToUse.description || '',
            contextLength: modelToUse.context_length || modelToUse.contextLength || '',
            pricing: JSON.stringify(modelToUse.pricing || {}),
            topProvider: modelToUse.top_provider || modelToUse.topProvider || '',
            architecture: modelToUse.architecture?.modality || '',
            created: modelToUse.created || '',
          });
        }
      }

      console.log(`  ℹ️  Processed ${models.length} models -> ${processedModels.length} unique models (removed :free duplicates)`);
      writeTSV(path.join(MODELS_DIR, 'Models.tsv'), processedModels);
    }

  } catch (error) {
    console.error('  L Error ingesting Models:', error);
  }
}

// ============================================================================
// .do Integrations Ingestion
// ============================================================================

async function ingestIntegrations(): Promise<void> {
  console.log('\n📦 Ingesting .do Integrations...');

  const INTEGRATIONS_DIR = path.join(SOURCE_DIR, 'Integrations');

  try {
    // Read INTEGRATIONS_URL from .env
    const envPath = path.join(PROJECT_ROOT, '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const integrationsUrlMatch = envContent.match(/INTEGRATIONS_URL=(.+)/);

    if (!integrationsUrlMatch) {
      throw new Error('INTEGRATIONS_URL not found in .env');
    }

    const baseUrl = integrationsUrlMatch[1].trim();
    console.log(`  Using INTEGRATIONS_URL: ${baseUrl}`);

    // Fetch services with pagination
    const allServices: any[] = [];
    const servicesData = await fetchJSON(`${baseUrl}/services?limit=250`);
    const services = servicesData.objects || servicesData.results || servicesData.data || servicesData;

    if (Array.isArray(services)) {
      services.forEach((service: any) => {
        allServices.push({
          key: service.key || service.slug,
          name: service.name || service.title,
          description: service.description || '',
          slug: service.slug || service.key,
          category: service.category || '',
          imageUrl: service.image_url || service.imageUrl || service.image || '',
        });
      });

      writeTSV(path.join(INTEGRATIONS_DIR, 'Integrations.Services.tsv'), allServices);
    }

    // Fetch apps with pagination
    const allApps: any[] = [];
    const appsData = await fetchJSON(`${baseUrl}/apps?limit=250`);
    const apps = appsData.objects || appsData.results || appsData.data || appsData;

    if (Array.isArray(apps)) {
      apps.forEach((app: any) => {
        allApps.push({
          key: app.key || app.slug,
          name: app.name || app.title,
          description: app.description || '',
          slug: app.slug || app.key,
          category: app.category || '',
          imageUrl: app.image_url || app.imageUrl || app.image || '',
        });
      });

      writeTSV(path.join(INTEGRATIONS_DIR, 'Integrations.Apps.tsv'), allApps);
    }

  } catch (error) {
    console.error('  ❌ Error ingesting Integrations:', error);
  }
}

// ============================================================================
// Advance CTE Framework Crosswalk Ingestion
// ============================================================================

async function ingestAdvanceCTE(): Promise<void> {
  console.log('\n📦 Ingesting Advance CTE Framework Crosswalk...');

  const ADVANCECTE_DIR = path.join(SOURCE_DIR, 'AdvanceCTE');

  try {
    // Check if Excel files exist
    const fullCrosswalkPath = path.join(ADVANCECTE_DIR, 'Full_Framework_Crosswalk.xlsx');
    const cipCrosswalkPath = path.join(ADVANCECTE_DIR, 'CIP_Career_Clusters_Crosswalk.xlsx');
    const socCrosswalkPath = path.join(ADVANCECTE_DIR, 'SOC_Career_Clusters_Crosswalk.xlsx');
    const naicsCrosswalkPath = path.join(ADVANCECTE_DIR, 'NAICS_Subclusters_Crosswalk.xlsx');

    // Process Full Framework Crosswalk
    if (fs.existsSync(fullCrosswalkPath)) {
      const buffer = fs.readFileSync(fullCrosswalkPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(ADVANCECTE_DIR, 'AdvanceCTE.FullCrosswalk.tsv'), data);
    } else {
      console.log('  ℹ️  Full_Framework_Crosswalk.xlsx not found');
    }

    // Process CIP Career Clusters Crosswalk
    if (fs.existsSync(cipCrosswalkPath)) {
      const buffer = fs.readFileSync(cipCrosswalkPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(ADVANCECTE_DIR, 'AdvanceCTE.CIP-CareerClusters.tsv'), data);
    } else {
      console.log('  ℹ️  CIP_Career_Clusters_Crosswalk.xlsx not found');
    }

    // Process SOC Career Clusters Crosswalk
    if (fs.existsSync(socCrosswalkPath)) {
      const buffer = fs.readFileSync(socCrosswalkPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(ADVANCECTE_DIR, 'AdvanceCTE.SOC-CareerClusters.tsv'), data);
    } else {
      console.log('  ℹ️  SOC_Career_Clusters_Crosswalk.xlsx not found');
    }

    // Process NAICS Subclusters Crosswalk
    if (fs.existsSync(naicsCrosswalkPath)) {
      const buffer = fs.readFileSync(naicsCrosswalkPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(ADVANCECTE_DIR, 'AdvanceCTE.NAICS-CareerClusters.tsv'), data);
    } else {
      console.log('  ℹ️  NAICS_Subclusters_Crosswalk.xlsx not found');
    }

  } catch (error) {
    console.error('  ❌ Error ingesting Advance CTE:', error);
  }
}

// ============================================================================
// BLS Industry-Occupation Matrix Ingestion
// ============================================================================

async function ingestBLS(): Promise<void> {
  console.log('\n📦 Ingesting BLS Industry-Occupation Matrix...');

  const BLS_DIR = path.join(SOURCE_DIR, 'BLS');

  try {
    // Check if manually downloaded Excel files exist
    const byIndustryPath = path.join(BLS_DIR, 'BLS.IndustryOccupationMatrix.ByIndustry.xlsx');
    const byOccupationPath = path.join(BLS_DIR, 'BLS.IndustryOccupationMatrix.ByOccupation.xlsx');
    const socAcsCrosswalkPath = path.join(BLS_DIR, 'BLS.SOC-ACS-Crosswalk.xlsx');
    const socCpsCrosswalkPath = path.join(BLS_DIR, 'BLS.SOC-CPS-Crosswalk.xlsx');

    let filesFound = false;

    // Process Industry-Occupation Matrix by Industry
    if (fs.existsSync(byIndustryPath)) {
      const buffer = fs.readFileSync(byIndustryPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(BLS_DIR, 'BLS.IndustryOccupationMatrix.ByIndustry.tsv'), data);
      filesFound = true;
    }

    // Process Industry-Occupation Matrix by Occupation
    if (fs.existsSync(byOccupationPath)) {
      const buffer = fs.readFileSync(byOccupationPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(BLS_DIR, 'BLS.IndustryOccupationMatrix.ByOccupation.tsv'), data);
      filesFound = true;
    }

    // Process SOC-ACS Crosswalk
    if (fs.existsSync(socAcsCrosswalkPath)) {
      const buffer = fs.readFileSync(socAcsCrosswalkPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(BLS_DIR, 'BLS.SOC-ACS-Crosswalk.tsv'), data);
      filesFound = true;
    }

    // Process SOC-CPS Crosswalk
    if (fs.existsSync(socCpsCrosswalkPath)) {
      const buffer = fs.readFileSync(socCpsCrosswalkPath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      writeTSV(path.join(BLS_DIR, 'BLS.SOC-CPS-Crosswalk.tsv'), data);
      filesFound = true;
    }

    if (!filesFound) {
      console.log('  ℹ️  No BLS data files found. Please download manually from:');
      console.log('      https://www.bls.gov/emp/tables.htm');
      console.log('      See .source/BLS/README.md for instructions');
    }

  } catch (error) {
    console.error('  ❌ Error ingesting BLS:', error);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('=� Starting data ingestion...\n');
  console.log(`=� Source directory: ${SOURCE_DIR}\n`);

  // Run all ingestion functions
  await ingestSchemaOrg();
  await ingestONET();
  await ingestGS1();
  await ingestNAICS();
  await ingestNAPCS();
  await ingestUNSPSC();
  await ingestAPQC();
  await ingestIcons();
  await ingestModels();
  await ingestIntegrations();
  await ingestAdvanceCTE();
  await ingestBLS();

  console.log('\n Data ingestion complete!\n');
}

// Run the script
main().catch(error => {
  console.error('L Fatal error:', error);
  process.exit(1);
});
