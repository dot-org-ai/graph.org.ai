#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

const sourceDir = '.source/ONET'

// Simplified column name mapping
const camelCase = (str: string): string => {
  return str
    .replace(/O\*NET/g, 'ONET')
    .replace(/%2C/g, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
}

console.log('Normalizing ONET TSV headers...\n')

// Get all ONET TSV files
const files = fs.readdirSync(sourceDir)
  .filter(f => f.startsWith('ONET.') && f.endsWith('.tsv'))
  .map(f => path.join(sourceDir, f))

let totalProcessed = 0

for (const filePath of files) {
  const filename = path.basename(filePath)
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length === 0) continue

  const headers = lines[0].split('\t')
  const newHeaders = headers.map(h => camelCase(h))

  // Check if headers changed
  const headersChanged = headers.some((h, i) => h !== newHeaders[i])

  if (headersChanged) {
    console.log(`${filename}:`)
    console.log(`  Old: ${headers.slice(0, 5).join(', ')}...`)
    console.log(`  New: ${newHeaders.slice(0, 5).join(', ')}...`)

    // Write updated file
    const updatedContent = [newHeaders.join('\t'), ...lines.slice(1)].join('\n')
    fs.writeFileSync(filePath, updatedContent)
    totalProcessed++
  }
}

console.log(`\n✅ Normalized ${totalProcessed} files`)
