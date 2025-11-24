#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../.data');

console.log('=== BLS Data Validation ===\n');

// Validate Employment.tsv
console.log('1. Employment.tsv Validation:');
const employment = fs.readFileSync(path.join(DATA_DIR, 'Employment.tsv'), 'utf-8').split('\n');
const empWithData = employment.filter((line, i) => i > 0 && line.trim()).length;
const empWithEmployment = employment.filter((line, i) => {
  if (i === 0 || !line.trim()) return false;
  const fields = line.split('\t');
  return parseInt(fields[3]) > 0;
}).length;
console.log(`   - Total records: ${empWithData}`);
console.log(`   - Records with employment > 0: ${empWithEmployment} (${(empWithEmployment/empWithData*100).toFixed(1)}%)`);
console.log(`   - Records with 0 employment: ${empWithData - empWithEmployment}`);

// Validate Wages.tsv
console.log('\n2. Wages.tsv Validation:');
const wages = fs.readFileSync(path.join(DATA_DIR, 'Wages.tsv'), 'utf-8').split('\n');
const wageWithData = wages.filter((line, i) => i > 0 && line.trim()).length;
let wageStats = {
  withMean: 0,
  withMedian: 0,
  withPercentiles: 0,
  withHourly: 0
};

wages.forEach((line, i) => {
  if (i === 0 || !line.trim()) return;
  const fields = line.split('\t');
  if (fields[3]) wageStats.withMean++;
  if (fields[4]) wageStats.withMedian++;
  if (fields[5] && fields[6] && fields[7] && fields[8]) wageStats.withPercentiles++;
  if (fields[9] && fields[10]) wageStats.withHourly++;
});

console.log(`   - Total records: ${wageWithData}`);
console.log(`   - Records with annual mean wage: ${wageStats.withMean} (${(wageStats.withMean/wageWithData*100).toFixed(1)}%)`);
console.log(`   - Records with annual median wage: ${wageStats.withMedian} (${(wageStats.withMedian/wageWithData*100).toFixed(1)}%)`);
console.log(`   - Records with all percentiles: ${wageStats.withPercentiles} (${(wageStats.withPercentiles/wageWithData*100).toFixed(1)}%)`);
console.log(`   - Records with hourly data: ${wageStats.withHourly} (${(wageStats.withHourly/wageWithData*100).toFixed(1)}%)`);

// Validate STEMOccupations.tsv
console.log('\n3. STEMOccupations.tsv Validation:');
const stem = fs.readFileSync(path.join(DATA_DIR, 'STEMOccupations.tsv'), 'utf-8').split('\n');
const stemWithData = stem.filter((line, i) => i > 0 && line.trim()).length;
const stemWithBoth = stem.filter((line, i) => {
  if (i === 0 || !line.trim()) return false;
  const fields = line.split('\t');
  return parseInt(fields[3]) > 0 && parseFloat(fields[4]) > 0;
}).length;

console.log(`   - Total STEM occupations: ${stemWithData}`);
console.log(`   - STEM with both employment and wage data: ${stemWithBoth} (${(stemWithBoth/stemWithData*100).toFixed(1)}%)`);

// Cross-validation
console.log('\n4. Cross-File Validation:');
const empIds = new Set(employment.slice(1).filter(l => l.trim()).map(l => l.split('\t')[0]));
const wageIds = new Set(wages.slice(1).filter(l => l.trim()).map(l => l.split('\t')[0]));
const stemIds = new Set(stem.slice(1).filter(l => l.trim()).map(l => l.split('\t')[0]));

const empInWages = [...empIds].filter(id => wageIds.has(id)).length;
const stemInEmp = [...stemIds].filter(id => empIds.has(id)).length;
const stemInWages = [...stemIds].filter(id => wageIds.has(id)).length;

console.log(`   - Employment IDs also in Wages: ${empInWages}/${empIds.size} (${(empInWages/empIds.size*100).toFixed(1)}%)`);
console.log(`   - STEM IDs in Employment: ${stemInEmp}/${stemIds.size} (${(stemInEmp/stemIds.size*100).toFixed(1)}%)`);
console.log(`   - STEM IDs in Wages: ${stemInWages}/${stemIds.size} (${(stemInWages/stemIds.size*100).toFixed(1)}%)`);

console.log('\n✓ Validation complete!\n');
