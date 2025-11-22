#!/usr/bin/env node
/**
 * Content Generation Script for {{domain}}
 *
 * Generates MDX files from data sources
 */

import fs from 'fs/promises'
import path from 'path'

interface EntityData {
  name: string
  type: string
  description?: string
  properties?: Record<string, any>
  parent?: string
}

const TEMPLATES_DIR = path.join(__dirname, '../../templates/domain')
const OUTPUT_DIR = path.join(__dirname, '../things')

async function loadTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(TEMPLATES_DIR, templateName)
  return await fs.readFile(templatePath, 'utf-8')
}

function renderTemplate(template: string, data: Record<string, any>): string {
  // Simple template rendering - replace {{key}} with values
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match
  })
}

async function generateEntity(entity: EntityData): Promise<void> {
  const template = await loadTemplate('thing.mdx')
  const content = renderTemplate(template, {
    domain: '{{domain}}',
    domainName: '{{domainName}}',
    TypeName: entity.name,
    description: entity.description || '',
    parentType: entity.parent || 'Thing',
  })

  const outputPath = path.join(OUTPUT_DIR, `${entity.name}.mdx`)
  await fs.writeFile(outputPath, content, 'utf-8')
  console.log(`Generated: ${entity.name}.mdx`)
}

async function main() {
  // Create output directory if it doesn't exist
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // Load your data source here
  // Example: const data = await loadDataSource()

  // For now, generate from a simple list
  const entities: EntityData[] = [
    // Add your entities here
  ]

  for (const entity of entities) {
    await generateEntity(entity)
  }

  console.log(`✓ Generated ${entities.length} entity files`)
}

main().catch(console.error)
