#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const BLS_SOURCE = path.join(__dirname, '../.source/BLS');
const DATA_DIR = path.join(__dirname, '../.data');

// Read occupation lookup table
const occupationLookup = {};
const occupationByCode = {};

console.log('Loading ONET occupations...');
const onetData = fs.readFileSync(path.join(DATA_DIR, 'Occupations.tsv'), 'utf-8');
const onetLines = onetData.split('\n');
const onetHeader = onetLines[0].split('\t');

for (let i = 1; i < onetLines.length; i++) {
  const line = onetLines[i].trim();
  if (!line) continue;

  const fields = line.split('\t');
  const id = fields[0];
  const name = fields[1];
  const code = fields[3]; // SOC code (e.g., 11-1011.00)

  if (code) {
    occupationLookup[code] = { id, name };
    occupationByCode[code] = { id, name };

    // Also store without hyphens and decimal (e.g., 111011)
    const blsCode = code.replace(/-/g, '').split('.')[0];
    occupationLookup[blsCode] = { id, name };
  }
}

console.log(`Loaded ${Object.keys(occupationLookup).length} ONET occupations`);

// Read BLS occupation names
const blsOccupationNames = {};
const blsOccData = fs.readFileSync(path.join(BLS_SOURCE, 'oe.occupation'), 'utf-8');
const blsOccLines = blsOccData.split('\n');

for (let i = 1; i < blsOccLines.length; i++) {
  const line = blsOccLines[i].trim();
  if (!line) continue;

  const fields = line.split('\t');
  const code = fields[0];
  const name = fields[1];

  blsOccupationNames[code] = name;
}

console.log(`Loaded ${Object.keys(blsOccupationNames).length} BLS occupation names`);

// Read datatype lookup
const datatypeLookup = {
  '01': 'employment',
  '02': 'employment_rse',
  '03': 'hourly_mean_wage',
  '04': 'annual_mean_wage',
  '05': 'wage_rse',
  '06': 'hourly_10th_percentile',
  '07': 'hourly_25th_percentile',
  '08': 'hourly_median',
  '09': 'hourly_75th_percentile',
  '10': 'hourly_90th_percentile',
  '11': 'annual_10th_percentile',
  '12': 'annual_25th_percentile',
  '13': 'annual_median',
  '14': 'annual_75th_percentile',
  '15': 'annual_90th_percentile',
  '16': 'employment_per_1000',
  '17': 'location_quotient'
};

// Parse BLS series ID to extract occupation code
// Format: OEUN000000000000OOOOOOODDD
// Where OOOOOOO is the occupation code (7 digits) and DD is datatype (2 digits)
function parseSeriesId(seriesId) {
  // OEUN (4 chars) + area (12 zeros for national) + occupation (7 chars) + datatype (2 chars)
  const match = seriesId.match(/^OEUN0{12}(\d{7})(\d{2})/);
  if (!match) return null;

  // Remove leading zero from occupation code (e.g., 0111011 -> 111011)
  const occupationCode = match[1].replace(/^0+/, '');

  return {
    occupationCode: occupationCode,
    datatypeCode: match[2]
  };
}

// Process BLS OES National data
console.log('\nProcessing BLS OES National May 2024 data...');
const oesData = fs.readFileSync(path.join(BLS_SOURCE, 'BLS.OES.National.May2024.tsv'), 'utf-8');
const oesLines = oesData.split('\n');

const employmentByOccupation = {};
const wagesByOccupation = {};

let processedCount = 0;
let matchedCount = 0;
let totalLines = 0;

for (let i = 0; i < oesLines.length; i++) {
  const line = oesLines[i].trim();
  if (!line) continue;

  totalLines++;
  const fields = line.split('\t');
  const seriesId = fields[0];
  const year = fields[1];
  const period = fields[2];
  const value = fields[3]?.trim();

  const parsed = parseSeriesId(seriesId);
  if (!parsed) continue;

  processedCount++;

  const { occupationCode, datatypeCode } = parsed;
  const datatype = datatypeLookup[datatypeCode];
  if (!datatype) continue;

  // Get occupation name from BLS
  const blsOccName = blsOccupationNames[occupationCode];
  if (!blsOccName) continue;

  // Try to match with ONET
  const onetMatch = occupationLookup[occupationCode];

  // Create or update occupation record
  const occupationKey = onetMatch ? onetMatch.id : blsOccName.replace(/[^a-zA-Z0-9]+/g, '');
  const occupationName = onetMatch ? onetMatch.name : blsOccName;

  if (onetMatch) matchedCount++;

  // Store employment data
  if (datatype === 'employment') {
    if (!employmentByOccupation[occupationKey]) {
      employmentByOccupation[occupationKey] = {
        id: occupationKey,
        name: occupationName,
        code: occupationCode,
        employment: parseInt(value) || 0,
        matched: !!onetMatch
      };
    }
  }

  // Store wage data (includes all wage fields and median)
  if (datatype.includes('wage') || datatype.includes('percentile') || datatype.includes('median')) {
    if (!wagesByOccupation[occupationKey]) {
      wagesByOccupation[occupationKey] = {
        id: occupationKey,
        name: occupationName,
        code: occupationCode,
        matched: !!onetMatch
      };
    }

    const cleanValue = value?.replace(/[^0-9.]/g, '');
    if (cleanValue && cleanValue !== '-' && cleanValue !== '*' && cleanValue !== '#') {
      wagesByOccupation[occupationKey][datatype] = parseFloat(cleanValue) || null;
    }
  }
}

console.log(`Total lines: ${totalLines}`);
console.log(`Processed ${processedCount} records`);
console.log(`Matched ${matchedCount} with ONET occupations`);

// Write Employment data
console.log('\nWriting Employment.tsv...');
const employmentRecords = Object.values(employmentByOccupation);
const employmentTsv = [
  'id\tname\tcode\temployment\tmatched_onet',
  ...employmentRecords.map(r =>
    `${r.id}\t${r.name}\t${r.code}\t${r.employment}\t${r.matched}`
  )
].join('\n');

fs.writeFileSync(path.join(DATA_DIR, 'Employment.tsv'), employmentTsv);
console.log(`Wrote ${employmentRecords.length} employment records`);

// Write Wages data
console.log('\nWriting Wages.tsv...');
const wageRecords = Object.values(wagesByOccupation);
const wageTsv = [
  'id\tname\tcode\tannual_mean\tannual_median\tannual_10th\tannual_25th\tannual_75th\tannual_90th\thourly_mean\thourly_median\tmatched_onet',
  ...wageRecords.map(r =>
    `${r.id}\t${r.name}\t${r.code}\t${r.annual_mean_wage || ''}\t${r.annual_median || ''}\t${r.annual_10th_percentile || ''}\t${r.annual_25th_percentile || ''}\t${r.annual_75th_percentile || ''}\t${r.annual_90th_percentile || ''}\t${r.hourly_mean_wage || ''}\t${r.hourly_median || ''}\t${r.matched}`
  )
].join('\n');

fs.writeFileSync(path.join(DATA_DIR, 'Wages.tsv'), wageTsv);
console.log(`Wrote ${wageRecords.length} wage records`);

// Process STEM occupations
console.log('\nProcessing STEM occupations...');
const stemData = fs.readFileSync(path.join(BLS_SOURCE, 'BLS.STEM.STEM_occupations_list.tsv'), 'utf-8');
const stemLines = stemData.split('\n');

const stemOccupations = [];
let stemHeader = false;

for (let i = 0; i < stemLines.length; i++) {
  const line = stemLines[i].trim();
  if (!line) continue;

  // Skip header rows
  if (line.includes('NOTE:') || line.includes('listOfOccupations') || line === 'eMPTY') continue;
  if (line.includes('OEWS May 2024 Code')) {
    stemHeader = true;
    continue;
  }
  if (!stemHeader) continue;

  const fields = line.split('\t');
  const code = fields[0]; // Format: 11-3021
  const name = fields[1];

  if (!code || !name) continue;

  // Convert to BLS format (without hyphens)
  const blsCode = code.replace(/-/g, '');

  // Match with ONET
  const onetMatch = occupationLookup[blsCode];
  const occupationKey = onetMatch ? onetMatch.id : name.replace(/[^a-zA-Z0-9]+/g, '');
  const occupationName = onetMatch ? onetMatch.name : name;

  // Get employment and wage data
  const employment = employmentByOccupation[occupationKey]?.employment || 0;
  const annualMean = wagesByOccupation[occupationKey]?.annual_mean_wage || '';

  stemOccupations.push({
    id: occupationKey,
    name: occupationName,
    code: code,
    employment: employment,
    annual_mean_wage: annualMean,
    matched: !!onetMatch
  });
}

// Write STEM occupations
console.log('\nWriting STEMOccupations.tsv...');
const stemTsv = [
  'id\tname\tcode\temployment\tannual_mean_wage\tmatched_onet',
  ...stemOccupations.map(r =>
    `${r.id}\t${r.name}\t${r.code}\t${r.employment}\t${r.annual_mean_wage}\t${r.matched}`
  )
].join('\n');

fs.writeFileSync(path.join(DATA_DIR, 'STEMOccupations.tsv'), stemTsv);
console.log(`Wrote ${stemOccupations.length} STEM occupation records`);

// Summary statistics
console.log('\n=== Summary ===');
console.log(`Employment records: ${employmentRecords.length}`);
console.log(`Wage records: ${wageRecords.length}`);
console.log(`STEM occupations: ${stemOccupations.length}`);
console.log(`\nONET match rate: ${((matchedCount / processedCount) * 100).toFixed(2)}%`);

// Sample records
console.log('\n=== Sample Employment Records ===');
employmentRecords.slice(0, 5).forEach(r => {
  console.log(`${r.id}: ${r.name} - ${r.employment.toLocaleString()} employees`);
});

console.log('\n=== Sample Wage Records ===');
wageRecords.slice(0, 5).forEach(r => {
  console.log(`${r.id}: ${r.name} - Mean: $${r.annual_mean_wage?.toLocaleString()}, Median: $${r.annual_median?.toLocaleString()}`);
});

console.log('\n=== Sample STEM Occupations ===');
stemOccupations.slice(0, 5).forEach(r => {
  console.log(`${r.id}: ${r.name} - ${r.employment.toLocaleString()} employees, $${r.annual_mean_wage?.toLocaleString()}/year`);
});

console.log('\nDone!');
