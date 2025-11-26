#!/usr/bin/env tsx
/**
 * Add Career/Education relationships from existing mapping files
 *
 * Sources:
 * - EducationProgram_CareerCluster_Mappings.tsv
 * - SOC_CareerCluster_Mappings.tsv
 * - SOC_EducationProgram_Mappings.tsv
 *
 * Creates/Updates:
 * - CareerClusters.Relationships.tsv
 * - SubClusters.Relationships.tsv
 * - EducationPrograms.Relationships.tsv
 * - Occupations.Relationships.tsv (appends)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'

interface Relationship {
  ns: string
  from: string
  to: string
  predicate: string
  reverse: string
}

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
    console.warn(`No data to write to ${filePath}`)
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

// Convert kebab-case to PascalCase for IDs
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Convert cluster ID to URL
function clusterIdToUrl(clusterId: string): string {
  const id = toPascalCase(clusterId)
  return `https://education.org/CareerCluster/${id}`
}

// Convert subcluster ID to URL
function subclusterIdToUrl(subclusterId: string): string {
  // Extract the subcluster name (after the /)
  const parts = subclusterId.split('/')
  if (parts.length !== 2) return ''
  const id = toPascalCase(parts[1])
  return `https://education.org/SubCluster/${id}`
}

// Convert education program ID to URL
function educationProgramIdToUrl(programId: string): string {
  const id = toPascalCase(programId)
  return `https://education.org/EducationProgram/${id}`
}

// Convert SOC code to Occupation URL
function socCodeToUrl(socCode: string): string {
  // SOC codes are like "11-1011" - convert to OccupationCode format
  const code = socCode.replace('-', '')
  return `https://onet.org.ai/Occupation/${code}`
}

function main() {
  console.log('🔗 Adding Career/Education relationships...\n')

  // Load SubClusters to build a mapping from code to URL
  console.log('📖 Loading SubClusters for ID mapping...')
  const subClustersPath = resolve(DATA_DIR, 'SubClusters.tsv')
  const subClustersContent = readFileSync(subClustersPath, 'utf-8')
  const subClusters = parseTSV(subClustersContent)

  // Create mapping from code (e.g., "agriculture/animal-systems") to URL
  const subClusterCodeToUrl = new Map<string, string>()
  for (const subCluster of subClusters) {
    if (subCluster.code && subCluster.url) {
      subClusterCodeToUrl.set(subCluster.code, subCluster.url)
    }
  }
  console.log(`  ✅ Loaded ${subClusterCodeToUrl.size} SubCluster mappings\n`)

  // Track all relationships by entity type
  const careerClusterRels: Relationship[] = []
  const subClusterRels: Relationship[] = []
  const educationProgramRels: Relationship[] = []
  const occupationRels: Relationship[] = []

  // Add SubCluster → CareerCluster relationships
  console.log('🔗 Creating SubCluster → CareerCluster relationships...')
  for (const subCluster of subClusters) {
    if (subCluster.career_cluster_id && subCluster.url) {
      const clusterUrl = clusterIdToUrl(subCluster.career_cluster_id)
      if (clusterUrl) {
        subClusterRels.push({
          ns: 'education.org.ai',
          from: subCluster.url,
          to: clusterUrl,
          predicate: 'partOf',
          reverse: 'hasPart'
        })

        careerClusterRels.push({
          ns: 'education.org.ai',
          from: clusterUrl,
          to: subCluster.url,
          predicate: 'hasPart',
          reverse: 'partOf'
        })
      }
    }
  }
  console.log(`  ✅ Created ${subClusters.length} SubCluster→CareerCluster relationships\n`)

  // Process EducationProgram_CareerCluster_Mappings.tsv
  console.log('📚 Processing EducationProgram_CareerCluster_Mappings.tsv...')
  const eduClusterPath = resolve(DATA_DIR, 'EducationProgram_CareerCluster_Mappings.tsv')
  const eduClusterContent = readFileSync(eduClusterPath, 'utf-8')
  const eduClusterMappings = parseTSV(eduClusterContent)

  for (const mapping of eduClusterMappings) {
    const programId = mapping.education_program_id
    const clusterId = mapping.career_cluster_id
    const subclusterId = mapping.subcluster_id

    if (!programId || !clusterId) continue

    const programUrl = educationProgramIdToUrl(programId)
    const clusterUrl = clusterIdToUrl(clusterId)

    if (!programUrl || !clusterUrl) continue

    // EducationProgram ↔ CareerCluster
    educationProgramRels.push({
      ns: 'education.org.ai',
      from: programUrl,
      to: clusterUrl,
      predicate: 'prepares',
      reverse: 'preparedBy'
    })

    careerClusterRels.push({
      ns: 'education.org.ai',
      from: clusterUrl,
      to: programUrl,
      predicate: 'preparedBy',
      reverse: 'prepares'
    })

    // EducationProgram ↔ SubCluster (if available)
    if (subclusterId) {
      const subclusterUrl = subClusterCodeToUrl.get(subclusterId)
      if (subclusterUrl) {
        educationProgramRels.push({
          ns: 'education.org.ai',
          from: programUrl,
          to: subclusterUrl,
          predicate: 'specializes',
          reverse: 'specializedBy'
        })

        subClusterRels.push({
          ns: 'education.org.ai',
          from: subclusterUrl,
          to: programUrl,
          predicate: 'specializedBy',
          reverse: 'specializes'
        })
      }
    }
  }

  console.log(`  ✅ Created ${educationProgramRels.length} EducationProgram relationships`)
  console.log(`  ✅ Created ${careerClusterRels.length} CareerCluster relationships`)
  console.log(`  ✅ Created ${subClusterRels.length} SubCluster relationships`)

  // Process SOC_CareerCluster_Mappings.tsv
  console.log('\n👔 Processing SOC_CareerCluster_Mappings.tsv...')
  const socClusterPath = resolve(DATA_DIR, 'SOC_CareerCluster_Mappings.tsv')
  const socClusterContent = readFileSync(socClusterPath, 'utf-8')
  const socClusterMappings = parseTSV(socClusterContent)

  let socClusterCount = 0
  let socSubclusterCount = 0

  for (const mapping of socClusterMappings) {
    const socCode = mapping.soc_code
    const clusterId = mapping.career_cluster_id
    const subclusterId = mapping.subcluster_id

    if (!socCode || !clusterId) continue

    const occupationUrl = socCodeToUrl(socCode)
    const clusterUrl = clusterIdToUrl(clusterId)

    if (!occupationUrl || !clusterUrl) continue

    // Occupation ↔ CareerCluster
    occupationRels.push({
      ns: 'onet.org.ai',
      from: occupationUrl,
      to: clusterUrl,
      predicate: 'alignsWith',
      reverse: 'alignedWith'
    })

    careerClusterRels.push({
      ns: 'education.org.ai',
      from: clusterUrl,
      to: occupationUrl,
      predicate: 'alignedWith',
      reverse: 'alignsWith'
    })

    socClusterCount++

    // Occupation ↔ SubCluster (if available)
    if (subclusterId) {
      const subclusterUrl = subClusterCodeToUrl.get(subclusterId)
      if (subclusterUrl) {
        occupationRels.push({
          ns: 'onet.org.ai',
          from: occupationUrl,
          to: subclusterUrl,
          predicate: 'alignsWith',
          reverse: 'alignedWith'
        })

        subClusterRels.push({
          ns: 'education.org.ai',
          from: subclusterUrl,
          to: occupationUrl,
          predicate: 'alignedWith',
          reverse: 'alignsWith'
        })

        socSubclusterCount++
      }
    }
  }

  console.log(`  ✅ Created ${socClusterCount} Occupation→CareerCluster relationships`)
  console.log(`  ✅ Created ${socSubclusterCount} Occupation→SubCluster relationships`)

  // Process SOC_EducationProgram_Mappings.tsv
  console.log('\n🎓 Processing SOC_EducationProgram_Mappings.tsv...')
  const socEduPath = resolve(DATA_DIR, 'SOC_EducationProgram_Mappings.tsv')
  const socEduContent = readFileSync(socEduPath, 'utf-8')
  const socEduMappings = parseTSV(socEduContent)

  let socEduCount = 0

  for (const mapping of socEduMappings) {
    const socCode = mapping.soc_code
    const programId = mapping.education_program_id

    if (!socCode || !programId) continue

    const occupationUrl = socCodeToUrl(socCode)
    const programUrl = educationProgramIdToUrl(programId)

    if (!occupationUrl || !programUrl) continue

    // Occupation ↔ EducationProgram
    occupationRels.push({
      ns: 'onet.org.ai',
      from: occupationUrl,
      to: programUrl,
      predicate: 'requires',
      reverse: 'requiredBy'
    })

    educationProgramRels.push({
      ns: 'education.org.ai',
      from: programUrl,
      to: occupationUrl,
      predicate: 'requiredBy',
      reverse: 'requires'
    })

    socEduCount++
  }

  console.log(`  ✅ Created ${socEduCount} Occupation→EducationProgram relationships`)

  // Write CareerClusters.Relationships.tsv
  console.log('\n📝 Writing relationship files...')
  const careerClustersRelsPath = resolve(DATA_DIR, 'CareerClusters.Relationships.tsv')
  writeTSV(careerClustersRelsPath, careerClusterRels)
  console.log(`  ✅ ${careerClustersRelsPath} (${careerClusterRels.length} relationships)`)

  // Write SubClusters.Relationships.tsv
  const subClustersRelsPath = resolve(DATA_DIR, 'SubClusters.Relationships.tsv')
  writeTSV(subClustersRelsPath, subClusterRels)
  console.log(`  ✅ ${subClustersRelsPath} (${subClusterRels.length} relationships)`)

  // Write EducationPrograms.Relationships.tsv
  const educationProgramsRelsPath = resolve(DATA_DIR, 'EducationPrograms.Relationships.tsv')
  writeTSV(educationProgramsRelsPath, educationProgramRels)
  console.log(`  ✅ ${educationProgramsRelsPath} (${educationProgramRels.length} relationships)`)

  // Append to Occupations.Relationships.tsv
  const occupationsRelsPath = resolve(DATA_DIR, 'Occupations.Relationships.tsv')
  let existingOccupationRels: any[] = []
  try {
    const relsContent = readFileSync(occupationsRelsPath, 'utf-8')
    existingOccupationRels = parseTSV(relsContent)
  } catch (error) {
    console.log('  ⚠️  Occupations.Relationships.tsv not found, will create new file')
  }

  const allOccupationRels = [...existingOccupationRels, ...occupationRels]
  writeTSV(occupationsRelsPath, allOccupationRels)
  console.log(`  ✅ ${occupationsRelsPath} (${existingOccupationRels.length} → ${allOccupationRels.length})`)

  console.log('\n✅ Done!')
  console.log(`   Total new relationships created: ${careerClusterRels.length + subClusterRels.length + educationProgramRels.length + occupationRels.length}`)
}

main()
