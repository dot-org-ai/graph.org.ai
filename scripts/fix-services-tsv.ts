#!/usr/bin/env tsx
/**
 * Fix Services.tsv - data rows have inconsistent field counts
 */

import * as fs from 'fs'
import * as readline from 'readline'

async function fixServicesTSV() {
  const input = '.data/Services.tsv'
  const output = '.data/Services.tsv.fixed'

  console.log('📝 Fixing Services.tsv field count...')

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
        // Add empty fields at the end to match header
        while (fields.length < headerFields) {
          fields.push('')
        }
        fixed++
      } else if (fields.length > headerFields) {
        // Truncate extra fields
        fields.splice(headerFields)
        fixed++
      }

      writeStream.write(fields.join('\t') + '\n')
    }

    if (lineNum % 10000 === 0) {
      process.stdout.write(`\r  Processing: ${lineNum.toLocaleString()} lines...`)
    }
  }

  writeStream.end()

  console.log(`\n\n  ✅ Fixed ${fixed} rows out of ${(lineNum - 1).toLocaleString()}`)
  console.log(`  📄 Output: ${output}`)
  console.log(`\n  To apply: mv ${output} ${input}`)
}

fixServicesTSV()
