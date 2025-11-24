#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

const sourceDir = '.source/ONET/db_30_0_text'
const targetDir = '.source/ONET'

// Convert filename to PascalCase
const toPascalCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase())
}

// Convert header to camelCase
const toCamelCase = (str: string): string => {
  return str
    .replace(/O\*NET/g, 'ONET')
    .replace(/%2C/g, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
}

console.log('Converting ONET .txt files to PascalCase .tsv files...\n')

const txtFiles = fs.readdirSync(sourceDir)
  .filter(f => f.endsWith('.txt'))

let converted = 0

for (const txtFile of txtFiles) {
  const txtPath = path.join(sourceDir, txtFile)
  const baseName = txtFile.replace('.txt', '')
  const pascalName = toPascalCase(baseName)
  const tsvPath = path.join(targetDir, `ONET.${pascalName}.tsv`)
  
  console.log(`${txtFile} -> ONET.${pascalName}.tsv`)
  
  const content = fs.readFileSync(txtPath, 'utf-8')
  const lines = content.split('\n')
  
  if (lines.length === 0) continue
  
  // Convert headers to camelCase
  const headers = lines[0].split('\t')
  const newHeaders = headers.map(h => toCamelCase(h))
  
  // Write with camelCase headers
  const updatedContent = [newHeaders.join('\t'), ...lines.slice(1)].join('\n')
  fs.writeFileSync(tsvPath, updatedContent)
  converted++
}

console.log(`\n✅ Converted ${converted} files to PascalCase TSV format`)
