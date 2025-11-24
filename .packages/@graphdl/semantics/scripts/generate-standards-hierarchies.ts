#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

function createId(text: string): string {
  return text
    .split(/[\s\-\/,;:()]+/)
    .filter(t => t.trim())
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')
}

async function generateUNSPSC() {
  console.log('\n📦 Generating UNSPSC Hierarchies...')
  
  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const sourceFile = path.join(repoRoot, '.source/UNSPSC/UNSPSC.Codes.tsv')
  const outputDir = path.join(repoRoot, '.data')
  
  const content = fs.readFileSync(sourceFile, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header
  
  const segments = new Map()
  const families = new Map()
  const classes = new Map()
  const commodities = new Map()
  
  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const [segmentCode, segmentTitle, familyCode, familyTitle, classCode, classTitle, commodityCode, commodityTitle, definition] = cols
    
    if (segmentCode && segmentTitle && !segments.has(segmentCode)) {
      segments.set(segmentCode, {
        code: segmentCode,
        title: segmentTitle,
        id: createId(segmentTitle)
      })
    }
    
    if (familyCode && familyTitle && !families.has(familyCode)) {
      families.set(familyCode, {
        code: familyCode,
        title: familyTitle,
        segmentCode,
        id: createId(familyTitle)
      })
    }
    
    if (classCode && classTitle && !classes.has(classCode)) {
      classes.set(classCode, {
        code: classCode,
        title: classTitle,
        familyCode,
        id: createId(classTitle)
      })
    }
    
    if (commodityCode && commodityTitle) {
      commodities.set(commodityCode, {
        code: commodityCode,
        title: commodityTitle,
        classCode,
        definition: definition || '',
        id: createId(commodityTitle)
      })
    }
  }
  
  // Write UNSPSC.Segments.tsv
  const segmentsData = Array.from(segments.values())
  const segmentsTsv = ['id\tcode\tname\n', ...segmentsData.map(s => `${s.id}\t${s.code}\t${s.title}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'UNSPSC.Segments.tsv'), segmentsTsv)
  console.log(`  ✓ UNSPSC.Segments.tsv (${segments.size} segments)`)
  
  // Write UNSPSC.Families.tsv  
  const familiesData = Array.from(families.values())
  const familiesTsv = ['id\tcode\tname\tsegmentCode\n', ...familiesData.map(f => `${f.id}\t${f.code}\t${f.title}\t${f.segmentCode}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'UNSPSC.Families.tsv'), familiesTsv)
  console.log(`  ✓ UNSPSC.Families.tsv (${families.size} families)`)
  
  // Write UNSPSC.Classes.tsv
  const classesData = Array.from(classes.values())
  const classesTsv = ['id\tcode\tname\tfamilyCode\n', ...classesData.map(c => `${c.id}\t${c.code}\t${c.title}\t${c.familyCode}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'UNSPSC.Classes.tsv'), classesTsv)
  console.log(`  ✓ UNSPSC.Classes.tsv (${classes.size} classes)`)
  
  // Write UNSPSC.Commodities.tsv
  const commoditiesData = Array.from(commodities.values())
  const commoditiesTsv = ['id\tcode\tname\tdescription\tclassCode\n', ...commoditiesData.map(c => `${c.id}\t${c.code}\t${c.title}\t${c.definition}\t${c.classCode}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'UNSPSC.Commodities.tsv'), commoditiesTsv)
  console.log(`  ✓ UNSPSC.Commodities.tsv (${commodities.size} commodities)`)
}

async function generateNAPCS() {
  console.log('\n🔧 Generating NAPCS Hierarchies...')
  
  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const sourceFile = path.join(repoRoot, '.source/NAPCS/NAPCS.2022.Structure.csv')
  const outputDir = path.join(repoRoot, '.data')
  
  if (!fs.existsSync(sourceFile)) {
    console.log('  ⚠ NAPCS source not found')
    return
  }
  
  const content = fs.readFileSync(sourceFile, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header
  
  const groups = new Map()
  const classes = new Map()
  const subclasses = new Map()
  const details = new Map()
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    // Parse CSV with quoted fields
    const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g)
    if (!matches || matches.length < 7) continue
    
    const cols = matches.map(m => m.replace(/^,?"?|"?$/g, ''))
    const [level, hierarchicalStructure, code, parent, codeTitle, superscript, codeDefinition] = cols
    
    if (!code || !codeTitle) continue
    
    const id = createId(codeTitle)
    
    if (level === '1') { // Group
      groups.set(code, { id, code, name: codeTitle, description: codeDefinition || '' })
    } else if (level === '2') { // Class
      classes.set(code, { id, code, name: codeTitle, description: codeDefinition || '', parent })
    } else if (level === '3') { // Subclass
      subclasses.set(code, { id, code, name: codeTitle, description: codeDefinition || '', parent })
    } else if (level === '4') { // Detail
      details.set(code, { id, code, name: codeTitle, description: codeDefinition || '', parent })
    }
  }
  
  // Write files
  const groupsTsv = ['id\tcode\tname\tdescription\n', ...Array.from(groups.values()).map(g => `${g.id}\t${g.code}\t${g.name}\t${g.description}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'NAPCS.Groups.tsv'), groupsTsv)
  console.log(`  ✓ NAPCS.Groups.tsv (${groups.size} groups)`)
  
  const classesTsv = ['id\tcode\tname\tdescription\tparent\n', ...Array.from(classes.values()).map(c => `${c.id}\t${c.code}\t${c.name}\t${c.description}\t${c.parent}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'NAPCS.Classes.tsv'), classesTsv)
  console.log(`  ✓ NAPCS.Classes.tsv (${classes.size} classes)`)
  
  const subclassesTsv = ['id\tcode\tname\tdescription\tparent\n', ...Array.from(subclasses.values()).map(s => `${s.id}\t${s.code}\t${s.name}\t${s.description}\t${s.parent}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'NAPCS.Subclasses.tsv'), subclassesTsv)
  console.log(`  ✓ NAPCS.Subclasses.tsv (${subclasses.size} subclasses)`)
  
  const detailsTsv = ['id\tcode\tname\tdescription\tparent\n', ...Array.from(details.values()).map(d => `${d.id}\t${d.code}\t${d.name}\t${d.description}\t${d.parent}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'NAPCS.Details.tsv'), detailsTsv)
  console.log(`  ✓ NAPCS.Details.tsv (${details.size} details)`)
}

async function generateGS1() {
  console.log('\n🏷️  Generating GS1 GPC Hierarchies...')
  
  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const gpcDir = path.join(repoRoot, '.source/GS1')
  const outputDir = path.join(repoRoot, '.data')
  
  const gpcFiles = fs.readdirSync(gpcDir).filter(f => f.endsWith('.xlsx') && f.includes('GPC'))
  
  if (gpcFiles.length === 0) {
    console.log('  ⚠ No GPC files found')
    return
  }
  
  const gpcFile = gpcFiles.sort().pop()!
  const gpcPath = path.join(gpcDir, gpcFile)
  console.log(`  Reading: ${gpcFile}`)
  
  const workbook = XLSX.readFile(gpcPath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data: any[] = XLSX.utils.sheet_to_json(worksheet)
  
  const segments = new Map()
  const families = new Map()
  const classes = new Map()
  const bricks = new Map()
  
  for (const row of data) {
    const segmentCode = row.SegmentCode
    const segmentTitle = row.SegmentTitle
    const familyCode = row.FamilyCode
    const familyTitle = row.FamilyTitle
    const classCode = row.ClassCode
    const classTitle = row.ClassTitle
    const brickCode = row.BrickCode
    const brickTitle = row.BrickTitle
    const brickDef = row.BrickDefinition_Includes || ''
    
    if (segmentCode && segmentTitle && !segments.has(segmentCode)) {
      segments.set(segmentCode, { id: createId(segmentTitle), code: segmentCode, name: segmentTitle })
    }
    
    if (familyCode && familyTitle && !families.has(familyCode)) {
      families.set(familyCode, { id: createId(familyTitle), code: familyCode, name: familyTitle, segmentCode })
    }
    
    if (classCode && classTitle && !classes.has(classCode)) {
      classes.set(classCode, { id: createId(classTitle), code: classCode, name: classTitle, familyCode })
    }
    
    if (brickCode && brickTitle && !bricks.has(brickCode)) {
      bricks.set(brickCode, { id: createId(brickTitle), code: brickCode, name: brickTitle, description: brickDef, classCode })
    }
  }
  
  // Write files
  const segmentsTsv = ['id\tcode\tname\n', ...Array.from(segments.values()).map(s => `${s.id}\t${s.code}\t${s.name}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'GS1.Segments.tsv'), segmentsTsv)
  console.log(`  ✓ GS1.Segments.tsv (${segments.size} segments)`)
  
  const familiesTsv = ['id\tcode\tname\tsegmentCode\n', ...Array.from(families.values()).map(f => `${f.id}\t${f.code}\t${f.name}\t${f.segmentCode}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'GS1.Families.tsv'), familiesTsv)
  console.log(`  ✓ GS1.Families.tsv (${families.size} families)`)
  
  const classesTsv = ['id\tcode\tname\tfamilyCode\n', ...Array.from(classes.values()).map(c => `${c.id}\t${c.code}\t${c.name}\t${c.familyCode}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'GS1.Classes.tsv'), classesTsv)
  console.log(`  ✓ GS1.Classes.tsv (${classes.size} classes)`)
  
  const bricksTsv = ['id\tcode\tname\tdescription\tclassCode\n', ...Array.from(bricks.values()).map(b => `${b.id}\t${b.code}\t${b.name}\t${b.description}\t${b.classCode}`)].join('\n')
  fs.writeFileSync(path.join(outputDir, 'GS1.Bricks.tsv'), bricksTsv)
  console.log(`  ✓ GS1.Bricks.tsv (${bricks.size} bricks)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('STANDARDS HIERARCHY GENERATION')
  console.log('='.repeat(100))
  
  await generateUNSPSC()
  await generateNAPCS()
  await generateGS1()
  
  console.log('\n' + '='.repeat(100))
  console.log('✅ All standards hierarchies generated!')
  console.log('='.repeat(100))
}

main().catch(console.error)
