#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface Relationship {
  ns: string;
  from: string;
  to: string;
  predicate: string;
  reverse: string;
}

// Map of predicates to their reverse predicates
const reversePredicateMap: Record<string, string> = {
  has: 'isPartOf',
  uses: 'usedBy',
  offers: 'offeredBy',
  performs: 'performedBy',
  employs: 'employedBy',
  operatesIn: 'hasOrganization',
  isA: 'hasSubclass',
  manages: 'managedBy',
  requires: 'requiredBy',
  produces: 'producedBy',
  consumes: 'consumedBy',
  automatedBy: 'automates',
  measuredBy: 'measures',
  performedBy: 'performs',
  worksIn: 'hasWorker',
  replacedBy: 'replaces',
  augmentedBy: 'augments',
  soldTo: 'buys',
  deliveredBy: 'delivers',
  governs: 'governedBy',
  appliesTo: 'hasApplication',
  hosts: 'hostedBy',
  pursuedBy: 'pursues',
  tracks: 'trackedBy',
  threatens: 'threatenedBy',
  mitigatedBy: 'mitigates',
  implementedBy: 'implements',
  enabledBy: 'enables',
  supports: 'supportedBy',
  allocatedTo: 'allocatesFrom',
  involvesIn: 'involves',
  influences: 'influencedBy',
  leads: 'ledBy',
  reportsTo: 'manages',
  enables: 'enabledBy',
  augments: 'augmentedBy',
  replaces: 'replacedBy',
  delivers: 'deliveredBy',
  automates: 'automatedBy',
  generates: 'generatedBy',
  writes: 'writtenBy',
  adapts: 'adaptedBy',
  optimizes: 'optimizedBy',
  conducts: 'conductedBy',
  analyzes: 'analyzedBy',
  synthesizes: 'synthesizedBy',
  cites: 'citedBy',
  answers: 'answeredBy',
  resolves: 'resolvedBy',
  provides: 'providedBy',
  handles: 'handledBy',
  escalates: 'escalatedBy',
  learns: 'learnedBy',
  qualifies: 'qualifiedBy',
  schedules: 'scheduledBy',
  nurtures: 'nurturedBy',
  follows: 'followedBy',
  identifies: 'identifiedBy',
  creates: 'createdBy',
  reviews: 'reviewedBy',
  fixes: 'fixedBy',
  refactors: 'refactoredBy',
  designs: 'designedBy',
  translates: 'translatedBy',
  localizes: 'localizedBy',
  preserves: 'preservedBy',
  transcribes: 'transcribedBy',
  timestamps: 'timestampedBy',
  moderates: 'moderatedBy',
  detects: 'detectedBy',
  filters: 'filteredBy',
  flags: 'flaggedBy',
  personalizes: 'personalizedBy',
  recommends: 'recommendedBy',
  curates: 'curatedBy',
  finds: 'foundBy',
  coordinates: 'coordinatedBy',
  sends: 'sentBy',
  screens: 'screenedBy',
  matches: 'matchedBy',
  assesses: 'assessedBy',
  forecasts: 'forecastedBy',
  researches: 'researchedBy',
  drafts: 'draftedBy',
  edits: 'editedBy',
  orchestrates: 'orchestratedBy',
  integrates: 'integratedBy',
  monitors: 'monitoredBy',
  combines: 'combinedBy',
  routes: 'routedBy',
  exposes: 'exposedBy',
  serves: 'servedBy',
  issues: 'issuedBy',
  bills: 'billedBy',
  maintains: 'maintainedBy',
  ensures: 'ensuredBy',
  builds: 'builtBy',
  fosters: 'fosteredBy',
  processes: 'processedBy',
  prevents: 'preventedBy',
  renders: 'renderedBy',
  updates: 'updatedBy',
  streams: 'streamedBy',
  aggregates: 'aggregatedBy',
  returns: 'returnedBy',
  charges: 'chargedBy',
  curates: 'curatedBy',
  licenses: 'licensedBy',
  documents: 'documentedBy',
  validates: 'validatedBy',
  enriches: 'enrichedBy',
  normalizes: 'normalizedBy',
  compliesWith: 'governedBy',
  anonymizes: 'anonymizedBy',
  scrapes: 'scrapedBy',
  aggregates: 'aggregatedBy',
  enables: 'enabledBy',
  verifies: 'verifiedBy',
  categorizes: 'categorizedBy',
  ranks: 'rankedBy',
  monetizes: 'monetizedBy',
  updates: 'updatedBy',
  lists: 'listedBy',
  connects: 'connectedBy',
  compares: 'comparedBy',
  earns: 'earnedBy',
  operates: 'operatedBy',
  spans: 'spannedBy',
  establishes: 'establishedBy',
  prioritizes: 'prioritizedBy',
  invests: 'investedBy',
  enforces: 'enforcedBy',
  trades: 'tradedBy',
  files: 'filedBy',
  retains: 'retainedBy',
  avoids: 'avoidedBy',
  navigates: 'navigatedBy',
  owns: 'ownedBy',
  diversifies: 'diversifiedBy',
  allocates: 'allocatedBy',
  acquires: 'acquiredBy',
  consolidates: 'consolidatedBy',
  dominates: 'dominatedBy',
  sets: 'setBy',
  focuses: 'focusedBy',
  servesIn: 'hasService',
  participatesIn: 'hasParticipant',
  dependsOn: 'supports',
  sources: 'sourcedBy',
  displays: 'displayedBy',
  compliesWith: 'appliedTo',
  treats: 'treatedBy',
  dispenses: 'dispensedBy',
  counsels: 'counseledBy',
  facilitates: 'facilitatedBy',
  holds: 'heldBy',
  takes: 'takenBy',
  balances: 'balancedBy',
  onboards: 'onboardedBy',
  calculates: 'calculatedBy',
  collects: 'collectedBy',
  pursues: 'pursuedBy',
  seeks: 'soughtBy',
  raises: 'raisedBy',
  pivots: 'pivotedBy',
  validates: 'validatedBy',
  iterates: 'iteratedBy',
  disrupts: 'disruptedBy',
  tolerates: 'toleratedBy',
  scales: 'scaledBy',
  burns: 'burnedBy',
  competes: 'competedBy',
  funds: 'fundedBy',
  dilutes: 'dilutedBy',
  aims: 'aimedBy',
  recruits: 'recruitedBy',
  proves: 'provenBy',
  prepares: 'preparedBy',
  expands: 'expandedBy',
  develops: 'developedBy',
  runs: 'runBy',
  innovates: 'innovatedBy',
};

// Determine namespace based on entity type
function getNamespace(entity: string): string {
  const businessTypes = [
    'Business', 'AgenticBusiness', 'APIBusiness', 'DatasetBusiness', 'DirectoryBusiness',
    'Enterprise', 'LocalBusiness', 'Marketplace', 'OnlineBusiness', 'SaaS',
    'ServicesBusiness', 'Startup', 'EcommerceStore', 'SoftwareCompany', 'ContentPlatform',
    'RetailStore', 'Restaurant', 'LawFirm', 'AccountingFirm', 'MedicalPractice',
    'ConsultingFirm', 'AgencyBusiness', 'ProfessionalServicesFirm'
  ];

  const industries = ['Industry'];
  const occupations = ['Occupation', 'CEO', 'CFO', 'CTO', 'CMO', 'COO', 'CPO'];
  const departments = [
    'Department', 'FinanceDepartment', 'HumanResourcesDepartment', 'InformationTechnologyDepartment',
    'SalesDepartment', 'MarketingDepartment', 'OperationsDepartment', 'ProductDepartment',
    'EngineeringDepartment', 'CustomerSuccessDepartment', 'LegalDepartment'
  ];

  // Check for specific entity types
  if (businessTypes.some(t => entity.includes(t))) {
    return 'https://business.org.ai';
  } else if (industries.some(t => entity === t)) {
    return 'https://industries.org.ai';
  } else if (occupations.some(t => entity.includes(t)) || entity.includes('Engineer') || entity.includes('Manager') || entity.includes('Analyst')) {
    return 'https://occupations.org.ai';
  } else if (departments.some(t => entity.includes(t))) {
    return 'https://business.org.ai';
  }

  // Default to business namespace
  return 'https://business.org.ai';
}

// Parse GraphDL statement and convert to relationship
function parseGraphDL(line: string): Relationship | null {
  // Remove line numbers and leading arrow
  const cleanLine = line.replace(/^\s*\d+→/, '').trim();

  if (!cleanLine || cleanLine.startsWith('id\t')) {
    return null;
  }

  // Handle TSV format with tabs (Department.Relationships.tsv format)
  if (cleanLine.includes('\t')) {
    const parts = cleanLine.split('\t');
    if (parts.length >= 3) {
      const [subjectPredObj, fromType, toType, relationship] = parts;
      // Parse Subject.predicate.Object format
      const match = subjectPredObj.match(/^([^.]+)\.([^.]+)\.(.+)$/);
      if (match) {
        const [, subject, predicate, object] = match;
        const ns = getNamespace(subject);
        const from = `${ns}/${subject}/${subject}`;
        const to = `${getNamespace(object)}/${object}/${object}`;
        const reverse = reversePredicateMap[predicate] || `inverseOf${predicate.charAt(0).toUpperCase()}${predicate.slice(1)}`;

        return { ns, from, to, predicate, reverse };
      }
    }
  }

  // Parse Subject.predicate.Object format (standard GraphDL)
  const match = cleanLine.match(/^([^.]+)\.([^.]+)\.(.+)$/);
  if (!match) {
    return null;
  }

  const [, subject, predicate, object] = match;

  // Build full URLs
  const ns = getNamespace(subject);
  const from = `${ns}/${subject}/${subject}`;
  const to = `${getNamespace(object)}/${object}/${object}`;

  // Get reverse predicate
  const reverse = reversePredicateMap[predicate] || `inverseOf${predicate.charAt(0).toUpperCase()}${predicate.slice(1)}`;

  return {
    ns,
    from,
    to,
    predicate,
    reverse
  };
}

// Convert a single file
function convertFile(inputPath: string): Relationship[] {
  const content = readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');

  const relationships: Relationship[] = [];

  for (const line of lines) {
    const rel = parseGraphDL(line);
    if (rel) {
      relationships.push(rel);
    }
  }

  return relationships;
}

// Main conversion function
function main() {
  const sourceDir = '/Users/nathanclevenger/projects/graph.org.ai/.source/Business';
  const outputDir = '/Users/nathanclevenger/projects/graph.org.ai/.data';

  const files = [
    'Business.Relationships.tsv',
    'AgenticBusiness.Relationships.tsv',
    'APIBusiness.Relationships.tsv',
    'DatasetBusiness.Relationships.tsv',
    'Department.Relationships.tsv',
    'DirectoryBusiness.Relationships.tsv',
    'Enterprise.Relationships.tsv',
    'LocalBusiness.Relationships.tsv',
    'Marketplace.Relationships.tsv',
    'OnlineBusiness.Relationships.tsv',
    'SaaS.Relationships.tsv',
    'ServicesBusiness.Relationships.tsv',
    'Startup.Relationships.tsv'
  ];

  const allRelationships: Relationship[] = [];

  for (const file of files) {
    const inputPath = join(sourceDir, file);
    console.log(`Processing ${file}...`);

    try {
      const relationships = convertFile(inputPath);
      allRelationships.push(...relationships);
      console.log(`  Found ${relationships.length} relationships`);
    } catch (error) {
      console.error(`  Error processing ${file}:`, error);
    }
  }

  // Remove duplicates based on from+predicate+to
  const uniqueRelationships = Array.from(
    new Map(
      allRelationships.map(rel => [
        `${rel.from}|${rel.predicate}|${rel.to}`,
        rel
      ])
    ).values()
  );

  console.log(`\nTotal relationships: ${allRelationships.length}`);
  console.log(`Unique relationships: ${uniqueRelationships.length}`);

  // Generate output file
  const outputPath = join(outputDir, 'BusinessTypes.Relationships.tsv');

  // Create TSV content
  const tsvLines = [
    'ns\tfrom\tto\tpredicate\treverse',
    ...uniqueRelationships.map(rel =>
      `${rel.ns}\t${rel.from}\t${rel.to}\t${rel.predicate}\t${rel.reverse}`
    )
  ];

  const tsvContent = tsvLines.join('\n');
  writeFileSync(outputPath, tsvContent, 'utf-8');

  console.log(`\nGenerated ${outputPath}`);
  console.log(`Total relationships written: ${uniqueRelationships.length}`);
}

main();
