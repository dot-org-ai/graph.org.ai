#!/usr/bin/env tsx
/**
 * Fix Products.tsv - data rows are missing one field compared to header
 */

import * as fs from 'fs'
import * as readline from 'readline'

async function fixProductsTSV() {
  const input = '.data/Products.tsv'
  const output = '.data/Products.tsv.fixed'

  console.log('📝 Fixing Products.tsv field count...')

  const readStream = fs.createReadStream(input)
  const writeStream = fs.createWriteStream(output)
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  })

  let lineNum = 0
  let headerFields = 0
  let fixed = 0

  for await (const line of rl) {
    lineNum++

    if (lineNum === 1) {
      // Header - keep as is
      headerFields = line.split('\t').length
      writeStream.write(line + '\n')
      console.log(`  Header has ${headerFields} fields`)
    } else {
      const fields = line.split('\t')

      if (fields.length < headerFields) {
        // Add empty field at the end to match header
        while (fields.length < headerFields) {
          fields.push('')
          fixed++
        }
      }

      writeStream.write(fields.join('\t') + '\n')
    }
  }

  writeStream.end()

  console.log(`\n  ✅ Fixed ${fixed} rows`)
  console.log(`  📄 Output: ${output}`)
  console.log(`\n  To apply: mv ${output} ${input}`)
}

fixProductsTSV()
