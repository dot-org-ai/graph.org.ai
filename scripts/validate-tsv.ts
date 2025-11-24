#!/usr/bin/env node
/**
 * TSV Validation Script
 *
 * Validates all .data/*.tsv files (excluding *.Relationships.tsv) against the standard schema:
 * url	ns	type	id	code	name	description	[...additional columns...]
 *
 * Checks:
 * 1. Header structure includes required columns
 * 2. All IDs are PascalCase
 * 3. Required fields are populated
 * 4. URL format is correct
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface ValidationIssue {
  file: string;
  line: number;
  type: 'error' | 'warning';
  message: string;
}

interface ValidationResult {
  file: string;
  issues: ValidationIssue[];
  stats: {
    totalLines: number;
    headerColumns: string[];
    hasUrl: boolean;
    hasNs: boolean;
    hasType: boolean;
    hasId: boolean;
    hasCode: boolean;
    hasName: boolean;
    hasDescription: boolean;
  };
}

const REQUIRED_COLUMNS = ['url', 'ns', 'type', 'id', 'code', 'name', 'description'];
const DATA_DIR = '/Users/nathanclevenger/projects/graph.org.ai/.data';

/**
 * Check if a string is PascalCase
 */
function isPascalCase(str: string): boolean {
  if (!str || str.trim() === '') return false;

  // PascalCase: starts with uppercase, contains only letters, numbers, and underscores
  // Must start with uppercase letter
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9_]*$/;

  // Also check it's not all uppercase (that's CONSTANT_CASE)
  const isAllUppercase = str === str.toUpperCase() && str.includes('_');

  return pascalCaseRegex.test(str) && !isAllUppercase;
}

/**
 * Convert a name to PascalCase ID
 */
function toPascalCase(name: string): string {
  return name
    .split(/[\s\-_\.]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Validate a single TSV file
 */
function validateTSVFile(filePath: string): ValidationResult {
  const fileName = filePath.split('/').pop() || filePath;
  const issues: ValidationIssue[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    return {
      file: fileName,
      issues: [{ file: fileName, line: 0, type: 'error', message: 'File is empty' }],
      stats: {
        totalLines: 0,
        headerColumns: [],
        hasUrl: false,
        hasNs: false,
        hasType: false,
        hasId: false,
        hasCode: false,
        hasName: false,
        hasDescription: false,
      }
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split('\t');

  // Check for required columns
  const stats = {
    totalLines: lines.length - 1,
    headerColumns: headers,
    hasUrl: headers.includes('url'),
    hasNs: headers.includes('ns'),
    hasType: headers.includes('type'),
    hasId: headers.includes('id'),
    hasCode: headers.includes('code'),
    hasName: headers.includes('name'),
    hasDescription: headers.includes('description'),
  };

  // Validate header structure
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    issues.push({
      file: fileName,
      line: 1,
      type: 'error',
      message: `Missing required columns: ${missingColumns.join(', ')}`
    });
  }

  // Check column order (warning only)
  const expectedOrder = REQUIRED_COLUMNS.filter(col => headers.includes(col));
  const actualOrder = headers.filter(col => REQUIRED_COLUMNS.includes(col));
  if (JSON.stringify(expectedOrder) !== JSON.stringify(actualOrder)) {
    issues.push({
      file: fileName,
      line: 1,
      type: 'warning',
      message: `Column order differs from standard. Expected: ${expectedOrder.join(', ')}`
    });
  }

  // Get column indices
  const idIdx = headers.indexOf('id');
  const typeIdx = headers.indexOf('type');
  const nameIdx = headers.indexOf('name');
  const urlIdx = headers.indexOf('url');
  const nsIdx = headers.indexOf('ns');
  const codeIdx = headers.indexOf('code');

  // Validate data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const lineNum = i + 1;
    const columns = line.split('\t');

    // Check ID field
    if (idIdx !== -1 && columns[idIdx]) {
      const id = columns[idIdx];

      // Check if ID is PascalCase
      if (!isPascalCase(id)) {
        const name = nameIdx !== -1 ? columns[nameIdx] : '';
        const suggestion = name ? ` (suggested: ${toPascalCase(name)})` : '';
        issues.push({
          file: fileName,
          line: lineNum,
          type: 'error',
          message: `ID '${id}' is not PascalCase${suggestion}`
        });
      }
    } else if (idIdx !== -1) {
      issues.push({
        file: fileName,
        line: lineNum,
        type: 'error',
        message: 'Missing ID field'
      });
    }

    // Check required fields are populated
    if (typeIdx !== -1 && !columns[typeIdx]) {
      issues.push({
        file: fileName,
        line: lineNum,
        type: 'error',
        message: 'Missing type field'
      });
    }

    if (nameIdx !== -1 && !columns[nameIdx]) {
      issues.push({
        file: fileName,
        line: lineNum,
        type: 'warning',
        message: 'Missing name field'
      });
    }

    // Validate URL format if present
    if (urlIdx !== -1 && columns[urlIdx]) {
      const url = columns[urlIdx];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        issues.push({
          file: fileName,
          line: lineNum,
          type: 'error',
          message: `Invalid URL format: ${url}`
        });
      }
    }

    // Check namespace format if present
    if (nsIdx !== -1 && columns[nsIdx]) {
      const ns = columns[nsIdx];
      if (!ns.includes('.')) {
        issues.push({
          file: fileName,
          line: lineNum,
          type: 'warning',
          message: `Namespace '${ns}' doesn't follow domain format (e.g., 'example.org.ai')`
        });
      }
    }

    // Check if code field exists and is different from id (for ONET-style data)
    if (codeIdx !== -1 && idIdx !== -1 && columns[codeIdx] && columns[idIdx]) {
      const code = columns[codeIdx];
      const id = columns[idIdx];

      // If code looks like an ID pattern (has dots or hyphens) and ID is the same, flag it
      if (code === id && /[\.\-]/.test(code)) {
        issues.push({
          file: fileName,
          line: lineNum,
          type: 'warning',
          message: `ID '${id}' appears to be a code (contains dots/hyphens). Should be PascalCase derived from name.`
        });
      }
    }
  }

  return {
    file: fileName,
    issues,
    stats
  };
}

/**
 * Main validation function
 */
function validateAllTSVFiles(): ValidationResult[] {
  const files = readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.tsv') && !f.endsWith('.Relationships.tsv'))
    .map(f => join(DATA_DIR, f));

  console.log(`Found ${files.length} TSV files to validate\n`);

  const results = files.map(validateTSVFile);

  return results;
}

/**
 * Generate validation report
 */
function generateReport(results: ValidationResult[]): void {
  const totalFiles = results.length;
  const filesWithIssues = results.filter(r => r.issues.length > 0).length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const totalErrors = results.reduce((sum, r) =>
    sum + r.issues.filter(i => i.type === 'error').length, 0);
  const totalWarnings = results.reduce((sum, r) =>
    sum + r.issues.filter(i => i.type === 'warning').length, 0);

  console.log('='.repeat(80));
  console.log('TSV VALIDATION REPORT');
  console.log('='.repeat(80));
  console.log();
  console.log(`Total files validated: ${totalFiles}`);
  console.log(`Files with issues: ${filesWithIssues}`);
  console.log(`Total issues: ${totalIssues} (${totalErrors} errors, ${totalWarnings} warnings)`);
  console.log();

  // Files without standard headers
  console.log('HEADER VALIDATION');
  console.log('-'.repeat(80));
  const filesWithMissingHeaders = results.filter(r =>
    !r.stats.hasUrl || !r.stats.hasNs || !r.stats.hasType ||
    !r.stats.hasId || !r.stats.hasCode || !r.stats.hasName || !r.stats.hasDescription
  );

  if (filesWithMissingHeaders.length > 0) {
    console.log(`\n${filesWithMissingHeaders.length} files missing standard headers:\n`);
    filesWithMissingHeaders.forEach(r => {
      const missing = [];
      if (!r.stats.hasUrl) missing.push('url');
      if (!r.stats.hasNs) missing.push('ns');
      if (!r.stats.hasType) missing.push('type');
      if (!r.stats.hasId) missing.push('id');
      if (!r.stats.hasCode) missing.push('code');
      if (!r.stats.hasName) missing.push('name');
      if (!r.stats.hasDescription) missing.push('description');

      console.log(`  ${r.file}`);
      console.log(`    Missing: ${missing.join(', ')}`);
      console.log(`    Current headers: ${r.stats.headerColumns.slice(0, 5).join(', ')}...`);
    });
  } else {
    console.log('✓ All files have required headers');
  }

  // ID validation issues
  console.log('\n\nID VALIDATION');
  console.log('-'.repeat(80));
  const filesWithIdIssues = results.filter(r =>
    r.issues.some(i => i.message.includes('ID') && i.message.includes('not PascalCase'))
  );

  if (filesWithIdIssues.length > 0) {
    console.log(`\n${filesWithIdIssues.length} files with non-PascalCase IDs:\n`);
    filesWithIdIssues.forEach(r => {
      const idIssues = r.issues.filter(i => i.message.includes('not PascalCase'));
      console.log(`  ${r.file} (${idIssues.length} issues)`);
      // Show first 5 examples
      idIssues.slice(0, 5).forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.message}`);
      });
      if (idIssues.length > 5) {
        console.log(`    ... and ${idIssues.length - 5} more`);
      }
    });
  } else {
    console.log('✓ All IDs are PascalCase');
  }

  // Detailed issues by file
  console.log('\n\nDETAILED ISSUES BY FILE');
  console.log('-'.repeat(80));

  results.forEach(result => {
    if (result.issues.length === 0) return;

    console.log(`\n${result.file} (${result.issues.length} issues, ${result.stats.totalLines} rows)`);

    // Group issues by type
    const errors = result.issues.filter(i => i.type === 'error');
    const warnings = result.issues.filter(i => i.type === 'warning');

    if (errors.length > 0) {
      console.log(`  ERRORS (${errors.length}):`);
      errors.slice(0, 10).forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.message}`);
      });
      if (errors.length > 10) {
        console.log(`    ... and ${errors.length - 10} more errors`);
      }
    }

    if (warnings.length > 0) {
      console.log(`  WARNINGS (${warnings.length}):`);
      warnings.slice(0, 10).forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.message}`);
      });
      if (warnings.length > 10) {
        console.log(`    ... and ${warnings.length - 10} more warnings`);
      }
    }
  });

  // Summary by issue type
  console.log('\n\nSUMMARY BY ISSUE TYPE');
  console.log('-'.repeat(80));

  const issueTypes = new Map<string, number>();
  results.forEach(r => {
    r.issues.forEach(issue => {
      const key = issue.message.split(':')[0];
      issueTypes.set(key, (issueTypes.get(key) || 0) + 1);
    });
  });

  Array.from(issueTypes.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  console.log('\n' + '='.repeat(80));
  console.log(`VALIDATION COMPLETE: ${totalErrors} errors, ${totalWarnings} warnings`);
  console.log('='.repeat(80));
}

// Run validation
const results = validateAllTSVFiles();
generateReport(results);

// Exit with error code if there are errors
const hasErrors = results.some(r => r.issues.some(i => i.type === 'error'));
process.exit(hasErrors ? 1 : 0);
