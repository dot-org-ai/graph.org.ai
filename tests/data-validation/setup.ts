import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

export const DATA_DIR = '.data'

export interface EntityRow {
  url: string
  ns: string
  type: string
  id: string
  code: string
  name: string
  description: string
  [key: string]: string // Allow additional fields
}

export interface RelationshipRow {
  ns: string
  from: string
  to: string
  predicate: string
  reverse: string
}

export function parseTSV(content: string): any[] {
  // Normalize line endings: replace \r\n with \n, then \r with \n
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n').filter(l => l.trim())
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

export function loadTSVFile(fileName: string): any[] {
  const filePath = resolve(DATA_DIR, fileName)
  const content = readFileSync(filePath, 'utf-8')
  return parseTSV(content)
}

export function getAllEntityFiles(): string[] {
  const files = readdirSync(DATA_DIR)
  return files.filter(f => f.endsWith('.tsv') && !f.includes('.Relationships.'))
}

export function getAllRelationshipFiles(): string[] {
  const files = readdirSync(DATA_DIR)
  return files.filter(f => f.endsWith('.Relationships.tsv'))
}

export const ENTITY_HEADERS = ['url', 'ns', 'type', 'id', 'code', 'name', 'description']
export const RELATIONSHIP_HEADERS = ['ns', 'from', 'to', 'predicate', 'reverse']

export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.length > 0
  } catch {
    return false
  }
}

export function isPascalCase(str: string): boolean {
  if (!str || str.length === 0) return false
  // Allow semantic IDs with dots (e.g., "Contact.created", "create.Contact")
  if (str.includes('.')) return true
  // PascalCase: starts with uppercase OR number, no hyphens, underscores, or spaces
  // Numbers are allowed at the start for entities like "17hats", "2chat", "3DCart"
  return /^[A-Z0-9][a-zA-Z0-9]*$/.test(str)
}

export function hasWindowsLineEndings(content: string): boolean {
  return content.includes('\r\n')
}

export function hasTrailingWhitespace(content: string): boolean {
  const lines = content.split('\n')
  return lines.some(line => line !== line.trimEnd())
}

export function isCamelCase(str: string): boolean {
  if (!str || str.length === 0) return false
  // camelCase: starts with lowercase, no underscores, hyphens, or spaces
  // Can contain numbers after the first character
  return /^[a-z][a-zA-Z0-9]*$/.test(str)
}
