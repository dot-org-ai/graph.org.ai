#!/usr/bin/env tsx
/**
 * Analyze service name patterns to understand semantic structure
 * and identify compound components that need expansion
 */

import { readFileSync } from 'fs'

console.log('🔍 ANALYZING SERVICE NAME PATTERNS\n')
console.log('='.repeat(100) + '\n')

// Load Services.tsv
const servicesPath = '.data/Services.tsv'
const content = readFileSync(servicesPath, 'utf-8')
const lines = content.split('\n').filter(l => l.trim())
const headers = lines[0].split('\t')
const nameIndex = headers.indexOf('name')

const services = lines.slice(1).map(line => {
  const fields = line.split('\t')
  return fields[nameIndex] || ''
}).filter(name => name.length > 0)

console.log(`Loaded ${services.length.toLocaleString()} services\n`)

// Pattern analysis
const patterns = {
  // Service action patterns
  withServicesKeyword: [] as string[],
  withMaintenanceRepair: [] as string[],
  withTransportation: [] as string[],
  withInstallation: [] as string[],

  // Compound patterns
  withAnd: [] as string[],
  withOr: [] as string[],
  multipleAnd: [] as string[],  // More than one "and"
  multipleOr: [] as string[],   // More than one "or"

  // Preposition patterns
  withFor: [] as string[],
  withBy: [] as string[],
  withOf: [] as string[],
  withTo: [] as string[],
  withWith: [] as string[],
  withIn: [] as string[],

  // Parenthetical exclusions
  withExcept: [] as string[],
  withIncluding: [] as string[],

  // Simple nouns (likely products, not services)
  simpleNouns: [] as string[],
}

// Categorize each service
for (const service of services) {
  const lower = service.toLowerCase()

  // Action keywords
  if (lower.includes('services')) patterns.withServicesKeyword.push(service)
  if (lower.match(/maintenance|repair/)) patterns.withMaintenanceRepair.push(service)
  if (lower.includes('transportation')) patterns.withTransportation.push(service)
  if (lower.includes('installation')) patterns.withInstallation.push(service)

  // Compound patterns
  const andCount = (lower.match(/ and /g) || []).length
  const orCount = (lower.match(/ or /g) || []).length

  if (andCount > 0) patterns.withAnd.push(service)
  if (orCount > 0) patterns.withOr.push(service)
  if (andCount > 1) patterns.multipleAnd.push(service)
  if (orCount > 1) patterns.multipleOr.push(service)

  // Prepositions
  if (lower.includes(' for ')) patterns.withFor.push(service)
  if (lower.includes(' by ')) patterns.withBy.push(service)
  if (lower.includes(' of ')) patterns.withOf.push(service)
  if (lower.includes(' to ')) patterns.withTo.push(service)
  if (lower.includes(' with ')) patterns.withWith.push(service)
  if (lower.includes(' in ')) patterns.withIn.push(service)

  // Exclusions
  if (lower.match(/\(except/)) patterns.withExcept.push(service)
  if (lower.match(/\(including/)) patterns.withIncluding.push(service)

  // Simple nouns (no verbs, no prepositions, likely products)
  const hasServiceVerb = lower.match(/services|maintenance|repair|installation|transportation|distribution|rental|leasing/)
  const hasPreposition = lower.match(/ for | by | of | to | with | in /)
  if (!hasServiceVerb && !hasPreposition && lower.split(' ').length <= 5) {
    patterns.simpleNouns.push(service)
  }
}

// Report
console.log('📊 PATTERN SUMMARY\n')
console.log('='.repeat(100) + '\n')

console.log('## Action Patterns\n')
console.log(`Services with "services": ${patterns.withServicesKeyword.length.toLocaleString()} (${Math.round(patterns.withServicesKeyword.length / services.length * 100)}%)`)
console.log(`Maintenance/Repair: ${patterns.withMaintenanceRepair.length.toLocaleString()}`)
console.log(`Transportation: ${patterns.withTransportation.length.toLocaleString()}`)
console.log(`Installation: ${patterns.withInstallation.length.toLocaleString()}\n`)

console.log('## Compound Patterns (Need Expansion)\n')
console.log(`With " and ": ${patterns.withAnd.length.toLocaleString()} (${Math.round(patterns.withAnd.length / services.length * 100)}%)`)
console.log(`With " or ": ${patterns.withOr.length.toLocaleString()} (${Math.round(patterns.withOr.length / services.length * 100)}%)`)
console.log(`Multiple "and": ${patterns.multipleAnd.length.toLocaleString()}`)
console.log(`Multiple "or": ${patterns.multipleOr.length.toLocaleString()}\n`)

console.log('## Preposition Patterns\n')
console.log(`"for": ${patterns.withFor.length.toLocaleString()}`)
console.log(`"by": ${patterns.withBy.length.toLocaleString()}`)
console.log(`"of": ${patterns.withOf.length.toLocaleString()}`)
console.log(`"to": ${patterns.withTo.length.toLocaleString()}`)
console.log(`"with": ${patterns.withWith.length.toLocaleString()}`)
console.log(`"in": ${patterns.withIn.length.toLocaleString()}\n`)

console.log('## Exclusion Patterns\n')
console.log(`With "(except...)": ${patterns.withExcept.length.toLocaleString()}`)
console.log(`With "(including...)": ${patterns.withIncluding.length.toLocaleString()}\n`)

console.log('## Simple Nouns (Likely Products)\n')
console.log(`Count: ${patterns.simpleNouns.length.toLocaleString()}\n`)

// Show examples
console.log('\n' + '='.repeat(100))
console.log('📋 EXAMPLES\n')

console.log('## Complex Compound Services (Multiple "and" or "or")\n')
for (const service of patterns.multipleAnd.slice(0, 10)) {
  console.log(`  - ${service}`)
}
console.log()
for (const service of patterns.multipleOr.slice(0, 10)) {
  console.log(`  - ${service}`)
}

console.log('\n## Maintenance/Repair Services with Compounds\n')
const maintenanceWithCompounds = patterns.withMaintenanceRepair.filter(s =>
  s.toLowerCase().includes(' and ') || s.toLowerCase().includes(' or ')
)
for (const service of maintenanceWithCompounds.slice(0, 15)) {
  console.log(`  - ${service}`)
}

console.log('\n## Simple Nouns (Products Misclassified as Services)\n')
for (const service of patterns.simpleNouns.slice(0, 20)) {
  console.log(`  - ${service}`)
}

console.log('\n\n' + '='.repeat(100))
console.log('💡 SEMANTIC PARSING REQUIREMENTS\n')

console.log(`
Services need to be parsed into semantic components:

1. **Predicate(s)** - The action verbs (can be compound with "and"/"or")
   Example: "Maintenance and repair" → ["Maintenance", "Repair"]

2. **Object** - What the action is performed on
   Example: "services" (often implicit)

3. **Preposition** - Connector word
   Example: "for", "by", "of", "to"

4. **Complement** - Additional context (can be compound with "and"/"or")
   Example: "automobiles and light trucks" → ["automobiles", "light trucks"]

5. **Modifiers** - Adjectives/descriptors (can be compound with "and"/"or")
   Example: "commercial and residential" → ["commercial", "residential"]

Then generate **cartesian product** of all compound components:
  "Maintenance and repair services for automobiles and light trucks"
  →
  1. Maintenance services for automobiles
  2. Maintenance services for light trucks
  3. Repair services for automobiles
  4. Repair services for light trucks
`)

console.log('✅ Analysis complete!\n')
