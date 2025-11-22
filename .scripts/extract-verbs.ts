/**
 * Extract verb forms from verbs.org.ai/*.mdx files
 * Creates .enrichment/Language/Language.Verbs.tsv
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

interface VerbData {
  id: string;
  name: string;
  canonicalForm: string;
  description: string;
  predicate: string; // present tense (e.g., "analyzes")
  event: string; // past tense (e.g., "analyzed")
  activity: string; // gerund/present participle (e.g., "analyzing")
  actor: string; // agent noun (e.g., "Analyzer")
  object: string; // result noun (e.g., "Analysis")
  inverse: string; // passive form (e.g., "analyzedBy")
  source: string;
  vocabulary: string;
}

function parseMDXFrontmatter(content: string): Partial<VerbData> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  const data: any = {};

  // Parse each line
  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\$?[\w]+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Remove $ prefix and convert to camelCase property name
      const propName = key.startsWith('$') ? key.slice(1) : key;
      data[propName] = value;
    }
  });

  return data;
}

function extractVerbs() {
  const verbsDir = 'verbs.org.ai';
  const files = readdirSync(verbsDir).filter(f => f.endsWith('.mdx'));

  console.log(`Found ${files.length} verb MDX files`);

  const verbs: VerbData[] = [];

  for (const file of files) {
    const filePath = join(verbsDir, file);
    const content = readFileSync(filePath, 'utf-8');
    const data = parseMDXFrontmatter(content);

    if (data.id) {
      verbs.push({
        id: data.id || '',
        name: data.name || data.id || '',
        canonicalForm: data.canonicalForm || data.id || '',
        description: data.description || '',
        predicate: data.predicate || '',
        event: data.event || '',
        activity: data.activity || '',
        actor: data.actor || '',
        object: data.object || '',
        inverse: data.inverse || '',
        source: data.source || '',
        vocabulary: data.vocabulary || '',
      });
    }
  }

  // Sort by id
  verbs.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`Extracted ${verbs.length} verbs`);

  // Create output directory
  mkdirSync('.enrichment/Language', { recursive: true });

  // Write TSV
  const headers = [
    'id',
    'name',
    'canonicalForm',
    'description',
    'predicate',
    'event',
    'activity',
    'actor',
    'object',
    'inverse',
    'source',
    'vocabulary',
  ];

  const rows = verbs.map(v => [
    v.id,
    v.name,
    v.canonicalForm,
    v.description,
    v.predicate,
    v.event,
    v.activity,
    v.actor,
    v.object,
    v.inverse,
    v.source,
    v.vocabulary,
  ]);

  const tsv = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  writeFileSync('.enrichment/Language/Language.Verbs.tsv', tsv);
  console.log('✓ Written to .enrichment/Language/Language.Verbs.tsv');

  // Print some stats
  console.log('\nSample verbs:');
  verbs.slice(0, 5).forEach(v => {
    console.log(`  ${v.canonicalForm}: ${v.predicate}, ${v.event}, ${v.activity}`);
  });
}

extractVerbs();
