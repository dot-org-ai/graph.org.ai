#!/usr/bin/env node
/**
 * TSV Standardization Script
 *
 * Transforms all .data/*.tsv files to conform to the standard schema:
 * url	ns	type	id	code	name	description	[...additional columns...]
 *
 * Transformations:
 * 1. Adds missing standard columns (url, ns, type, code, name, description)
 * 2. Converts non-PascalCase IDs to PascalCase (moves old ID to code field)
 * 3. Generates proper URLs from ns + type + id
 * 4. Preserves all additional columns
 * 5. Backs up original files
 */

import { readFileSync, writeFileSync, copyFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface TSVRow {
  [key: string]: string;
}

interface StandardizationResult {
  file: string;
  originalHeaders: string[];
  standardizedHeaders: string[];
  rowsProcessed: number;
  changes: {
    addedColumns: string[];
    idChanges: number;
    urlGenerated: number;
    codesMoved: number;
  };
}

const DATA_DIR = '/Users/nathanclevenger/projects/graph.org.ai/.data';
const STANDARD_COLUMNS = ['url', 'ns', 'type', 'id', 'code', 'name', 'description'];

/**
 * Convert a name to PascalCase ID
 */
function toPascalCase(name: string): string {
  if (!name) return '';

  return name
    .split(/[\s\-_\.\/]+/)
    .filter(word => word.length > 0)
    .map(word => {
      // Handle special cases like "API", "URL", etc.
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Check if a string is PascalCase
 */
function isPascalCase(str: string): boolean {
  if (!str || str.trim() === '') return false;
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9_]*$/;
  const isAllUppercase = str === str.toUpperCase() && str.includes('_');
  return pascalCaseRegex.test(str) && !isAllUppercase;
}

/**
 * Infer namespace from file name or type
 */
function inferNamespace(fileName: string, type: string): string {
  // Map of file patterns to namespaces
  const nsMap: Record<string, string> = {
    'Knowledge': 'onet.org.ai',
    'Skills': 'onet.org.ai',
    'Abilities': 'onet.org.ai',
    'WorkValues': 'onet.org.ai',
    'WorkStyles': 'onet.org.ai',
    'WorkContext': 'onet.org.ai',
    'WorkActivities': 'onet.org.ai',
    'Tasks': 'onet.org.ai',
    'Tools': 'onet.org.ai',
    'Technologies': 'onet.org.ai',
    'Occupations': 'onet.org.ai',
    'Apps': 'apps.org.ai',
    'Models': 'models.org.ai',
    'Industries': 'naics.org.ai',
    'Products': 'unspsc.org.ai',
    'Services': 'napcs.org.ai',
    'Processes': 'apqc.org.ai',
    'BusinessTypes': 'business.org.ai',
    'Departments': 'business.org.ai',
    'Nouns': 'schema.org.ai',
    'Verbs': 'verbs.org.ai',
    'Types': 'schema.org.ai',
    'Properties': 'schema.org.ai',
    'Concepts': 'concepts.org.ai',
    'Countries': 'places.org.ai',
    'States': 'places.org.ai',
    'CareerClusters': 'education.org.ai',
    'SubClusters': 'education.org.ai',
    'EducationPrograms': 'education.org.ai',
  };

  const baseName = fileName.replace('.tsv', '').split('.')[0];
  return nsMap[baseName] || 'graph.org.ai';
}

/**
 * Infer type from file name or existing type field
 */
function inferType(fileName: string, existingType?: string): string {
  if (existingType && existingType !== '') return existingType;

  const baseName = fileName.replace('.tsv', '').split('.')[0];

  // Singularize if needed
  if (baseName.endsWith('ies')) {
    return baseName.slice(0, -3) + 'y';
  } else if (baseName.endsWith('s') && !baseName.endsWith('ss')) {
    return baseName.slice(0, -1);
  }

  return baseName;
}

/**
 * Generate URL from namespace, type, and id
 */
function generateUrl(ns: string, type: string, id: string): string {
  // Remove .ai from namespace for cleaner URLs
  const cleanNs = ns.replace(/\.ai$/, '');
  return `https://${cleanNs}/${type}/${id}`;
}

/**
 * Standardize a single TSV file
 */
function standardizeTSVFile(filePath: string, dryRun: boolean = false): StandardizationResult {
  const fileName = filePath.split('/').pop() || filePath;
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  if (lines.length === 0) {
    throw new Error(`File ${fileName} is empty`);
  }

  // Parse header
  const headerLine = lines[0];
  const originalHeaders = headerLine.split('\t');

  // Initialize result
  const result: StandardizationResult = {
    file: fileName,
    originalHeaders,
    standardizedHeaders: [],
    rowsProcessed: 0,
    changes: {
      addedColumns: [],
      idChanges: 0,
      urlGenerated: 0,
      codesMoved: 0,
    }
  };

  // Determine which columns need to be added
  const addedColumns = STANDARD_COLUMNS.filter(col => !originalHeaders.includes(col));
  result.changes.addedColumns = addedColumns;

  // Build new header with standard columns first, then additional columns
  const additionalColumns = originalHeaders.filter(col => !STANDARD_COLUMNS.includes(col));
  const newHeaders = [...STANDARD_COLUMNS, ...additionalColumns];
  result.standardizedHeaders = newHeaders;

  // Get column indices from original headers
  const getColIdx = (col: string) => originalHeaders.indexOf(col);

  const idIdx = getColIdx('id');
  const typeIdx = getColIdx('type');
  const nameIdx = getColIdx('name');
  const urlIdx = getColIdx('url');
  const nsIdx = getColIdx('ns');
  const codeIdx = getColIdx('code');
  const descIdx = getColIdx('description');

  // Process each row
  const newRows: string[][] = [newHeaders];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const columns = line.split('\t');
    const newRow: string[] = new Array(newHeaders.length).fill('');

    // Copy additional columns first
    additionalColumns.forEach((col, idx) => {
      const originalIdx = originalHeaders.indexOf(col);
      if (originalIdx !== -1 && columns[originalIdx]) {
        newRow[STANDARD_COLUMNS.length + idx] = columns[originalIdx];
      }
    });

    // Get or infer values for standard columns
    const name = nameIdx !== -1 ? columns[nameIdx] : '';
    const existingType = typeIdx !== -1 ? columns[typeIdx] : '';
    const existingId = idIdx !== -1 ? columns[idIdx] : '';
    const existingCode = codeIdx !== -1 ? columns[codeIdx] : '';
    const existingUrl = urlIdx !== -1 ? columns[urlIdx] : '';
    const existingNs = nsIdx !== -1 ? columns[nsIdx] : '';
    const existingDesc = descIdx !== -1 ? columns[descIdx] : '';

    // Determine namespace
    const ns = existingNs || inferNamespace(fileName, existingType);

    // Determine type
    const type = inferType(fileName, existingType);

    // Determine ID and code
    let id = existingId;
    let code = existingCode;

    // If existing ID is not PascalCase, move it to code and generate new ID from name
    if (id && !isPascalCase(id)) {
      if (!code) {
        code = id;
        result.changes.codesMoved++;
      }
      id = name ? toPascalCase(name) : toPascalCase(id);
      result.changes.idChanges++;
    } else if (!id && name) {
      // Generate ID from name if missing
      id = toPascalCase(name);
      result.changes.idChanges++;
    }

    // Generate URL if missing
    let url = existingUrl;
    if (!url && ns && type && id) {
      url = generateUrl(ns, type, id);
      result.changes.urlGenerated++;
    }

    // Build new row with standard columns
    newRow[newHeaders.indexOf('url')] = url;
    newRow[newHeaders.indexOf('ns')] = ns;
    newRow[newHeaders.indexOf('type')] = type;
    newRow[newHeaders.indexOf('id')] = id;
    newRow[newHeaders.indexOf('code')] = code;
    newRow[newHeaders.indexOf('name')] = name;
    newRow[newHeaders.indexOf('description')] = existingDesc;

    newRows.push(newRow);
    result.rowsProcessed++;
  }

  // Write standardized file
  if (!dryRun) {
    // Backup original file
    const backupPath = filePath + '.backup';
    copyFileSync(filePath, backupPath);

    // Write new content
    const newContent = newRows.map(row => row.join('\t')).join('\n') + '\n';
    writeFileSync(filePath, newContent, 'utf-8');
  }

  return result;
}

/**
 * Standardize all TSV files
 */
function standardizeAllTSVFiles(dryRun: boolean = false): StandardizationResult[] {
  const files = readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.tsv') && !f.endsWith('.Relationships.tsv'))
    .map(f => join(DATA_DIR, f));

  console.log(`Found ${files.length} TSV files to standardize\n`);
  if (dryRun) {
    console.log('DRY RUN MODE - No files will be modified\n');
  }

  const results: StandardizationResult[] = [];

  for (const file of files) {
    try {
      const result = standardizeTSVFile(file, dryRun);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  return results;
}

/**
 * Generate standardization report
 */
function generateReport(results: StandardizationResult[], dryRun: boolean): void {
  const totalFiles = results.length;
  const totalRows = results.reduce((sum, r) => sum + r.rowsProcessed, 0);
  const totalIdChanges = results.reduce((sum, r) => sum + r.changes.idChanges, 0);
  const totalUrlsGenerated = results.reduce((sum, r) => sum + r.changes.urlGenerated, 0);
  const totalCodesMoved = results.reduce((sum, r) => sum + r.changes.codesMoved, 0);
  const filesWithChanges = results.filter(r =>
    r.changes.addedColumns.length > 0 ||
    r.changes.idChanges > 0 ||
    r.changes.urlGenerated > 0 ||
    r.changes.codesMoved > 0
  ).length;

  console.log('='.repeat(80));
  console.log('TSV STANDARDIZATION REPORT');
  if (dryRun) {
    console.log('(DRY RUN - NO FILES MODIFIED)');
  }
  console.log('='.repeat(80));
  console.log();
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files with changes: ${filesWithChanges}`);
  console.log(`Total rows processed: ${totalRows}`);
  console.log();
  console.log('SUMMARY OF CHANGES:');
  console.log(`  IDs converted to PascalCase: ${totalIdChanges}`);
  console.log(`  Codes moved from ID field: ${totalCodesMoved}`);
  console.log(`  URLs generated: ${totalUrlsGenerated}`);
  console.log();

  // Files with changes
  console.log('FILES WITH CHANGES:');
  console.log('-'.repeat(80));

  results
    .filter(r =>
      r.changes.addedColumns.length > 0 ||
      r.changes.idChanges > 0 ||
      r.changes.urlGenerated > 0 ||
      r.changes.codesMoved > 0
    )
    .forEach(result => {
      console.log(`\n${result.file} (${result.rowsProcessed} rows)`);

      if (result.changes.addedColumns.length > 0) {
        console.log(`  ✓ Added columns: ${result.changes.addedColumns.join(', ')}`);
      }

      if (result.changes.idChanges > 0) {
        console.log(`  ✓ Converted ${result.changes.idChanges} IDs to PascalCase`);
      }

      if (result.changes.codesMoved > 0) {
        console.log(`  ✓ Moved ${result.changes.codesMoved} codes from ID to code field`);
      }

      if (result.changes.urlGenerated > 0) {
        console.log(`  ✓ Generated ${result.changes.urlGenerated} URLs`);
      }

      console.log(`  Original headers: ${result.originalHeaders.slice(0, 5).join(', ')}${result.originalHeaders.length > 5 ? '...' : ''}`);
      console.log(`  New headers: ${result.standardizedHeaders.slice(0, 7).join(', ')}${result.standardizedHeaders.length > 7 ? '...' : ''}`);
    });

  // Files without changes
  const filesWithoutChanges = results.filter(r =>
    r.changes.addedColumns.length === 0 &&
    r.changes.idChanges === 0 &&
    r.changes.urlGenerated === 0 &&
    r.changes.codesMoved === 0
  );

  if (filesWithoutChanges.length > 0) {
    console.log('\n\nFILES ALREADY STANDARDIZED:');
    console.log('-'.repeat(80));
    filesWithoutChanges.forEach(r => {
      console.log(`  ✓ ${r.file} (${r.rowsProcessed} rows)`);
    });
  }

  console.log('\n' + '='.repeat(80));
  if (dryRun) {
    console.log('DRY RUN COMPLETE - Review changes above before running actual standardization');
  } else {
    console.log('STANDARDIZATION COMPLETE');
    console.log(`Backup files created with .backup extension`);
  }
  console.log('='.repeat(80));
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');

// Run standardization
const results = standardizeAllTSVFiles(dryRun);
generateReport(results, dryRun);
