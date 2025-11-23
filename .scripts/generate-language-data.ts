#!/usr/bin/env tsx
/**
 * Generate language data TSV files from enrichment sources
 * Creates: Verbs.tsv, Nouns.tsv, Concepts.tsv, etc.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ENRICHMENT_DIR = join(process.cwd(), '..', '.enrichment', 'Language');
const OUTPUT_DIR = join(process.cwd(), '..', '.source', 'Language');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

interface VerbRow {
  canonicalForm: string;
  description: string;
  predicate: string;
  event: string;
  activity: string;
  actor: string;
  object: string;
  inverse: string;
  source: string;
  vocabulary: string;
}

interface LanguageRow {
  word: string;
  description?: string;
  partOfSpeech: string;
  category?: string;
  source?: string;
}

function parseTSV<T>(filePath: string): T[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');

  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj as T;
  });
}

function generateVerbsData() {
  console.log('Processing verbs...');
  const verbs = parseTSV<VerbRow>(join(ENRICHMENT_DIR, 'Language.Verbs.tsv'));

  const output = ['id\tname\ttitle\tdescription\tdata'];

  for (const verb of verbs) {
    const id = `language:verb:${verb.canonicalForm}`;
    const name = verb.canonicalForm;
    const title = verb.canonicalForm.charAt(0).toUpperCase() + verb.canonicalForm.slice(1);
    const description = verb.description;

    // Create data object with conjugations and metadata
    const data = {
      canonicalForm: verb.canonicalForm,
      predicate: verb.predicate,
      event: verb.event,
      activity: verb.activity,
      actor: verb.actor,
      object: verb.object,
      inverse: verb.inverse,
      source: verb.source,
      vocabulary: verb.vocabulary,
      description: verb.description,
    };

    const dataJson = JSON.stringify(data).replace(/\t/g, ' ');
    output.push(`${id}\t${name}\t${title}\t${description}\t${dataJson}`);
  }

  const outputPath = join(OUTPUT_DIR, 'Language.Verbs.tsv');
  writeFileSync(outputPath, output.join('\n'));
  console.log(`✓ Generated ${output.length - 1} verbs -> ${outputPath}`);
}

function generateLanguageData(filename: string, partOfSpeech: string) {
  console.log(`Processing ${partOfSpeech.toLowerCase()}s...`);
  const filePath = join(ENRICHMENT_DIR, filename);
  const rows = parseTSV<any>(filePath);

  const output = ['id\tname\ttitle\tdescription\tdata'];

  for (const row of rows) {
    // First column is usually the id/word
    const word = row.id || row.canonicalForm || Object.values(row)[0] as string;
    if (!word) continue;

    const namespace = `language:${partOfSpeech.toLowerCase()}:${word.toLowerCase()}`;
    const name = word;
    const title = word.charAt(0).toUpperCase() + word.slice(1);
    const description = row.description || `${partOfSpeech}: ${word}`;

    const data = {
      word,
      partOfSpeech,
      ...row,
    };

    const dataJson = JSON.stringify(data).replace(/\t/g, ' ');
    output.push(`${namespace}\t${name}\t${title}\t${description}\t${dataJson}`);
  }

  const outputPath = join(OUTPUT_DIR, filename);
  writeFileSync(outputPath, output.join('\n'));
  console.log(`✓ Generated ${output.length - 1} ${partOfSpeech.toLowerCase()}s -> ${outputPath}`);
}

// Process all language files
try {
  generateVerbsData();
  generateLanguageData('Language.Concepts.tsv', 'Concept');
  generateLanguageData('Language.Adverbs.tsv', 'Adverb');
  generateLanguageData('Language.Conjunctions.tsv', 'Conjunction');
  generateLanguageData('Language.Determiners.tsv', 'Determiner');
  generateLanguageData('Language.Prepositions.tsv', 'Preposition');
  generateLanguageData('Language.Pronouns.tsv', 'Pronoun');

  console.log('\n✅ All language data generated successfully!');
} catch (error) {
  console.error('Error generating language data:', error);
  process.exit(1);
}
