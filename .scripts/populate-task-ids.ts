#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Populate taskId field in Tasks.tsv by matching descriptions to ONET.TaskStatements.tsv
 */

interface OnetTask {
  onetCode: string
  taskId: string
  task: string
  taskType: string
}

function loadOnetTasks(): Map<string, OnetTask> {
  const taskStatementsPath = join(projectRoot, '.source/ONET/ONET.TaskStatements.tsv')
  const content = readFileSync(taskStatementsPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())

  const taskMap = new Map<string, OnetTask>()

  // Parse O*NET tasks
  const headers = lines[0].split('\t')
  const onetCodeIdx = headers.indexOf('oNETSOCCode')
  const taskIdIdx = headers.indexOf('taskID')
  const taskIdx = headers.indexOf('task')
  const taskTypeIdx = headers.indexOf('taskType')

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')

    const task = parts[taskIdx]
    if (!task) continue

    // Normalize task description for matching (lowercase, trim)
    const normalizedTask = task.toLowerCase().trim()

    taskMap.set(normalizedTask, {
      onetCode: parts[onetCodeIdx],
      taskId: parts[taskIdIdx],
      task: parts[taskIdx],
      taskType: parts[taskTypeIdx] || 'Core'
    })
  }

  return taskMap
}

function populateTaskIds(): void {
  console.log('Loading O*NET task statements...')
  const onetTasks = loadOnetTasks()
  console.log(`✅ Loaded ${onetTasks.size.toLocaleString()} O*NET tasks`)
  console.log()

  // Read Tasks.tsv
  const tasksPath = join(projectRoot, '.data/Tasks.tsv')
  const content = readFileSync(tasksPath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length === 0) {
    console.log('❌ Tasks.tsv is empty')
    return
  }

  // Parse header
  const headers = lines[0].split('\t')
  const descIdx = headers.indexOf('description')
  const taskIdIdx = headers.indexOf('taskId')
  const onetCodeIdx = headers.indexOf('onetCode')
  const taskIdx = headers.indexOf('task')

  if (descIdx === -1 || taskIdIdx === -1) {
    console.log('❌ Required columns not found in Tasks.tsv')
    return
  }

  console.log('Matching tasks and populating taskId field...')

  let matched = 0
  let unmatched = 0
  const enrichedLines: string[] = [lines[0]] // Keep header

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const parts = lines[i].split('\t')

    // Pad to ensure we have all columns
    while (parts.length < headers.length) {
      parts.push('')
    }

    const description = parts[descIdx]
    if (!description) {
      unmatched++
      enrichedLines.push(parts.join('\t'))
      continue
    }

    // Try to match by description
    const normalizedDesc = description.toLowerCase().trim()
    const onetTask = onetTasks.get(normalizedDesc)

    if (onetTask) {
      // Populate fields
      parts[taskIdIdx] = onetTask.taskId
      parts[onetCodeIdx] = onetTask.onetCode
      parts[taskIdx] = onetTask.task
      matched++
    } else {
      unmatched++
    }

    enrichedLines.push(parts.join('\t'))
  }

  // Write enriched file
  writeFileSync(tasksPath, enrichedLines.join('\n'))

  console.log()
  console.log(`✅ Populated taskId field in Tasks.tsv`)
  console.log(`   Matched: ${matched.toLocaleString()}`)
  console.log(`   Unmatched: ${unmatched.toLocaleString()}`)
  console.log(`   Match rate: ${((matched / (matched + unmatched)) * 100).toFixed(1)}%`)
}

async function main() {
  console.log('='.repeat(80))
  console.log('Populate taskId Field in Tasks.tsv')
  console.log('='.repeat(80))
  console.log()

  populateTaskIds()

  console.log()
  console.log('✅ Task ID population complete!')
  console.log()
  console.log('Next step: Run tsx .scripts/enrich-all-digital-scores.ts')
}

main().catch(console.error)
