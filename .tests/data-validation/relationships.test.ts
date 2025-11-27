import { describe, it, expect, beforeAll } from 'vitest'
import {
  getAllEntityFiles,
  getAllRelationshipFiles,
  loadTSVFile,
  EntityRow,
  RelationshipRow
} from './setup'

describe('Relationship Integrity Validation', () => {
  let allEntityUrls: Set<string>

  beforeAll(() => {
    // Build a set of all valid entity URLs
    allEntityUrls = new Set<string>()

    const entityFiles = getAllEntityFiles()
    entityFiles.forEach(fileName => {
      const rows = loadTSVFile(fileName) as EntityRow[]
      rows.forEach(row => {
        if (row.url) {
          allEntityUrls.add(row.url)
        }
      })
    })

    console.log(`Loaded ${allEntityUrls.size} entity URLs from ${entityFiles.length} files`)
  })

  describe('Orphaned Relationships', () => {
    const relationshipFiles = getAllRelationshipFiles()

    relationshipFiles.forEach(fileName => {
      describe(fileName, () => {
        const rows = loadTSVFile(fileName) as RelationshipRow[]

        it('should have no orphaned "from" URLs', () => {
          const orphanedFromUrls: string[] = []

          rows.forEach((row, index) => {
            if (!allEntityUrls.has(row.from)) {
              orphanedFromUrls.push(`Row ${index + 2}: ${row.from}`)
            }
          })

          if (orphanedFromUrls.length > 0) {
            expect.fail(
              `Found ${orphanedFromUrls.length} orphaned "from" URLs:\n` +
              orphanedFromUrls.slice(0, 10).join('\n') +
              (orphanedFromUrls.length > 10 ? `\n... and ${orphanedFromUrls.length - 10} more` : '')
            )
          }
        })

        it('should have no orphaned "to" URLs', () => {
          const orphanedToUrls: string[] = []

          rows.forEach((row, index) => {
            if (!allEntityUrls.has(row.to)) {
              orphanedToUrls.push(`Row ${index + 2}: ${row.to}`)
            }
          })

          if (orphanedToUrls.length > 0) {
            expect.fail(
              `Found ${orphanedToUrls.length} orphaned "to" URLs:\n` +
              orphanedToUrls.slice(0, 10).join('\n') +
              (orphanedToUrls.length > 10 ? `\n... and ${orphanedToUrls.length - 10} more` : '')
            )
          }
        })
      })
    })
  })

  describe('Bidirectional Consistency', () => {
    const relationshipFiles = getAllRelationshipFiles()

    relationshipFiles.forEach(fileName => {
      describe(fileName, () => {
        const rows = loadTSVFile(fileName) as RelationshipRow[]

        it('should have bidirectional consistency', () => {
          // Build a map of forward relationships: from -> to -> predicate
          const forwardMap = new Map<string, Map<string, string>>()

          rows.forEach(row => {
            if (!forwardMap.has(row.from)) {
              forwardMap.set(row.from, new Map())
            }
            forwardMap.get(row.from)!.set(row.to, row.predicate)
          })

          const missingReverseRels: string[] = []

          rows.forEach((row, index) => {
            // Check if reverse relationship exists
            const reverseExists = forwardMap.get(row.to)?.get(row.from)

            if (!reverseExists) {
              missingReverseRels.push(
                `Row ${index + 2}: Missing reverse relationship\n` +
                `  Forward: ${row.from} --[${row.predicate}]--> ${row.to}\n` +
                `  Expected: ${row.to} --[${row.reverse}]--> ${row.from}`
              )
            } else if (reverseExists !== row.reverse) {
              missingReverseRels.push(
                `Row ${index + 2}: Incorrect reverse predicate\n` +
                `  Forward: ${row.from} --[${row.predicate}]--> ${row.to}\n` +
                `  Expected reverse: ${row.reverse}\n` +
                `  Actual reverse: ${reverseExists}`
              )
            }
          })

          if (missingReverseRels.length > 0) {
            expect.fail(
              `Found ${missingReverseRels.length} bidirectional inconsistencies:\n` +
              missingReverseRels.slice(0, 5).join('\n\n') +
              (missingReverseRels.length > 5 ? `\n\n... and ${missingReverseRels.length - 5} more` : '')
            )
          }
        })
      })
    })
  })

  describe('Valid Predicate Pairs', () => {
    const KNOWN_PREDICATE_PAIRS = new Map<string, string>([
      ['partOf', 'hasPart'],
      ['hasPart', 'partOf'],
      ['relatedTo', 'relatedTo'],
      ['prepares', 'preparedBy'],
      ['preparedBy', 'prepares'],
      ['specializes', 'specializedBy'],
      ['specializedBy', 'specializes'],
      ['alignsWith', 'alignedWith'],
      ['alignedWith', 'alignsWith'],
      ['requires', 'requiredBy'],
      ['requiredBy', 'requires'],
      ['performedBy', 'performs'],
      ['performs', 'performedBy'],
      ['requiresAction', 'actionRequiredFor'],
      ['actionRequiredFor', 'requiresAction'],
      ['affects', 'affectedBy'],
      ['affectedBy', 'affects'],
      ['achieves', 'achievedBy'],
      ['achievedBy', 'achieves'],
      ['hasSubject', 'subjectOf'],
      ['subjectOf', 'hasSubject'],
      ['hasPredicate', 'predicateOf'],
      ['predicateOf', 'hasPredicate'],
      ['hasObject', 'objectOf'],
      ['objectOf', 'hasObject'],
      ['hasComplement', 'complementOf'],
      ['complementOf', 'hasComplement'],
    ])

    const relationshipFiles = getAllRelationshipFiles()

    relationshipFiles.forEach(fileName => {
      describe(fileName, () => {
        const rows = loadTSVFile(fileName) as RelationshipRow[]

        it('should have valid predicate/reverse pairs', () => {
          const invalidPairs: string[] = []

          rows.forEach((row, index) => {
            const expectedReverse = KNOWN_PREDICATE_PAIRS.get(row.predicate)

            if (expectedReverse && expectedReverse !== row.reverse) {
              invalidPairs.push(
                `Row ${index + 2}: predicate="${row.predicate}", reverse="${row.reverse}" ` +
                `(expected: "${expectedReverse}")`
              )
            }

            // Also check if the reverse predicate is valid
            const expectedForward = KNOWN_PREDICATE_PAIRS.get(row.reverse)
            if (expectedForward && expectedForward !== row.predicate) {
              invalidPairs.push(
                `Row ${index + 2}: reverse="${row.reverse}", predicate="${row.predicate}" ` +
                `(expected: "${expectedForward}")`
              )
            }
          })

          if (invalidPairs.length > 0) {
            expect.fail(
              `Found ${invalidPairs.length} invalid predicate pairs:\n` +
              invalidPairs.slice(0, 10).join('\n') +
              (invalidPairs.length > 10 ? `\n... and ${invalidPairs.length - 10} more` : '')
            )
          }
        })

        it('should log unknown predicate pairs for review', () => {
          const unknownPredicates = new Set<string>()

          rows.forEach(row => {
            if (!KNOWN_PREDICATE_PAIRS.has(row.predicate)) {
              unknownPredicates.add(`${row.predicate}/${row.reverse}`)
            }
          })

          if (unknownPredicates.size > 0) {
            console.log(`\n⚠️  Unknown predicate pairs in ${fileName}:`)
            Array.from(unknownPredicates).forEach(pair => {
              console.log(`   - ${pair}`)
            })
          }
        })
      })
    })
  })

  describe('Acyclic Hierarchies', () => {
    const relationshipFiles = getAllRelationshipFiles()

    relationshipFiles.forEach(fileName => {
      describe(fileName, () => {
        const rows = loadTSVFile(fileName) as RelationshipRow[]

        it('should have no circular partOf chains', () => {
          // Build a directed graph of partOf relationships
          const partOfGraph = new Map<string, Set<string>>()

          rows.forEach(row => {
            if (row.predicate === 'partOf') {
              if (!partOfGraph.has(row.from)) {
                partOfGraph.set(row.from, new Set())
              }
              partOfGraph.get(row.from)!.add(row.to)
            }
          })

          // Detect cycles using DFS
          const visited = new Set<string>()
          const recursionStack = new Set<string>()
          const cycles: string[] = []

          function detectCycle(node: string, path: string[]): boolean {
            visited.add(node)
            recursionStack.add(node)
            path.push(node)

            const neighbors = partOfGraph.get(node)
            if (neighbors) {
              for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                  if (detectCycle(neighbor, [...path])) {
                    return true
                  }
                } else if (recursionStack.has(neighbor)) {
                  // Found a cycle
                  const cycleStart = path.indexOf(neighbor)
                  const cyclePath = path.slice(cycleStart).concat(neighbor)
                  cycles.push(cyclePath.join(' -> '))
                  return true
                }
              }
            }

            recursionStack.delete(node)
            return false
          }

          // Check all nodes
          for (const node of partOfGraph.keys()) {
            if (!visited.has(node)) {
              detectCycle(node, [])
            }
          }

          if (cycles.length > 0) {
            expect.fail(
              `Found ${cycles.length} circular partOf chains:\n` +
              cycles.slice(0, 5).join('\n') +
              (cycles.length > 5 ? `\n... and ${cycles.length - 5} more` : '')
            )
          }
        })
      })
    })
  })
})
