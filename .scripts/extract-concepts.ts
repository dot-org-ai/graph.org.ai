#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extract concepts from tasks, processes, and descriptions
 * 
 * A concept is a noun phrase (possibly modified) that represents an abstract or concrete entity
 * 
 * Examples:
 * - "board members" → BoardMembers (base: Members, modifier: board)
 * - "external environment" → ExternalEnvironment (base: Environment, modifier: external)
 * - "customer service" → CustomerService (base: Service, modifier: customer)
 * - "risk management" → RiskManagement (base: Management, modifier: risk)
 */

interface Concept {
  id: string
  baseNoun: string
  modifiers: string
  frequency: number
  sources: Set<string>
  contexts: string[]
}

interface Task {
  id: string
  task: string
  occupationTitle: string
}

interface Process {
  id: string
  name: string
  industry: string
}

interface Product {
  id: string
  name: string
  description: string
}

function parseTSV(tsvPath: string, hasHeader = true): string[][] {
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n')
  return (hasHeader ? lines.slice(1) : lines)
    .filter(line => line.trim())
    .map(line => line.split('\t'))
}

/**
 * Extract noun phrases from text
 * Common patterns:
 * - [Adj] Noun: "external environment", "long-term vision"
 * - Noun Noun: "board members", "customer service"
 * - Adj Adj Noun: "senior executive leadership"
 */
function extractNounPhrases(text: string): string[] {
  const phrases: string[] = []
  
  // Remove common verbs and articles
  const cleaned = text
    .toLowerCase()
    .replace(/\b(the|a|an|and|or|of|to|in|for|with|on|at|from|by|about|as|into|through|during|before|after|above|below|between|under|over)\b/g, ' ')
    .replace(/[,;:()]/g, ' ')
    .trim()
  
  // Split into words
  const words = cleaned.split(/\s+/).filter(w => w.length > 2)
  
  // Extract 2-word and 3-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    // 2-word phrases
    if (i < words.length - 1) {
      const phrase = `${words[i]} ${words[i + 1]}`
      if (isValidNounPhrase(phrase)) {
        phrases.push(phrase)
      }
    }
    
    // 3-word phrases
    if (i < words.length - 2) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
      if (isValidNounPhrase(phrase)) {
        phrases.push(phrase)
      }
    }
  }
  
  return phrases
}

function isValidNounPhrase(phrase: string): boolean {
  // Skip if contains common verbs
  const commonVerbs = /\b(develop|manage|create|implement|establish|provide|ensure|maintain|monitor|assess|evaluate|analyze|review|update|coordinate|support|facilitate|determine|identify|prepare|process|execute|deliver|conduct|perform|define|design|plan|build|test|deploy|configure|install|operate|control|measure|track|report|document|communicate|collaborate|negotiate|resolve|approve|authorize|validate|verify|confirm|check|inspect|audit|comply|adhere|follow|enforce|govern|regulate|oversee|supervise|direct|lead|guide|advise|consult|recommend|suggest|propose|request|require|demand|expect|anticipate|predict|forecast|estimate|calculate|compute|count|quantify|qualify|classify|categorize|organize|arrange|sort|group|filter|search|find|locate|discover|explore|investigate|research|study|examine|observe|compare|contrast|distinguish|differentiate|separate|divide|split|merge|combine|integrate|consolidate|aggregate|summarize|synthesize|compile|collect|gather|acquire|obtain|receive|accept|reject|decline|refuse|deny|discard|delete|remove|eliminate|reduce|minimize|decrease|lower|cut|trim|prune|optimize|improve|enhance|upgrade|augment|extend|expand|grow|increase|maximize|boost|raise|elevate|scale|amplify|strengthen|reinforce|fortify|secure|protect|safeguard|defend|shield|guard|preserve|conserve|save|store|archive|backup|restore|recover|retrieve|extract|export|import|load|unload|transfer|transmit|send|receive|distribute|dispatch|route|forward|redirect|relay|broadcast|publish|release|issue|announce|declare|state|claim|assert|affirm|confirm|acknowledge|recognize|admit|confess|disclose|reveal|expose|uncover|unveil|show|display|present|demonstrate|illustrate|exemplify|represent|symbolize|signify|indicate|denote|designate|label|tag|mark|flag|highlight|emphasize|stress|underscore|accentuate|focus|concentrate|center|target|aim|direct|point|refer|cite|quote|mention|note|remark|comment|observe|notice|detect|sense|perceive|recognize|realize|understand|comprehend|grasp|apprehend|appreciate|value|prize|treasure|cherish|admire|respect|esteem|regard|consider|deem|judge|evaluate|assess|rate|rank|grade|score|measure|gauge|weigh|balance|equate|compare|liken|relate|associate|connect|link|bind|tie|attach|fasten|fix|secure|anchor|ground|base|establish|found|institute|initiate|start|begin|commence|launch|introduce|inaugurate|open|activate|enable|empower|authorize|permit|allow|let|grant|give|award|bestow|confer|endow|provide|supply|furnish|equip|outfit|arm|prepare|ready|prime|set|arrange|organize|structure|format|shape|form|mold|model|pattern|template|design|plan|draft|sketch|outline|frame|construct|build|assemble|fabricate|manufacture|produce|generate|yield|bear|spawn|breed|propagate|replicate|reproduce|duplicate|copy|clone|mirror|reflect|echo|repeat|reiterate|restate|paraphrase|rephrase|reword|revise|edit|modify|alter|change|transform|convert|translate|interpret|decode|decipher|decrypt|encode|encrypt|code|program|script|automate|mechanize|computerize|digitize|virtualize|simulate|emulate|mimic|imitate|copy|follow|track|trace|monitor|watch|observe|view|see|look|examine|inspect|scrutinize|scan|survey|poll|canvas|question|query|ask|inquire|probe|investigate|research|study|analyze|dissect|parse|break|separate|divide|split|partition|segment|section|slice|cut|chop|dice|mince|grind|crush|pulverize|shatter|smash|break|crack|fracture|rupture|tear|rip|shred|rend|cleave|sever|sunder|disconnect|detach|disengage|separate|isolate|segregate|quarantine|sequester|confine|restrict|limit|constrain|restrain|inhibit|hinder|impede|obstruct|block|stop|halt|cease|end|finish|complete|conclude|terminate|close|shut|seal|lock|secure|fasten|fix|attach|connect|join|unite|merge|blend|mix|combine|integrate|incorporate|include|comprise|encompass|contain|hold|carry|bear|support|sustain|maintain|preserve|keep|retain|save|store|reserve|allocate|assign|designate|appoint|nominate|elect|select|choose|pick|opt|decide|determine|resolve|settle|conclude|finalize|wrap|close|end|finish|complete)\b/
  if (commonVerbs.test(phrase)) {
    return false
  }
  
  // Skip if too short or contains numbers
  if (phrase.length < 4 || /\d/.test(phrase)) {
    return false
  }
  
  // Must contain at least one letter
  if (!/[a-z]/.test(phrase)) {
    return false
  }
  
  return true
}

function toConceptId(phrase: string): { id: string; baseNoun: string; modifiers: string } {
  const words = phrase.split(/\s+/)
  const baseNoun = words[words.length - 1]
  const modifiers = words.slice(0, -1).join(' ')
  
  // Convert to CamelCase
  const id = phrase
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  
  return {
    id,
    baseNoun: baseNoun.charAt(0).toUpperCase() + baseNoun.slice(1),
    modifiers
  }
}

async function main() {
  const dataDir = path.resolve(__dirname, '../.data')
  
  console.log('='.repeat(80))
  console.log('CONCEPT EXTRACTION')
  console.log('='.repeat(80))
  console.log()
  
  const conceptMap = new Map<string, Concept>()
  
  // Extract from Tasks
  console.log('Extracting concepts from tasks...')
  const taskRows = parseTSV(path.join(dataDir, 'Tasks.tsv'))
  let taskConceptCount = 0
  
  for (const row of taskRows) {
    const [id, onetCode, taskId, task, occupationTitle] = row
    if (!task) continue
    
    const phrases = extractNounPhrases(task)
    for (const phrase of phrases) {
      const { id: conceptId, baseNoun, modifiers } = toConceptId(phrase)
      
      if (!conceptMap.has(conceptId)) {
        conceptMap.set(conceptId, {
          id: conceptId,
          baseNoun,
          modifiers,
          frequency: 0,
          sources: new Set(),
          contexts: []
        })
      }
      
      const concept = conceptMap.get(conceptId)!
      concept.frequency++
      concept.sources.add('Tasks')
      if (concept.contexts.length < 3) {
        concept.contexts.push(task.substring(0, 100))
      }
      taskConceptCount++
    }
  }
  
  console.log(`  ✓ Processed ${taskRows.length} tasks`)
  console.log(`  ✓ Found ${taskConceptCount} concept occurrences`)
  console.log()
  
  // Extract from Processes
  console.log('Extracting concepts from processes...')
  const processRows = parseTSV(path.join(dataDir, 'Processes.tsv'))
  let processConceptCount = 0
  
  for (const row of processRows) {
    const [id, pcfId, hierarchyId, name, industry] = row
    if (!name) continue
    
    const phrases = extractNounPhrases(name)
    for (const phrase of phrases) {
      const { id: conceptId, baseNoun, modifiers } = toConceptId(phrase)
      
      if (!conceptMap.has(conceptId)) {
        conceptMap.set(conceptId, {
          id: conceptId,
          baseNoun,
          modifiers,
          frequency: 0,
          sources: new Set(),
          contexts: []
        })
      }
      
      const concept = conceptMap.get(conceptId)!
      concept.frequency++
      concept.sources.add('Processes')
      if (concept.contexts.length < 3) {
        concept.contexts.push(name.substring(0, 100))
      }
      processConceptCount++
    }
  }
  
  console.log(`  ✓ Processed ${processRows.length} processes`)
  console.log(`  ✓ Found ${processConceptCount} concept occurrences`)
  console.log()
  
  // Extract from Product/Service descriptions
  console.log('Extracting concepts from product/service descriptions...')
  const productRows = parseTSV(path.join(dataDir, 'Products.tsv'))
  const serviceRows = parseTSV(path.join(dataDir, 'Services.tsv'))
  let descConceptCount = 0
  
  for (const row of [...productRows, ...serviceRows]) {
    const [id, name, description] = row
    if (!description || description.length < 20) continue
    
    const phrases = extractNounPhrases(description)
    for (const phrase of phrases) {
      const { id: conceptId, baseNoun, modifiers } = toConceptId(phrase)
      
      if (!conceptMap.has(conceptId)) {
        conceptMap.set(conceptId, {
          id: conceptId,
          baseNoun,
          modifiers,
          frequency: 0,
          sources: new Set(),
          contexts: []
        })
      }
      
      const concept = conceptMap.get(conceptId)!
      concept.frequency++
      concept.sources.add('Descriptions')
      if (concept.contexts.length < 3) {
        concept.contexts.push(description.substring(0, 100))
      }
      descConceptCount++
    }
  }
  
  console.log(`  ✓ Processed ${productRows.length + serviceRows.length} products/services`)
  console.log(`  ✓ Found ${descConceptCount} concept occurrences`)
  console.log()
  
  // Filter to concepts with frequency >= 3
  const filteredConcepts = Array.from(conceptMap.values())
    .filter(c => c.frequency >= 3)
    .sort((a, b) => b.frequency - a.frequency)
  
  console.log(`  ✓ Total unique concepts: ${conceptMap.size}`)
  console.log(`  ✓ Concepts with frequency >= 3: ${filteredConcepts.length}`)
  console.log()
  
  // Show top concepts
  console.log('Top 50 concepts by frequency:')
  filteredConcepts.slice(0, 50).forEach(c => {
    console.log(`  ${c.id} (${c.frequency}x) - base: ${c.baseNoun}, modifiers: "${c.modifiers}"`)
  })
  console.log()
  
  // Write output
  const outputPath = path.join(dataDir, 'ExtractedConcepts.tsv')
  const header = 'id\tbaseNoun\tmodifiers\tfrequency\tsources\tsampleContext\n'
  const rows = filteredConcepts.map(c =>
    `${c.id}\t${c.baseNoun}\t${c.modifiers}\t${c.frequency}\t${Array.from(c.sources).join(',')}\t${c.contexts[0] || ''}`
  ).join('\n')
  
  fs.writeFileSync(outputPath, header + rows)
  console.log(`  ✓ Wrote ${outputPath}`)
  console.log()
  
  console.log('='.repeat(80))
  console.log('EXTRACTION COMPLETE')
  console.log('='.repeat(80))
  console.log(`Total concepts: ${filteredConcepts.length}`)
  console.log()
}

main().catch(console.error)
