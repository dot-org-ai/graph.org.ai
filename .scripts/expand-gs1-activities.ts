#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Expand GS1 BusinessSteps (verbs) with all applicable GS1 Classes (nouns)
 * Creates GraphDL-style activities: ship.Goods, ship.Product, ship.Container, etc.
 */

interface BusinessStep {
  id: string
  verb: string
  defaultNoun: string
  label: string
}

interface GS1Class {
  id: string
  label: string
  type: string
}

interface Activity {
  id: string
  verb: string
  noun: string
  businessStep: string
  description: string
}

function parseBusinessSteps(tsvPath: string): BusinessStep[] {
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header
  
  return lines
    .filter(line => line.trim())
    .map(line => {
      const [id, verb, noun, label] = line.split('\t')
      return { id, verb, defaultNoun: noun, label }
    })
}

function parseGS1Classes(tsvPath: string): GS1Class[] {
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header
  
  return lines
    .filter(line => line.trim())
    .map(line => {
      const [id, label, type] = line.split('\t')
      if (type === 'Class') {
        return { id, label, type }
      }
      return null
    })
    .filter(c => c !== null) as GS1Class[]
}

function isApplicable(verb: string, noun: string): boolean {
  // Define which verbs apply to which nouns
  
  // Physical objects that can be moved/handled
  const physicalNouns = ['Product', 'TradeItem', 'ConsumerProduct', 'FoodBeverageTobaccoProduct', 
    'HealthcareProduct', 'NonFoodProduct', 'LogisticUnit', 'Package', 'Packaging', 
    'Asset', 'ReturnableAsset', 'Pallet', 'Container']
  
  // Documents
  const documentNouns = ['Document', 'Certificate', 'Certification', 'CertificationRecord']
  
  // Locations
  const locationNouns = ['Place', 'Location', 'PostalAddress']
  
  // Organizations
  const orgNouns = ['Organization', 'Brand', 'Manufacturer', 'Distributor', 'Retailer']
  
  // Movement/logistics verbs
  const movementVerbs = ['ship', 'transport', 'load', 'unload', 'receive', 'accept', 
    'arrive', 'depart', 'consign', 'hold', 'store', 'stage']
  
  // Handling/processing verbs
  const handlingVerbs = ['pack', 'unpack', 'repackage', 'assemble', 'disassemble', 
    'collect', 'pick', 'remove']
  
  // Quality/inspection verbs
  const qualityVerbs = ['inspect', 'sample', 'count']
  
  // Lifecycle verbs
  const lifecycleVerbs = ['commission', 'decommission', 'destroy', 'dispose', 'repair', 
    'replace', 'install']
  
  // Transaction verbs
  const transactionVerbs = ['sell', 'reserve']
  
  // Document verbs
  const documentVerbs = ['encode', 'report']
  
  // Movement/logistics apply to physical objects
  if (movementVerbs.includes(verb) && physicalNouns.includes(noun)) {
    return true
  }
  
  // Handling applies to physical objects
  if (handlingVerbs.includes(verb) && physicalNouns.includes(noun)) {
    return true
  }
  
  // Quality verbs apply to products and logistics units
  if (qualityVerbs.includes(verb) && 
      (noun.includes('Product') || noun === 'LogisticUnit' || noun === 'Package')) {
    return true
  }
  
  // Lifecycle verbs apply to assets and products
  if (lifecycleVerbs.includes(verb) && 
      (noun.includes('Product') || noun.includes('Asset') || noun === 'Equipment')) {
    return true
  }
  
  // Transaction verbs apply to products
  if (transactionVerbs.includes(verb) && noun.includes('Product')) {
    return true
  }
  
  // Document/data verbs apply to documents
  if (documentVerbs.includes(verb) && (documentNouns.includes(noun) || noun.includes('Data'))) {
    return true
  }
  
  // Arrive/depart apply to locations
  if ((verb === 'arrive' || verb === 'depart' || verb === 'enter') && locationNouns.includes(noun)) {
    return true
  }
  
  return false
}

async function main() {
  const sourceDir = path.resolve(__dirname, '../.source/GS1')
  const dataDir = path.resolve(__dirname, '../.data')
  
  console.log('='.repeat(80))
  console.log('GS1 ACTIVITY EXPANSION')
  console.log('='.repeat(80))
  console.log()
  
  // Load business steps (verb mappings)
  console.log('Loading business steps...')
  const businessSteps = parseBusinessSteps(path.join(sourceDir, 'GS1.BusinessStep.VerbMapping.tsv'))
  console.log(`  ✓ Loaded ${businessSteps.length} business steps`)
  
  // Load GS1 classes (nouns)
  console.log('Loading GS1 classes...')
  const gs1Classes = parseGS1Classes(path.join(sourceDir, 'GS1.Vocabulary.tsv'))
  console.log(`  ✓ Loaded ${gs1Classes.length} GS1 classes`)
  console.log()
  
  // Generate all applicable combinations
  console.log('Generating verb-noun combinations...')
  const activities: Activity[] = []
  
  for (const step of businessSteps) {
    for (const cls of gs1Classes) {
      if (isApplicable(step.verb, cls.id)) {
        activities.push({
          id: `${step.verb}.${cls.id}`,
          verb: step.verb,
          noun: cls.id,
          businessStep: step.id,
          description: `${step.label} ${cls.label.toLowerCase()}`
        })
      }
    }
  }
  
  console.log(`  ✓ Generated ${activities.length} activities`)
  console.log()
  
  // Group by verb to show expansion
  const byVerb = new Map<string, Activity[]>()
  for (const activity of activities) {
    if (!byVerb.has(activity.verb)) {
      byVerb.set(activity.verb, [])
    }
    byVerb.get(activity.verb)!.push(activity)
  }
  
  console.log('Sample expansions by verb:')
  for (const [verb, acts] of byVerb) {
    if (acts.length > 0) {
      const sample = acts.slice(0, 5).map(a => a.id).join(', ')
      console.log(`  ${verb}: ${acts.length} combinations (${sample}...)`)
    }
  }
  console.log()
  
  // Write activities TSV
  const outputPath = path.join(dataDir, 'GS1.Activities.tsv')
  const header = 'id\tverb\tnoun\tbusinessStep\tdescription\n'
  const rows = activities
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(a => `${a.id}\t${a.verb}\t${a.noun}\t${a.businessStep}\t${a.description}`)
    .join('\n')
  
  fs.writeFileSync(outputPath, header + rows)
  console.log(`  ✓ Wrote ${outputPath}`)
  
  console.log()
  console.log('='.repeat(80))
  console.log('EXPANSION COMPLETE')
  console.log('='.repeat(80))
  console.log(`Total activities: ${activities.length}`)
  console.log()
}

main().catch(console.error)
