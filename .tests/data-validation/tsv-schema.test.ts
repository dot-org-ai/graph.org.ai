import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'
import {
  DATA_DIR,
  parseTSV,
  getAllEntityFiles,
  getAllRelationshipFiles,
  ENTITY_HEADERS,
  RELATIONSHIP_HEADERS,
  isValidURL,
  isPascalCase,
  isCamelCase,
  hasWindowsLineEndings,
  hasTrailingWhitespace,
  hasSpecialCharacters
} from './setup'

describe('TSV Schema Validation', () => {
  describe('File Naming Convention', () => {
    it('should only have entity files ([Type].tsv) and relationship files ([Type].Relationships.tsv)', () => {
      const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.tsv'))
      const invalidFiles: string[] = []

      files.forEach(file => {
        // Valid patterns:
        // 1. [Type].tsv (entity file)
        // 2. [Type].Relationships.tsv (relationship file)
        // 3. App.[Type].tsv (namespaced entity file)
        // 4. App.[Type].Relationships.tsv (namespaced relationship file)

        const isEntityFile = /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)?\.tsv$/.test(file)
        const isRelationshipFile = /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)?\.Relationships\.tsv$/.test(file)

        if (!isEntityFile && !isRelationshipFile) {
          invalidFiles.push(file)
        }
      })

      if (invalidFiles.length > 0) {
        expect.fail(
          `Found ${invalidFiles.length} files with invalid naming:\n` +
          invalidFiles.map(f => `  - ${f}`).join('\n') + '\n\n' +
          'Only [Type].tsv and [Type].Relationships.tsv files are allowed.\n' +
          'Mapping files should be converted to relationship files.'
        )
      }
    })
  })

  describe('Entity Files', () => {
    const entityFiles = getAllEntityFiles()

    it('should have at least one entity file', () => {
      expect(entityFiles.length).toBeGreaterThan(0)
    })

    entityFiles.forEach(fileName => {
      describe(fileName, () => {
        const filePath = resolve(DATA_DIR, fileName)
        const content = readFileSync(filePath, 'utf-8')
        const rows = parseTSV(content)

        it('should have correct headers', () => {
          const lines = content.split('\n').filter(l => l.trim())
          expect(lines.length).toBeGreaterThan(0)

          const headers = lines[0].split('\t')

          // Check that all required headers are present
          ENTITY_HEADERS.forEach(header => {
            expect(headers).toContain(header)
          })
        })

        it('should have camelCase headers (except standard headers)', () => {
          const lines = content.split('\n').filter(l => l.trim())
          expect(lines.length).toBeGreaterThan(0)

          const headers = lines[0].split('\t')
          const invalidHeaders: string[] = []

          headers.forEach(header => {
            // Skip standard headers (these are allowed as-is)
            if (ENTITY_HEADERS.includes(header)) {
              return
            }

            // All custom headers must be camelCase
            if (!isCamelCase(header)) {
              invalidHeaders.push(header)
            }
          })

          if (invalidHeaders.length > 0) {
            expect.fail(
              `Found ${invalidHeaders.length} headers not in camelCase:\n` +
              invalidHeaders.map(h => `  - "${h}" (should be camelCase)`).join('\n') + '\n\n' +
              'Custom headers beyond the standard 7 must use camelCase (e.g., annualMean, socCount)'
            )
          }
        })

        it('should have no missing required fields', () => {
          rows.forEach((row, index) => {
            // url, ns, type, id, and name are always required
            expect(row.url, `Row ${index + 2}: url is required`).toBeTruthy()
            expect(row.ns, `Row ${index + 2}: ns is required`).toBeTruthy()
            expect(row.type, `Row ${index + 2}: type is required`).toBeTruthy()
            expect(row.id, `Row ${index + 2}: id is required`).toBeTruthy()
            expect(row.name, `Row ${index + 2}: name is required`).toBeTruthy()
            // code and description can be empty
          })
        })

        it('should have no malformed rows (wrong number of columns)', () => {
          const lines = content.split('\n').filter(l => l.trim())
          if (lines.length === 0) return

          const headerCount = lines[0].split('\t').length

          for (let i = 1; i < lines.length; i++) {
            const columnCount = lines[i].split('\t').length
            expect(columnCount, `Row ${i + 1}: Expected ${headerCount} columns, got ${columnCount}`).toBe(headerCount)
          }
        })

        it('should have valid URLs', () => {
          rows.forEach((row, index) => {
            expect(isValidURL(row.url), `Row ${index + 2}: Invalid URL: ${row.url}`).toBe(true)
          })
        })

        it('should have URLs matching pattern: https://{domain}/{Type}/{Id} OR https://{type}.org.ai/{Id}', () => {
          rows.forEach((row, index) => {
            const url = row.url
            const parts = url.split('/')

            // https://domain/...
            expect(parts.length, `Row ${index + 2}: URL should have at least protocol and domain`).toBeGreaterThanOrEqual(4)
            expect(parts[0], `Row ${index + 2}: Protocol should be https:`).toBe('https:')
            expect(parts[1], `Row ${index + 2}: Empty part after https:`).toBe('')

            const hostname = parts[2]
            const pathParts = parts.slice(3).filter(p => p)

            // Extract subdomain from hostname
            const subdomain = hostname.split('.')[0].toLowerCase()
            const typeLower = row.type.toLowerCase()
            const typePlural = typeLower + 's'
            const typeSingular = typeLower.replace(/s$/, '')

            // Check if type is represented in the subdomain (singular or plural)
            const typeInHostname = subdomain === typeLower ||
                                   subdomain === typePlural ||
                                   subdomain === typeSingular

            if (typeInHostname) {
              // When type is in hostname: https://[type].org.ai/{Id}
              // Type should NOT appear in path
              expect(pathParts.length, `Row ${index + 2}: When type "${row.type}" is in hostname "${hostname}", path should only contain ID, not Type. Expected: https://${hostname}/${row.id}`).toBe(1)
              expect(pathParts[0], `Row ${index + 2}: ID in URL should match id field`).toBe(row.id)
            } else {
              // When type is NOT in hostname: https://{domain}/{Type}/{Id}
              expect(pathParts.length, `Row ${index + 2}: When type is NOT in hostname "${hostname}", path should contain Type and ID`).toBeGreaterThanOrEqual(2)

              // Type should match the 'type' field
              const typeFromUrl = pathParts[0]
              expect(typeFromUrl, `Row ${index + 2}: Type in URL path (${typeFromUrl}) should match type field (${row.type})`).toBe(row.type)

              // ID should match the 'id' field
              const idFromUrl = pathParts[1]
              expect(idFromUrl, `Row ${index + 2}: ID in URL (${idFromUrl}) should match id field (${row.id})`).toBe(row.id)
            }
          })
        })

        it('should have PascalCase IDs', () => {
          rows.forEach((row, index) => {
            // Allow some exceptions for special cases
            const id = row.id

            // Skip validation for IDs that are intentionally not PascalCase
            // (e.g., semantic IDs like "determine.Compliance")
            if (id.includes('.') || id.includes('-') || id.includes('_')) {
              // These are semantic IDs or special formats
              return
            }

            expect(isPascalCase(id), `Row ${index + 2}: ID should be PascalCase: ${id}`).toBe(true)
          })
        })

        it('should have no duplicate URLs', () => {
          const urls = rows.map(r => r.url)
          const uniqueUrls = new Set(urls)
          expect(uniqueUrls.size, `File has duplicate URLs`).toBe(urls.length)
        })

        it('should have Unix line endings (no Windows \\r\\n)', () => {
          expect(hasWindowsLineEndings(content), 'File should not have Windows line endings (\\r\\n)').toBe(false)
        })

        it('should have no trailing whitespace', () => {
          expect(hasTrailingWhitespace(content), 'File should not have trailing whitespace').toBe(false)
        })

        it('should have no special characters in fields', () => {
          expect(hasSpecialCharacters(content), 'File should not have embedded newlines, carriage returns, or null bytes in fields').toBe(false)
        })

        it('should have no duplicate IDs', () => {
          const ids = rows.map(r => r.id)
          const uniqueIds = new Set(ids)
          if (uniqueIds.size !== ids.length) {
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
            expect.fail(`File has duplicate IDs: ${[...new Set(duplicates)].join(', ')}`)
          }
        })

        it('should not be empty (must have data rows)', () => {
          expect(rows.length, 'File should have at least one data row beyond the header').toBeGreaterThan(0)
        })

        // Semantic validation for Event entities
        if (rows.length > 0 && rows[0].type === 'Event') {
          it('should have Event IDs matching Noun.verb pattern', () => {
            rows.forEach((row, index) => {
              // Event IDs should be in the format "Noun.verb"
              if (!row.id.includes('.')) {
                expect.fail(`Row ${index + 2}: Event ID should contain a dot: ${row.id}`)
              }

              const parts = row.id.split('.')
              if (parts.length !== 2) {
                expect.fail(`Row ${index + 2}: Event ID should have exactly one dot (Noun.verb format): ${row.id}`)
              }

              // If nounId and verbId fields exist, validate they match the ID
              if (row.nounId && row.verbId) {
                const expectedId = `${row.nounId}.${row.verbId}`
                expect(row.id, `Row ${index + 2}: Event ID should match nounId.verbId`).toBe(expectedId)
              }
            })
          })
        }

        // Semantic validation for Action entities
        if (rows.length > 0 && rows[0].type === 'Action') {
          it('should have Action IDs matching verb.Noun pattern', () => {
            rows.forEach((row, index) => {
              // Action IDs should be in the format "verb.Noun"
              if (!row.id.includes('.')) {
                expect.fail(`Row ${index + 2}: Action ID should contain a dot: ${row.id}`)
              }

              const parts = row.id.split('.')
              if (parts.length !== 2) {
                expect.fail(`Row ${index + 2}: Action ID should have exactly one dot (verb.Noun format): ${row.id}`)
              }

              // If verbId and nounId fields exist, validate they match the ID
              if (row.verbId && row.nounId) {
                const expectedId = `${row.verbId}.${row.nounId}`
                expect(row.id, `Row ${index + 2}: Action ID should match verbId.nounId`).toBe(expectedId)
              }
            })
          })
        }
      })
    })
  })

  describe('Relationship Files', () => {
    const relationshipFiles = getAllRelationshipFiles()

    it('should have at least one relationship file', () => {
      expect(relationshipFiles.length).toBeGreaterThan(0)
    })

    relationshipFiles.forEach(fileName => {
      describe(fileName, () => {
        const filePath = resolve(DATA_DIR, fileName)
        const content = readFileSync(filePath, 'utf-8')
        const rows = parseTSV(content)

        it('should have correct headers', () => {
          const lines = content.split('\n').filter(l => l.trim())
          expect(lines.length).toBeGreaterThan(0)

          const headers = lines[0].split('\t')

          // Check that all required headers are present
          RELATIONSHIP_HEADERS.forEach(header => {
            expect(headers).toContain(header)
          })
        })

        it('should have no missing required fields', () => {
          rows.forEach((row, index) => {
            expect(row.ns, `Row ${index + 2}: ns is required`).toBeTruthy()
            expect(row.from, `Row ${index + 2}: from is required`).toBeTruthy()
            expect(row.to, `Row ${index + 2}: to is required`).toBeTruthy()
            expect(row.predicate, `Row ${index + 2}: predicate is required`).toBeTruthy()
            expect(row.reverse, `Row ${index + 2}: reverse is required`).toBeTruthy()
          })
        })

        it('should have no malformed rows (wrong number of columns)', () => {
          const lines = content.split('\n').filter(l => l.trim())
          if (lines.length === 0) return

          const headerCount = lines[0].split('\t').length

          for (let i = 1; i < lines.length; i++) {
            const columnCount = lines[i].split('\t').length
            expect(columnCount, `Row ${i + 1}: Expected ${headerCount} columns, got ${columnCount}`).toBe(headerCount)
          }
        })

        it('should have valid URLs in from and to fields', () => {
          rows.forEach((row, index) => {
            expect(isValidURL(row.from), `Row ${index + 2}: Invalid 'from' URL: ${row.from}`).toBe(true)
            expect(isValidURL(row.to), `Row ${index + 2}: Invalid 'to' URL: ${row.to}`).toBe(true)
          })
        })

        it('should have Unix line endings (no Windows \\r\\n)', () => {
          expect(hasWindowsLineEndings(content), 'File should not have Windows line endings (\\r\\n)').toBe(false)
        })

        it('should have no trailing whitespace', () => {
          expect(hasTrailingWhitespace(content), 'File should not have trailing whitespace').toBe(false)
        })

        it('should reference existing entity URLs', () => {
          // Build a set of all valid entity URLs
          const entityUrls = new Set<string>()
          const entityFiles = getAllEntityFiles()

          entityFiles.forEach(fileName => {
            const entityRows = loadTSVFile(fileName) as EntityRow[]
            entityRows.forEach(row => {
              entityUrls.add(row.url)
            })
          })

          // Check that all relationship from/to URLs exist
          const missingUrls: string[] = []
          rows.forEach((row, index) => {
            if (!entityUrls.has(row.from)) {
              missingUrls.push(`Row ${index + 2}: 'from' URL not found: ${row.from}`)
            }
            if (!entityUrls.has(row.to)) {
              missingUrls.push(`Row ${index + 2}: 'to' URL not found: ${row.to}`)
            }
          })

          if (missingUrls.length > 0) {
            expect.fail(
              `Found ${missingUrls.length} relationship URLs that don't exist in entity files:\n` +
              missingUrls.slice(0, 10).join('\n') +
              (missingUrls.length > 10 ? `\n... and ${missingUrls.length - 10} more` : '')
            )
          }
        })
      })
    })
  })

  describe('Cross-File Validation', () => {
    it('should have globally unique IDs across all files', () => {
      const idToFiles = new Map<string, string[]>()

      // Collect all IDs from all entity files
      entityFiles.forEach(fileName => {
        const rows = loadTSVFile(fileName) as EntityRow[]
        rows.forEach(row => {
          const id = row.id
          if (!idToFiles.has(id)) {
            idToFiles.set(id, [])
          }
          idToFiles.get(id)!.push(fileName)
        })
      })

      // Find IDs that appear in multiple files
      const duplicates: string[] = []
      idToFiles.forEach((files, id) => {
        if (files.length > 1) {
          duplicates.push(`ID "${id}" appears in: ${files.join(', ')}`)
        }
      })

      if (duplicates.length > 0) {
        expect.fail(
          `Found ${duplicates.length} IDs duplicated across multiple files:\n` +
          duplicates.slice(0, 10).join('\n') +
          (duplicates.length > 10 ? `\n... and ${duplicates.length - 10} more` : '')
        )
      }
    })
  })
})
