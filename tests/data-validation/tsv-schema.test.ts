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
  hasTrailingWhitespace
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
      })
    })
  })
})
