import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const dataDir = path.resolve(__dirname, '../../../../.data')

// Required columns for different file types
const REQUIRED_COLUMNS = {
  // MDX format files (main entities)
  mdx: ['url', 'ns', 'type', 'id', 'name', 'description', 'code', 'sourceUrl'],

  // Simple entity files
  entity: ['id', 'name', 'description'],

  // Relationship files
  relationship: [], // Varies by file, we'll check dynamically

  // Hierarchy files
  hierarchy: ['id', 'name', 'description', 'code']
}

const MDX_FILES = [
  'Products.tsv',
  'Services.tsv',
  'ONET.Occupation.tsv',
  'ONET.Skill.tsv',
  'ONET.Knowledge.tsv',
  'ONET.Ability.tsv',
  'ONET.Technology.tsv',
  'ONET.Tool.tsv'
]

const ENTITY_FILES_WITH_SOURCE = [
  'Processes.tsv', // Should have: id, name, description, pcfId, hierarchyId, industry
  'Tasks.tsv', // Should have: id, name, description, taskId, occupationCode, occupationTitle
  'Roles.tsv', // Should have: id, name, description, level
  'Jobs.tsv', // Should have: id, name, description, occupation, level
  'Skills.tsv', // Should have: id, name, description, category (or code from ONET)
  'Knowledge.tsv', // Should have: id, name, description, domain (or code from ONET)
]

describe('TSV File Validation', () => {
  describe('Statement Length Validation', () => {
    describe('Processes - ID length vs source name', () => {
      const filePath = path.join(dataDir, 'Processes.tsv')

      it('should not have IDs that are suspiciously short compared to source', () => {
        if (!fs.existsSync(filePath)) return

        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter(l => l.trim())
        const headers = lines[0].split('\t')
        const idIdx = headers.indexOf('id')
        const nameIdx = headers.indexOf('name')

        const suspiciouslyShort: string[] = []

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split('\t')
          const id = cols[idIdx]
          const name = cols[nameIdx]

          if (!id || !name) continue

          // Remove dots and compare lengths
          const idLength = id.replace(/\./g, '').length
          const nameLength = name.replace(/\s+/g, '').length

          // If ID is less than 40% of the source name length, it's suspicious
          if (idLength < nameLength * 0.4) {
            suspiciouslyShort.push(`${id} (${idLength} chars) from "${name}" (${nameLength} chars)`)
          }
        }

        if (suspiciouslyShort.length > 0) {
          console.log('\nSuspiciously short process IDs:')
          suspiciouslyShort.slice(0, 10).forEach(s => console.log(`  ${s}`))
        }

        // Allow some short ones, but not more than 5% of total
        expect(suspiciouslyShort.length).toBeLessThan(lines.length * 0.05)
      })
    })

    describe('Tasks - longest statements', () => {
      const filePath = path.join(dataDir, 'Tasks.tsv')

      it('should have valid format even for longest task statements', () => {
        if (!fs.existsSync(filePath)) return

        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter(l => l.trim())
        const headers = lines[0].split('\t')
        const idIdx = headers.indexOf('id')
        const taskIdx = headers.indexOf('task')

        // Get longest tasks
        const tasks = []
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split('\t')
          const id = cols[idIdx]
          const task = cols[taskIdx]
          if (task) tasks.push({ id, task, length: task.length })
        }

        tasks.sort((a, b) => b.length - a.length)
        const longest = tasks.slice(0, 20)

        console.log('\nLongest 10 task statements:')
        longest.slice(0, 10).forEach((t, i) => {
          console.log(`  ${i + 1}. ${t.id} (${t.task.substring(0, 60)}...)`)
        })

        // Check that longest tasks have proper Subject.verb.Object format
        let invalidCount = 0
        for (const task of longest) {
          const parts = task.id.split('.')
          if (parts.length < 3) {
            console.log(`  ⚠️  Invalid: ${task.id}`)
            invalidCount++
          }
        }

        // Allow at most 20% of longest to be invalid (they're the hardest to parse)
        expect(invalidCount).toBeLessThan(longest.length * 0.2)
      })
    })

    describe('Processes - longest statements', () => {
      const filePath = path.join(dataDir, 'Processes.tsv')

      it('should have valid format even for longest process names', () => {
        if (!fs.existsSync(filePath)) return

        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter(l => l.trim())
        const headers = lines[0].split('\t')
        const idIdx = headers.indexOf('id')
        const nameIdx = headers.indexOf('name')

        // Get longest processes
        const processes = []
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split('\t')
          const id = cols[idIdx]
          const name = cols[nameIdx]
          if (name) processes.push({ id, name, length: name.length })
        }

        processes.sort((a, b) => b.length - a.length)
        const longest = processes.slice(0, 20)

        console.log('\nLongest 10 process names:')
        longest.slice(0, 10).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.id} <= "${p.name}"`)
        })

        // Check format
        let invalidCount = 0
        for (const proc of longest) {
          const parts = proc.id.split('.')
          if (parts.length < 3) {
            console.log(`  ⚠️  Invalid: ${proc.id}`)
            invalidCount++
          }
          // Check for truncation patterns
          if (proc.id.match(/Cross$/)) {
            console.log(`  ⚠️  Truncated: ${proc.id}`)
            invalidCount++
          }
        }

        expect(invalidCount).toBeLessThan(longest.length * 0.2)
      })
    })
  })

  describe('MDX Format Files', () => {
    MDX_FILES.forEach(filename => {
      describe(filename, () => {
        const filePath = path.join(dataDir, filename)

        it('should exist', () => {
          expect(fs.existsSync(filePath)).toBe(true)
        })

        it('should have all required MDX columns', () => {
          if (!fs.existsSync(filePath)) return

          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')

          REQUIRED_COLUMNS.mdx.forEach(col => {
            expect(headers).toContain(col)
          })
        })

        it('should have valid URLs in url column', () => {
          if (!fs.existsSync(filePath)) return

          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')
          const urlIdx = headers.indexOf('url')
          const idIdx = headers.indexOf('id')

          // Check first 10 data rows
          for (let i = 1; i < Math.min(11, lines.length); i++) {
            const cols = lines[i].split('\t')
            const url = cols[urlIdx]
            const id = cols[idIdx]

            expect(url).toMatch(/^https?:\/\//)
            expect(url).toContain(id)
          }
        })

        it('should have matching id in URL', () => {
          if (!fs.existsSync(filePath)) return

          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')
          const urlIdx = headers.indexOf('url')
          const idIdx = headers.indexOf('id')

          // Check first 10 data rows
          for (let i = 1; i < Math.min(11, lines.length); i++) {
            const cols = lines[i].split('\t')
            const url = cols[urlIdx]
            const id = cols[idIdx]

            expect(url).toContain(`/${id}`)
          }
        })
      })
    })
  })

  describe('Process Semantic Parsing', () => {
    const filePath = path.join(dataDir, 'Processes.tsv')

    it('should have required columns including source data', () => {
      if (!fs.existsSync(filePath)) return

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const headers = lines[0].split('\t')

      expect(headers).toContain('id')
      expect(headers).toContain('name') // Original process name
      expect(headers).toContain('description') // Should be added!
      expect(headers).toContain('pcfId') // Source APQC ID
      expect(headers).toContain('hierarchyId') // APQC hierarchy
      expect(headers).toContain('industry')
    })

    it('should have valid Subject.verb.Object format', () => {
      if (!fs.existsSync(filePath)) return

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const headers = lines[0].split('\t')
      const idIdx = headers.indexOf('id')

      // Check first 20 data rows
      for (let i = 1; i < Math.min(21, lines.length); i++) {
        const cols = lines[i].split('\t')
        const id = cols[idIdx]

        // Should match Subject.verb.Object pattern
        const parts = id.split('.')
        expect(parts.length).toBeGreaterThanOrEqual(3)

        // First part should be PascalCase subject
        expect(parts[0]).toMatch(/^[A-Z][a-zA-Z]+$/)

        // Second part should be lowercase verb
        expect(parts[1]).toMatch(/^[a-z]+$/)

        // Third part should be PascalCase object (may have more parts)
        expect(parts[2]).toMatch(/^[A-Z]/)
      }
    })

    it('should not have truncated or incomplete statements', () => {
      if (!fs.existsSync(filePath)) return

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const headers = lines[0].split('\t')
      const idIdx = headers.indexOf('id')

      const invalidPatterns = [
        /Cross$/,  // Truncated "cross-industry"
        /\.$/, // Ends with dot
        /^[A-Z][a-z]+\.[a-z]+$/, // Only Subject.verb (missing Object)
      ]

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t')
        const id = cols[idIdx]

        invalidPatterns.forEach(pattern => {
          expect(id).not.toMatch(pattern)
        })
      }
    })

    it('should preserve original process name in name column', () => {
      if (!fs.existsSync(filePath)) return

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const headers = lines[0].split('\t')
      const nameIdx = headers.indexOf('name')

      expect(nameIdx).toBeGreaterThanOrEqual(0)

      // Check first 10 rows have names
      for (let i = 1; i < Math.min(11, lines.length); i++) {
        const cols = lines[i].split('\t')
        const name = cols[nameIdx]

        expect(name).toBeTruthy()
        expect(name.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Tasks Semantic Parsing', () => {
    const filePath = path.join(dataDir, 'Tasks.tsv')

    it('should have required columns including source data', () => {
      if (!fs.existsSync(filePath)) return

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const headers = lines[0].split('\t')

      expect(headers).toContain('id')
      expect(headers).toContain('taskId') // Source ONET task ID
      expect(headers).toContain('occupationCode') // Source occupation
      expect(headers).toContain('occupationTitle') // For debugging
      expect(headers).toContain('description') // Original task description
    })

    it('should have valid Subject.verb.Object format', () => {
      if (!fs.existsSync(filePath)) return

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const headers = lines[0].split('\t')
      const idIdx = headers.indexOf('id')

      // Check first 20 data rows
      for (let i = 1; i < Math.min(21, lines.length); i++) {
        const cols = lines[i].split('\t')
        const id = cols[idIdx]

        // Should match Subject.verb.Object pattern
        const parts = id.split('.')
        expect(parts.length).toBeGreaterThanOrEqual(3)

        // First part should be PascalCase subject (occupation)
        expect(parts[0]).toMatch(/^[A-Z][a-zA-Z]+$/)

        // Second part should be lowercase verb
        expect(parts[1]).toMatch(/^[a-z]+$/)
      }
    })
  })

  describe('Verbs Validation', () => {
    const verbsFiles = [
      'Integrations.Verbs.tsv',
      'Verbs.tsv' // If it exists
    ]

    verbsFiles.forEach(filename => {
      const filePath = path.join(dataDir, filename)

      if (!fs.existsSync(filePath)) return

      describe(filename, () => {
        it('should have id and type columns', () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')

          expect(headers).toContain('id')
          expect(headers).toContain('type')
        })

        it('should have lowercase verb IDs', () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')
          const idIdx = headers.indexOf('id')

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split('\t')
            const id = cols[idIdx]

            // Verbs should be lowercase
            expect(id).toMatch(/^[a-z]+$/)
          }
        })
      })
    })
  })

  describe('Wikipedia-style ID Validation', () => {
    const wikipediaStyleFiles = [
      'Products.tsv',
      'Services.tsv'
    ]

    wikipediaStyleFiles.forEach(filename => {
      const filePath = path.join(dataDir, filename)

      if (!fs.existsSync(filePath)) return

      describe(filename, () => {
        it('should not have commas in IDs', () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')
          const idIdx = headers.indexOf('id')

          for (let i = 1; i < Math.min(101, lines.length); i++) {
            const cols = lines[i].split('\t')
            const id = cols[idIdx]

            expect(id).not.toContain(',')
          }
        })

        it('should use underscores for spaces', () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')
          const idIdx = headers.indexOf('id')

          for (let i = 1; i < Math.min(101, lines.length); i++) {
            const cols = lines[i].split('\t')
            const id = cols[idIdx]

            // Should not have regular spaces (underscores are OK)
            expect(id).not.toMatch(/\s/)
          }
        })

        it('should normalize European number formatting', () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')
          const idIdx = headers.indexOf('id')

          // Check for any IDs with numbers
          const linesWithNumbers = lines.filter((line, i) => {
            if (i === 0) return false
            const cols = line.split('\t')
            const id = cols[idIdx]
            return /\d/.test(id)
          })

          // If there are IDs with numbers, check format
          linesWithNumbers.slice(0, 20).forEach(line => {
            const cols = line.split('\t')
            const id = cols[idIdx]

            // Should not have European comma formatting (2,5G)
            // Should be 2.5G
            if (id.match(/\d/)) {
              expect(id).not.toMatch(/\d,\d/)
            }
          })
        })
      })
    })
  })

  describe('Relationships Files', () => {
    const relationshipFiles = [
      { file: 'Products.Standards.tsv', cols: ['productId', 'standardCode', 'standard'] },
      { file: 'Services.Standards.tsv', cols: ['serviceId', 'standardCode', 'standard'] },
      { file: 'Skills.Occupations.tsv', cols: ['skillId', 'occupationId'] },
      { file: 'Knowledge.Occupations.tsv', cols: ['knowledgeId', 'occupationId'] },
      { file: 'Roles.Occupations.tsv', cols: ['roleId', 'occupationId'] },
      { file: 'Jobs.Occupations.tsv', cols: ['jobId', 'occupationId'] },
      { file: 'People.Roles.tsv', cols: ['personId', 'roleId'] },
    ]

    relationshipFiles.forEach(({ file, cols }) => {
      const filePath = path.join(dataDir, file)

      if (!fs.existsSync(filePath)) return

      describe(file, () => {
        it(`should have required columns: ${cols.join(', ')}`, () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')

          cols.forEach(col => {
            expect(headers).toContain(col)
          })
        })

        it('should not have empty ID fields', () => {
          const content = fs.readFileSync(filePath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split('\t')

          // Check first 20 rows
          for (let i = 1; i < Math.min(21, lines.length); i++) {
            const cols = lines[i].split('\t')

            cols.forEach((col, idx) => {
              const colName = headers[idx]
              if (colName && colName.endsWith('Id')) {
                expect(col).toBeTruthy()
                expect(col.length).toBeGreaterThan(0)
              }
            })
          }
        })
      })
    })
  })
})
