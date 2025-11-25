#!/usr/bin/env tsx
/**
 * Fix Task IDs to use GraphDL semantic statement format
 *
 * Current (WRONG):
 * - url: https://onet.org/Task/Chiefexecutivesdirectorganization'sfinancialbudgetactivitiestofundoperationsmaximizeinvestmentsincreaseefficiency
 * - id: Chiefexecutivesdirectorganization'sfinancialbudgetactivitiestofundoperationsmaximizeinvestmentsincreaseefficiency
 * - code: ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperationsMaximizeInvestmentsIncreaseEfficiency
 *
 * Should be (CORRECT GraphDL format):
 * - url: https://onet.org.ai/ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperationsMaximizeInvestmentsIncreaseEfficiency
 * - id: ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperationsMaximizeInvestmentsIncreaseEfficiency
 * - code: (empty - since id is the GraphDL statement)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'
const BACKUP_DIR = '.data/.backup'

function parseTSV(content: string): any[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split('\t')
  const rows: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const obj: any = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || ''
    }
    rows.push(obj)
  }

  return rows
}

function writeTSV(filePath: string, rows: any[]): void {
  if (rows.length === 0) {
    console.warn(`No data to write`)
    return
  }

  const headers = Object.keys(rows[0])
  const lines = [headers.join('\t')]

  for (const row of rows) {
    const values = headers.map(h => row[h] || '')
    lines.push(values.join('\t'))
  }

  writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8')
}

function fixTasks() {
  console.log('🔧 Fixing Task IDs to use GraphDL semantic statements...\n')

  const tasksPath = resolve(DATA_DIR, 'Tasks.tsv')
  const backupPath = resolve(BACKUP_DIR, 'Tasks.tsv.backup')

  // Read current file
  const content = readFileSync(tasksPath, 'utf-8')
  const rows = parseTSV(content)

  console.log(`📊 Processing ${rows.length} tasks...`)

  // Backup original
  writeFileSync(backupPath, content, 'utf-8')
  console.log(`✅ Backup created: ${backupPath}`)

  // Fix each row
  let fixed = 0
  for (const row of rows) {
    if (row.code && row.code.includes('.')) {
      // The code field has the GraphDL format - use it as the id
      const graphdlId = row.code
      row.url = `https://onet.org.ai/${graphdlId}`
      row.ns = 'onet.org.ai'
      row.id = graphdlId
      row.code = '' // Empty since id now has the GraphDL statement
      fixed++
    }
  }

  // Write fixed file
  writeTSV(tasksPath, rows)
  console.log(`✅ Fixed ${fixed} task IDs`)
  console.log(`📁 Updated: ${tasksPath}`)
}

function fixProcesses() {
  console.log('\n🔧 Fixing Process IDs to use GraphDL semantic statements...\n')

  const processesPath = resolve(DATA_DIR, 'Processes.tsv')
  const backupPath = resolve(BACKUP_DIR, 'Processes.tsv.backup')

  // Read current file
  const content = readFileSync(processesPath, 'utf-8')
  const rows = parseTSV(content)

  console.log(`📊 Processing ${rows.length} processes...`)

  // Backup original
  writeFileSync(backupPath, content, 'utf-8')
  console.log(`✅ Backup created: ${backupPath}`)

  // Fix each row
  let fixed = 0
  for (const row of rows) {
    if (row.code && row.code.includes('.')) {
      // The code field has the GraphDL format - use it as the id
      const graphdlId = row.code
      row.url = `https://apqc.org.ai/${graphdlId}`
      row.ns = 'apqc.org.ai'
      row.id = graphdlId
      row.code = '' // Empty since id now has the GraphDL statement
      fixed++
    }
  }

  // Write fixed file
  writeTSV(processesPath, rows)
  console.log(`✅ Fixed ${fixed} process IDs`)
  console.log(`📁 Updated: ${processesPath}`)
}

async function main() {
  try {
    fixTasks()
    fixProcesses()
    console.log('\n✅ Done! Task and Process IDs now use GraphDL semantic statement format.')
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
