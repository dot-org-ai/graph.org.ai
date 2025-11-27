import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  getAllEntityFiles,
  loadTSVFile,
  EntityRow,
  parseTSV
} from './setup'

const ONTOLOGY_FILE = '.enrichment/domain-ontology.tsv'

interface OntologyRow {
  type: string
  canonicalDomain: string
  aliasDomains: string
  notes: string
}

function loadOntology(): Map<string, OntologyRow> {
  const content = readFileSync(ONTOLOGY_FILE, 'utf-8')
  const rows = parseTSV(content) as OntologyRow[]

  const ontologyMap = new Map<string, OntologyRow>()
  rows.forEach(row => {
    if (row.type) {
      ontologyMap.set(row.type, row)
    }
  })

  return ontologyMap
}

describe('Domain Ontology Validation', () => {
  const ontologyMap = loadOntology()
  const entityFiles = getAllEntityFiles()

  it('should have ontology file', () => {
    expect(ontologyMap.size).toBeGreaterThan(0)
  })

  describe('Ontology Completeness', () => {
    it('should have ontology mappings for all entity types', () => {
      const allTypes = new Set<string>()
      const missingTypes: string[] = []

      // Collect all unique types from entity files
      entityFiles.forEach(fileName => {
        const rows = loadTSVFile(fileName) as EntityRow[]
        rows.forEach(row => {
          if (row.type) {
            allTypes.add(row.type)
          }
        })
      })

      // Check which types are missing from ontology
      allTypes.forEach(type => {
        if (!ontologyMap.has(type)) {
          missingTypes.push(type)
        }
      })

      if (missingTypes.length > 0) {
        expect.fail(
          `Found ${missingTypes.length} entity types without ontology mappings:\n` +
          missingTypes.map(t => `  - ${t}`).join('\n') + '\n\n' +
          `Please add these types to ${ONTOLOGY_FILE}`
        )
      }
    })

    it('should have valid canonical domains', () => {
      const invalidDomains: string[] = []

      ontologyMap.forEach((row, type) => {
        if (!row.canonicalDomain) {
          invalidDomains.push(`${type}: missing canonicalDomain`)
        } else if (!row.canonicalDomain.endsWith('.org.ai')) {
          invalidDomains.push(`${type}: canonicalDomain "${row.canonicalDomain}" should end with .org.ai`)
        }
      })

      if (invalidDomains.length > 0) {
        expect.fail(
          `Found ${invalidDomains.length} invalid canonical domains:\n` +
          invalidDomains.map(d => `  - ${d}`).join('\n')
        )
      }
    })

    it('should have valid alias domains', () => {
      const invalidAliases: string[] = []

      ontologyMap.forEach((row, type) => {
        if (row.aliasDomains) {
          const aliases = row.aliasDomains.split(';').map(a => a.trim())
          aliases.forEach(alias => {
            if (alias && !alias.endsWith('.org.ai')) {
              invalidAliases.push(`${type}: alias "${alias}" should end with .org.ai`)
            }
          })
        }
      })

      if (invalidAliases.length > 0) {
        expect.fail(
          `Found ${invalidAliases.length} invalid alias domains:\n` +
          invalidAliases.map(d => `  - ${d}`).join('\n')
        )
      }
    })
  })

  describe('URL Canonical Domain Compliance', () => {
    entityFiles.forEach(fileName => {
      describe(fileName, () => {
        const rows = loadTSVFile(fileName) as EntityRow[]

        it('should use canonical domains in URLs', () => {
          const violations: string[] = []

          rows.forEach((row, index) => {
            const ontology = ontologyMap.get(row.type)
            if (!ontology) {
              // Skip if type not in ontology (will be caught by completeness test)
              return
            }

            try {
              const url = new URL(row.url)
              const hostname = url.hostname

              // Check if URL uses canonical domain
              if (hostname !== ontology.canonicalDomain) {
                // Check if it's at least using a valid alias
                const aliases = ontology.aliasDomains ?
                  ontology.aliasDomains.split(';').map(a => a.trim()) : []

                if (!aliases.includes(hostname)) {
                  violations.push(
                    `Row ${index + 2}: URL uses "${hostname}" but canonical is "${ontology.canonicalDomain}"\n` +
                    `  URL: ${row.url}\n` +
                    `  Valid domains: ${ontology.canonicalDomain}${aliases.length > 0 ? ', ' + aliases.join(', ') : ''}`
                  )
                }
              }
            } catch (e) {
              // Skip invalid URLs (will be caught by other tests)
            }
          })

          if (violations.length > 0) {
            console.warn(
              `\n⚠️  Found ${violations.length} URLs not using canonical domains in ${fileName}:\n` +
              violations.slice(0, 5).join('\n') +
              (violations.length > 5 ? `\n... and ${violations.length - 5} more` : '')
            )
          }
        })
      })
    })
  })

  describe('Domain Hierarchy', () => {
    it('should document domain relationships in notes', () => {
      const missingNotes: string[] = []

      ontologyMap.forEach((row, type) => {
        if (!row.notes || row.notes.trim().length === 0) {
          missingNotes.push(type)
        }
      })

      if (missingNotes.length > 0) {
        console.warn(
          `\n⚠️  ${missingNotes.length} types missing documentation in notes field:\n` +
          missingNotes.slice(0, 10).map(t => `  - ${t}`).join('\n') +
          (missingNotes.length > 10 ? `\n... and ${missingNotes.length - 10} more` : '')
        )
      }
    })
  })
})
