#!/usr/bin/env tsx

/**
 * Fix naming inconsistencies in DigitalScores.tsv
 *
 * Standardizes entity names to match source data conventions:
 * - APQC processes: Use actual IDs from parsed data (e.g., Companies.develop.Vision)
 * - O*NET tasks: Use actual IDs from parsed data (e.g., Chief.Executives.confer.with.Board.Members)
 * - SOC occupations: Keep as-is (these use codes, not names)
 * - Other entity types: Keep consistent dot-separated format
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Load mapping data from source
function loadAPQCMapping(): Map<string, string> {
  const map = new Map<string, string>()
  const content = readFileSync(join(projectRoot, '.data/parsed/APQC.Processes.Expanded.tsv'), 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')
    const id = parts[0] // e.g., "Companies.develop.Vision"
    const pcfId = parts[1] // e.g., "10002"
    if (id && pcfId) {
      map.set(pcfId, id)
    }
  }

  console.log(`Loaded ${map.size} APQC process mappings`)
  return map
}

// Main fix function
function fixNaming() {
  const apqcMap = loadAPQCMapping()
  const scoresFile = join(projectRoot, '.enrichment/DigitalScores.tsv')
  const content = readFileSync(scoresFile, 'utf-8')
  const lines = content.split('\n')

  const header = lines[0]
  const outputLines: string[] = [header]

  let fixedCount = 0
  let skippedCount = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim() || line.startsWith('#')) {
      outputLines.push(line)
      continue
    }

    const parts = line.split('\t')
    if (parts.length < 3) {
      outputLines.push(line)
      continue
    }

    const [entity, entityType, codes, ...rest] = parts

    // Fix APQC processes
    if (entityType === 'process' && codes) {
      // Check if codes is a simple process ID (e.g., "10002")
      if (/^\d+$/.test(codes)) {
        const correctId = apqcMap.get(codes)
        if (correctId && correctId !== entity) {
          console.log(`Fixing: ${entity} -> ${correctId} (${codes})`)
          parts[0] = correctId
          fixedCount++
        }
      }
      // Check for wildcard patterns like "1.*", "10.*"
      else if (/^\d+\.\*$/.test(codes)) {
        // These are hierarchical patterns, leave entity names as-is
        skippedCount++
      }
    }

    outputLines.push(parts.join('\t'))
  }

  writeFileSync(scoresFile, outputLines.join('\n'), 'utf-8')
  console.log(`\nFixed ${fixedCount} entity names`)
  console.log(`Skipped ${skippedCount} hierarchical patterns`)
  console.log(`Total lines processed: ${lines.length}`)
}

fixNaming()
