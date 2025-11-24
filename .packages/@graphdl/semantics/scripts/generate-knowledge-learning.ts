#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate Knowledge/Learning domain files and relationships:
 * - Skills.tsv (from ONET.Skill.tsv with semantic expansion)
 * - Knowledge.tsv (from ONET.Knowledge.tsv with semantic expansion)
 * - Education.tsv (education levels)
 * - Courses.tsv (course types and examples)
 * - Datasets.tsv (dataset examples)
 *
 * And relationship files:
 * - Skills.Occupations.tsv
 * - Knowledge.Occupations.tsv
 * - Skills.Tools.tsv
 * - Education.Courses.tsv
 * - Datasets.Knowledge.tsv
 */

function toEntityTypes(text: string): string[] {
  // Remove parentheticals and version numbers
  let cleaned = text.replace(/\s*\([^)]*\)/g, '').trim()
  cleaned = cleaned.replace(/\s+v?\d+(\.\d+)*\s*$/i, '').trim()

  // Check for slash-separated alternatives
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/').map(p => p.trim()).filter(p => p)
    if (parts.length > 1) {
      return parts.flatMap(part => toEntityTypes(part))
    }
  }

  // Check for " and " or " or " conjunctions
  const conjMatch = cleaned.match(/^(.+?)\s+(and|or)\s+(.+)$/i)
  if (conjMatch) {
    const [, left, conj, right] = conjMatch
    const leftEntities = toEntityTypes(left.trim())
    const rightEntities = toEntityTypes(right.trim())
    return [...leftEntities, ...rightEntities]
  }

  // Convert to PascalCase
  return [toPascalCase(cleaned)]
}

function toPascalCase(text: string): string {
  // Filter out articles, conjunctions, prepositions
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
  const prepositions = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower) && !prepositions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

async function generateSkills() {
  console.log('\n🎯 Generating Skills.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read ONET.Skill.tsv
  const onetSkillPath = path.join(dataDir, 'ONET.Skill.tsv')
  const content = fs.readFileSync(onetSkillPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')

  const expandedSkills: Array<{
    id: string
    name: string
    description: string
    code: string
    category: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const originalId = cols[idIdx]
    const name = cols[nameIdx]
    const description = cols[descIdx] || name
    const code = cols[codeIdx] || ''

    if (!name) continue

    // Determine category from code prefix
    let category = 'General'
    if (code.startsWith('2.A.1')) {
      category = 'Basic Skills'
    } else if (code.startsWith('2.A.2')) {
      category = 'Cross-Functional Skills'
    } else if (code.startsWith('2.B.1')) {
      category = 'Social Skills'
    } else if (code.startsWith('2.B.2')) {
      category = 'Complex Problem Solving'
    } else if (code.startsWith('2.B.3')) {
      category = 'Technical Skills'
    } else if (code.startsWith('2.B.4')) {
      category = 'Systems Skills'
    } else if (code.startsWith('2.B.5')) {
      category = 'Resource Management Skills'
    }

    // Expand the skill name into entity types
    const entityTypes = toEntityTypes(name)

    for (const entityType of entityTypes) {
      if (!seen.has(entityType)) {
        seen.add(entityType)
        expandedSkills.push({
          id: entityType,
          name: name,
          description: description,
          code: code,
          category: category
        })
      }
    }
  }

  // Sort by id
  expandedSkills.sort((a, b) => a.id.localeCompare(b.id))

  // Write Skills.tsv
  const skillsPath = path.join(dataDir, 'Skills.tsv')
  const skillsHeaders = ['id', 'name', 'description', 'code', 'category']
  const skillsRows = expandedSkills.map(s =>
    `${s.id}\t${s.name}\t${s.description}\t${s.code}\t${s.category}`
  )

  fs.writeFileSync(skillsPath, skillsHeaders.join('\t') + '\n' + skillsRows.join('\n'))
  console.log(`  ✓ Skills.tsv (${expandedSkills.length} skills from ${lines.length - 1} ONET skills)`)

  return expandedSkills
}

async function generateKnowledge() {
  console.log('\n📚 Generating Knowledge.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read ONET.Knowledge.tsv
  const onetKnowledgePath = path.join(dataDir, 'ONET.Knowledge.tsv')
  const content = fs.readFileSync(onetKnowledgePath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')

  const expandedKnowledge: Array<{
    id: string
    name: string
    description: string
    code: string
    domain: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const originalId = cols[idIdx]
    const name = cols[nameIdx]
    const description = cols[descIdx] || name
    const code = cols[codeIdx] || ''

    if (!name) continue

    // Determine domain from code prefix
    let domain = 'General'
    if (code.startsWith('2.C.1')) {
      domain = 'Business'
    } else if (code.startsWith('2.C.2')) {
      domain = 'Manufacturing'
    } else if (code.startsWith('2.C.3')) {
      domain = 'Engineering & Technology'
    } else if (code.startsWith('2.C.4')) {
      domain = 'Arts & Sciences'
    } else if (code.startsWith('2.C.5')) {
      domain = 'Health Services'
    } else if (code.startsWith('2.C.6')) {
      domain = 'Education & Training'
    } else if (code.startsWith('2.C.7')) {
      domain = 'Arts & Humanities'
    } else if (code.startsWith('2.C.8')) {
      domain = 'Law & Public Safety'
    } else if (code.startsWith('2.C.9')) {
      domain = 'Communications'
    } else if (code.startsWith('2.C.10')) {
      domain = 'Transportation'
    }

    // Expand the knowledge area into entity types
    const entityTypes = toEntityTypes(name)

    for (const entityType of entityTypes) {
      if (!seen.has(entityType)) {
        seen.add(entityType)
        expandedKnowledge.push({
          id: entityType,
          name: name,
          description: description,
          code: code,
          domain: domain
        })
      }
    }
  }

  // Sort by id
  expandedKnowledge.sort((a, b) => a.id.localeCompare(b.id))

  // Write Knowledge.tsv
  const knowledgePath = path.join(dataDir, 'Knowledge.tsv')
  const knowledgeHeaders = ['id', 'name', 'description', 'code', 'domain']
  const knowledgeRows = expandedKnowledge.map(k =>
    `${k.id}\t${k.name}\t${k.description}\t${k.code}\t${k.domain}`
  )

  fs.writeFileSync(knowledgePath, knowledgeHeaders.join('\t') + '\n' + knowledgeRows.join('\n'))
  console.log(`  ✓ Knowledge.tsv (${expandedKnowledge.length} knowledge areas from ${lines.length - 1} ONET knowledge areas)`)

  return expandedKnowledge
}

async function generateEducation() {
  console.log('\n🎓 Generating Education.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Common education levels based on standard classifications
  const educationLevels = [
    {
      id: 'LessThanHighSchool',
      name: 'Less than High School',
      description: 'Education level below high school diploma or equivalent',
      level: 1,
      years: '0-11'
    },
    {
      id: 'HighSchoolDiploma',
      name: 'High School Diploma',
      description: 'High school diploma or equivalent (GED)',
      level: 2,
      years: '12'
    },
    {
      id: 'SomeCollege',
      name: 'Some College',
      description: 'Some college coursework completed, no degree',
      level: 3,
      years: '13-15'
    },
    {
      id: 'AssociateDegree',
      name: 'Associate Degree',
      description: 'Two-year college degree (AA, AS, AAS)',
      level: 4,
      years: '14'
    },
    {
      id: 'BachelorDegree',
      name: 'Bachelor Degree',
      description: 'Four-year college degree (BA, BS)',
      level: 5,
      years: '16'
    },
    {
      id: 'PostBaccalaureate',
      name: 'Post-Baccalaureate Certificate',
      description: 'Certificate program requiring a bachelor\'s degree',
      level: 6,
      years: '17'
    },
    {
      id: 'MasterDegree',
      name: 'Master Degree',
      description: 'Graduate degree (MA, MS, MBA, MFA)',
      level: 7,
      years: '18'
    },
    {
      id: 'PostMaster',
      name: 'Post-Master Certificate',
      description: 'Certificate program requiring a master\'s degree',
      level: 8,
      years: '19'
    },
    {
      id: 'FirstProfessionalDegree',
      name: 'First Professional Degree',
      description: 'Professional degree (MD, JD, DDS, DVM)',
      level: 9,
      years: '20+'
    },
    {
      id: 'DoctoralDegree',
      name: 'Doctoral Degree',
      description: 'Highest academic degree (PhD, EdD)',
      level: 10,
      years: '20+'
    }
  ]

  // Write Education.tsv
  const educationPath = path.join(dataDir, 'Education.tsv')
  const educationHeaders = ['id', 'name', 'description', 'level', 'years']
  const educationRows = educationLevels.map(e =>
    `${e.id}\t${e.name}\t${e.description}\t${e.level}\t${e.years}`
  )

  fs.writeFileSync(educationPath, educationHeaders.join('\t') + '\n' + educationRows.join('\n'))
  console.log(`  ✓ Education.tsv (${educationLevels.length} education levels)`)

  return educationLevels
}

async function generateCourses() {
  console.log('\n📖 Generating Courses.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Example course types across different domains
  const courses = [
    // Computer Science & Technology
    { id: 'IntroductionComputerScience', name: 'Introduction to Computer Science', domain: 'Technology', level: 'Undergraduate' },
    { id: 'DataStructuresAlgorithms', name: 'Data Structures and Algorithms', domain: 'Technology', level: 'Undergraduate' },
    { id: 'DatabaseSystems', name: 'Database Systems', domain: 'Technology', level: 'Undergraduate' },
    { id: 'WebDevelopment', name: 'Web Development', domain: 'Technology', level: 'Undergraduate' },
    { id: 'MachineLearning', name: 'Machine Learning', domain: 'Technology', level: 'Graduate' },
    { id: 'ArtificialIntelligence', name: 'Artificial Intelligence', domain: 'Technology', level: 'Graduate' },
    { id: 'CloudComputing', name: 'Cloud Computing', domain: 'Technology', level: 'Professional' },
    { id: 'Cybersecurity', name: 'Cybersecurity', domain: 'Technology', level: 'Professional' },

    // Business & Management
    { id: 'PrinciplesManagement', name: 'Principles of Management', domain: 'Business', level: 'Undergraduate' },
    { id: 'MarketingFundamentals', name: 'Marketing Fundamentals', domain: 'Business', level: 'Undergraduate' },
    { id: 'FinancialAccounting', name: 'Financial Accounting', domain: 'Business', level: 'Undergraduate' },
    { id: 'BusinessStrategy', name: 'Business Strategy', domain: 'Business', level: 'Graduate' },
    { id: 'OrganizationalBehavior', name: 'Organizational Behavior', domain: 'Business', level: 'Graduate' },
    { id: 'ProjectManagement', name: 'Project Management', domain: 'Business', level: 'Professional' },

    // Engineering
    { id: 'EngineeringMechanics', name: 'Engineering Mechanics', domain: 'Engineering', level: 'Undergraduate' },
    { id: 'CircuitAnalysis', name: 'Circuit Analysis', domain: 'Engineering', level: 'Undergraduate' },
    { id: 'Thermodynamics', name: 'Thermodynamics', domain: 'Engineering', level: 'Undergraduate' },
    { id: 'SystemsEngineering', name: 'Systems Engineering', domain: 'Engineering', level: 'Graduate' },

    // Healthcare
    { id: 'AnatomyPhysiology', name: 'Anatomy and Physiology', domain: 'Healthcare', level: 'Undergraduate' },
    { id: 'Pharmacology', name: 'Pharmacology', domain: 'Healthcare', level: 'Graduate' },
    { id: 'ClinicalPractice', name: 'Clinical Practice', domain: 'Healthcare', level: 'Professional' },
    { id: 'HealthcareManagement', name: 'Healthcare Management', domain: 'Healthcare', level: 'Graduate' },

    // Science
    { id: 'GeneralChemistry', name: 'General Chemistry', domain: 'Science', level: 'Undergraduate' },
    { id: 'GeneralBiology', name: 'General Biology', domain: 'Science', level: 'Undergraduate' },
    { id: 'Calculus', name: 'Calculus', domain: 'Science', level: 'Undergraduate' },
    { id: 'Statistics', name: 'Statistics', domain: 'Science', level: 'Undergraduate' },

    // Arts & Humanities
    { id: 'CreativeWriting', name: 'Creative Writing', domain: 'Arts', level: 'Undergraduate' },
    { id: 'ArtHistory', name: 'Art History', domain: 'Arts', level: 'Undergraduate' },
    { id: 'Philosophy', name: 'Philosophy', domain: 'Humanities', level: 'Undergraduate' },
    { id: 'WorldHistory', name: 'World History', domain: 'Humanities', level: 'Undergraduate' },

    // Education
    { id: 'EducationalPsychology', name: 'Educational Psychology', domain: 'Education', level: 'Graduate' },
    { id: 'CurriculumDesign', name: 'Curriculum Design', domain: 'Education', level: 'Graduate' },
    { id: 'TeachingMethods', name: 'Teaching Methods', domain: 'Education', level: 'Professional' }
  ]

  courses.sort((a, b) => a.id.localeCompare(b.id))

  // Write Courses.tsv
  const coursesPath = path.join(dataDir, 'Courses.tsv')
  const coursesHeaders = ['id', 'name', 'domain', 'level']
  const coursesRows = courses.map(c =>
    `${c.id}\t${c.name}\t${c.domain}\t${c.level}`
  )

  fs.writeFileSync(coursesPath, coursesHeaders.join('\t') + '\n' + coursesRows.join('\n'))
  console.log(`  ✓ Courses.tsv (${courses.length} course types)`)

  return courses
}

async function generateDatasets() {
  console.log('\n💾 Generating Datasets.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Example datasets across different domains
  const datasets = [
    // Machine Learning / AI
    { id: 'ImageNet', name: 'ImageNet', domain: 'ComputerVision', type: 'Image Classification', size: 'Large' },
    { id: 'MNIST', name: 'MNIST', domain: 'ComputerVision', type: 'Handwritten Digits', size: 'Medium' },
    { id: 'CIFAR10', name: 'CIFAR-10', domain: 'ComputerVision', type: 'Image Classification', size: 'Medium' },
    { id: 'COCO', name: 'MS COCO', domain: 'ComputerVision', type: 'Object Detection', size: 'Large' },

    // Natural Language Processing
    { id: 'WikipediaCorpus', name: 'Wikipedia Corpus', domain: 'NaturalLanguageProcessing', type: 'Text Corpus', size: 'Large' },
    { id: 'CommonCrawl', name: 'Common Crawl', domain: 'NaturalLanguageProcessing', type: 'Web Text', size: 'Massive' },
    { id: 'GLUE', name: 'GLUE Benchmark', domain: 'NaturalLanguageProcessing', type: 'Language Understanding', size: 'Medium' },
    { id: 'SQuAD', name: 'SQuAD', domain: 'NaturalLanguageProcessing', type: 'Question Answering', size: 'Medium' },

    // Speech & Audio
    { id: 'LibriSpeech', name: 'LibriSpeech', domain: 'SpeechRecognition', type: 'Audio Books', size: 'Large' },
    { id: 'AudioSet', name: 'AudioSet', domain: 'AudioClassification', type: 'Sound Events', size: 'Large' },

    // Healthcare / Biology
    { id: 'MIMIC', name: 'MIMIC-III', domain: 'Healthcare', type: 'Clinical Data', size: 'Large' },
    { id: 'GenBank', name: 'GenBank', domain: 'Genomics', type: 'DNA Sequences', size: 'Massive' },
    { id: 'ProteinDataBank', name: 'Protein Data Bank', domain: 'Biochemistry', type: 'Protein Structures', size: 'Large' },

    // Social Sciences
    { id: 'WorldBank', name: 'World Bank Open Data', domain: 'Economics', type: 'Economic Indicators', size: 'Large' },
    { id: 'CensusData', name: 'US Census Data', domain: 'Demographics', type: 'Population Data', size: 'Large' },

    // Climate & Environment
    { id: 'NOAA', name: 'NOAA Climate Data', domain: 'Climate', type: 'Weather Data', size: 'Massive' },
    { id: 'EarthObservation', name: 'Earth Observation Data', domain: 'Environment', type: 'Satellite Imagery', size: 'Massive' },

    // Business & Finance
    { id: 'YahooFinance', name: 'Yahoo Finance', domain: 'Finance', type: 'Stock Market Data', size: 'Large' },
    { id: 'Kaggle', name: 'Kaggle Datasets', domain: 'General', type: 'Various', size: 'Various' },

    // Transportation
    { id: 'OpenStreetMap', name: 'OpenStreetMap', domain: 'Geography', type: 'Geographic Data', size: 'Massive' },
    { id: 'NYCTaxi', name: 'NYC Taxi Data', domain: 'Transportation', type: 'Trip Records', size: 'Large' },

    // Government
    { id: 'DataGov', name: 'Data.gov', domain: 'Government', type: 'Public Data', size: 'Massive' },
    { id: 'OpenDataPortal', name: 'Open Data Portal', domain: 'Government', type: 'Various', size: 'Large' }
  ]

  datasets.sort((a, b) => a.id.localeCompare(b.id))

  // Write Datasets.tsv
  const datasetsPath = path.join(dataDir, 'Datasets.tsv')
  const datasetsHeaders = ['id', 'name', 'domain', 'type', 'size']
  const datasetsRows = datasets.map(d =>
    `${d.id}\t${d.name}\t${d.domain}\t${d.type}\t${d.size}`
  )

  fs.writeFileSync(datasetsPath, datasetsHeaders.join('\t') + '\n' + datasetsRows.join('\n'))
  console.log(`  ✓ Datasets.tsv (${datasets.length} datasets)`)

  return datasets
}

async function generateSkillsOccupationsRelationships() {
  console.log('\n🔗 Generating Skills.Occupations.tsv relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read ONET.Occupation.Relationships.tsv and filter for skills
  const onetRelPath = path.join(dataDir, 'ONET.Occupation.Relationships.tsv')
  const content = fs.readFileSync(onetRelPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const fromIdx = headers.indexOf('from')
  const predicateIdx = headers.indexOf('predicate')
  const toIdx = headers.indexOf('to')

  const relationships: Array<{
    skill: string
    occupation: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const predicate = cols[predicateIdx]

    if (predicate === 'requiresSkill') {
      const from = cols[fromIdx]
      const to = cols[toIdx]

      // Extract IDs from URLs
      const occupationMatch = from.match(/\/Occupation\/([^\/\s]+)/)
      const skillMatch = to.match(/\/Skill\/([^\/\s]+)/)

      if (occupationMatch && skillMatch) {
        const occupation = occupationMatch[1]
        const skill = skillMatch[1]
        const key = `${skill}\t${occupation}`

        if (!seen.has(key)) {
          seen.add(key)
          relationships.push({ skill, occupation })
        }
      }
    }
  }

  relationships.sort((a, b) => {
    const skillCmp = a.skill.localeCompare(b.skill)
    return skillCmp !== 0 ? skillCmp : a.occupation.localeCompare(b.occupation)
  })

  // Write Skills.Occupations.tsv
  const relPath = path.join(dataDir, 'Skills.Occupations.tsv')
  const relHeaders = ['skill', 'occupation']
  const relRows = relationships.map(r => `${r.skill}\t${r.occupation}`)

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Skills.Occupations.tsv (${relationships.length} relationships)`)

  return relationships
}

async function generateKnowledgeOccupationsRelationships() {
  console.log('\n🔗 Generating Knowledge.Occupations.tsv relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read ONET.Occupation.Relationships.tsv and filter for knowledge
  const onetRelPath = path.join(dataDir, 'ONET.Occupation.Relationships.tsv')
  const content = fs.readFileSync(onetRelPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const fromIdx = headers.indexOf('from')
  const predicateIdx = headers.indexOf('predicate')
  const toIdx = headers.indexOf('to')

  const relationships: Array<{
    knowledge: string
    occupation: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const predicate = cols[predicateIdx]

    if (predicate === 'requiresKnowledge') {
      const from = cols[fromIdx]
      const to = cols[toIdx]

      // Extract IDs from URLs
      const occupationMatch = from.match(/\/Occupation\/([^\/\s]+)/)
      const knowledgeMatch = to.match(/\/Knowledge\/([^\/\s]+)/)

      if (occupationMatch && knowledgeMatch) {
        const occupation = occupationMatch[1]
        const knowledge = knowledgeMatch[1]
        const key = `${knowledge}\t${occupation}`

        if (!seen.has(key)) {
          seen.add(key)
          relationships.push({ knowledge, occupation })
        }
      }
    }
  }

  relationships.sort((a, b) => {
    const knowledgeCmp = a.knowledge.localeCompare(b.knowledge)
    return knowledgeCmp !== 0 ? knowledgeCmp : a.occupation.localeCompare(b.occupation)
  })

  // Write Knowledge.Occupations.tsv
  const relPath = path.join(dataDir, 'Knowledge.Occupations.tsv')
  const relHeaders = ['knowledge', 'occupation']
  const relRows = relationships.map(r => `${r.knowledge}\t${r.occupation}`)

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Knowledge.Occupations.tsv (${relationships.length} relationships)`)

  return relationships
}

async function generateSkillsToolsRelationships() {
  console.log('\n🔗 Generating Skills.Tools.tsv relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Create meaningful relationships between skills and tools
  // Based on common skill-tool associations
  const relationships = [
    // Programming skill with various tools
    { skill: 'Programming', tool: 'Python' },
    { skill: 'Programming', tool: 'Java' },
    { skill: 'Programming', tool: 'JavaScript' },
    { skill: 'Programming', tool: 'Cpp' },

    // Writing skills with tools
    { skill: 'Writing', tool: 'MicrosoftWord' },
    { skill: 'Writing', tool: 'GoogleDocs' },

    // Design skills
    { skill: 'TechnologyDesign', tool: 'CAD' },
    { skill: 'TechnologyDesign', tool: 'AutoCAD' },

    // Data analysis
    { skill: 'Mathematics', tool: 'Excel' },
    { skill: 'Mathematics', tool: 'MATLAB' },
    { skill: 'Mathematics', tool: 'Python' },

    // Quality control
    { skill: 'QualityControlAnalysis', tool: 'Microscopes' },
    { skill: 'QualityControlAnalysis', tool: 'TestEquipment' },

    // Operations
    { skill: 'OperationsMonitoring', tool: 'ComputerizedControlSystems' },
    { skill: 'OperationControl', tool: 'IndustrialControlSoftware' },

    // Equipment-related skills
    { skill: 'EquipmentMaintenance', tool: 'Multimeters' },
    { skill: 'EquipmentSelection', tool: 'Specifications' },
    { skill: 'Installation', tool: 'HandTools' },
    { skill: 'Troubleshooting', tool: 'DiagnosticEquipment' },
    { skill: 'Repairing', tool: 'RepairTools' },

    // Systems skills
    { skill: 'SystemsAnalysis', tool: 'SystemModelingSoftware' },
    { skill: 'SystemsEvaluation', tool: 'PerformanceMonitoringTools' },

    // Communication skills
    { skill: 'Speaking', tool: 'PresentationSoftware' },
    { skill: 'ActiveListening', tool: 'RecordingEquipment' },

    // Financial management
    { skill: 'ManagementFinancialResources', tool: 'AccountingSoftware' },
    { skill: 'ManagementFinancialResources', tool: 'QuickBooks' }
  ]

  relationships.sort((a, b) => {
    const skillCmp = a.skill.localeCompare(b.skill)
    return skillCmp !== 0 ? skillCmp : a.tool.localeCompare(b.tool)
  })

  // Write Skills.Tools.tsv
  const relPath = path.join(dataDir, 'Skills.Tools.tsv')
  const relHeaders = ['skill', 'tool']
  const relRows = relationships.map(r => `${r.skill}\t${r.tool}`)

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Skills.Tools.tsv (${relationships.length} relationships)`)

  return relationships
}

async function generateEducationCoursesRelationships() {
  console.log('\n🔗 Generating Education.Courses.tsv relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Map courses to education levels
  const relationships = [
    // Undergraduate level courses
    { education: 'BachelorDegree', course: 'IntroductionComputerScience' },
    { education: 'BachelorDegree', course: 'DataStructuresAlgorithms' },
    { education: 'BachelorDegree', course: 'DatabaseSystems' },
    { education: 'BachelorDegree', course: 'WebDevelopment' },
    { education: 'BachelorDegree', course: 'PrinciplesManagement' },
    { education: 'BachelorDegree', course: 'MarketingFundamentals' },
    { education: 'BachelorDegree', course: 'FinancialAccounting' },
    { education: 'BachelorDegree', course: 'EngineeringMechanics' },
    { education: 'BachelorDegree', course: 'CircuitAnalysis' },
    { education: 'BachelorDegree', course: 'Thermodynamics' },
    { education: 'BachelorDegree', course: 'AnatomyPhysiology' },
    { education: 'BachelorDegree', course: 'GeneralChemistry' },
    { education: 'BachelorDegree', course: 'GeneralBiology' },
    { education: 'BachelorDegree', course: 'Calculus' },
    { education: 'BachelorDegree', course: 'Statistics' },
    { education: 'BachelorDegree', course: 'CreativeWriting' },
    { education: 'BachelorDegree', course: 'ArtHistory' },
    { education: 'BachelorDegree', course: 'Philosophy' },
    { education: 'BachelorDegree', course: 'WorldHistory' },

    // Associate degree courses
    { education: 'AssociateDegree', course: 'IntroductionComputerScience' },
    { education: 'AssociateDegree', course: 'WebDevelopment' },
    { education: 'AssociateDegree', course: 'PrinciplesManagement' },
    { education: 'AssociateDegree', course: 'FinancialAccounting' },

    // Graduate level courses
    { education: 'MasterDegree', course: 'MachineLearning' },
    { education: 'MasterDegree', course: 'ArtificialIntelligence' },
    { education: 'MasterDegree', course: 'BusinessStrategy' },
    { education: 'MasterDegree', course: 'OrganizationalBehavior' },
    { education: 'MasterDegree', course: 'SystemsEngineering' },
    { education: 'MasterDegree', course: 'Pharmacology' },
    { education: 'MasterDegree', course: 'HealthcareManagement' },
    { education: 'MasterDegree', course: 'EducationalPsychology' },
    { education: 'MasterDegree', course: 'CurriculumDesign' },

    // Professional certifications
    { education: 'PostBaccalaureate', course: 'CloudComputing' },
    { education: 'PostBaccalaureate', course: 'Cybersecurity' },
    { education: 'PostBaccalaureate', course: 'ProjectManagement' },
    { education: 'PostBaccalaureate', course: 'ClinicalPractice' },
    { education: 'PostBaccalaureate', course: 'TeachingMethods' }
  ]

  relationships.sort((a, b) => {
    const eduCmp = a.education.localeCompare(b.education)
    return eduCmp !== 0 ? eduCmp : a.course.localeCompare(b.course)
  })

  // Write Education.Courses.tsv
  const relPath = path.join(dataDir, 'Education.Courses.tsv')
  const relHeaders = ['education', 'course']
  const relRows = relationships.map(r => `${r.education}\t${r.course}`)

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Education.Courses.tsv (${relationships.length} relationships)`)

  return relationships
}

async function generateDatasetsKnowledgeRelationships() {
  console.log('\n🔗 Generating Datasets.Knowledge.tsv relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Map datasets to knowledge domains
  const relationships = [
    // Computer Vision datasets
    { dataset: 'ImageNet', knowledge: 'Computers_Electronics' },
    { dataset: 'MNIST', knowledge: 'Computers_Electronics' },
    { dataset: 'MNIST', knowledge: 'Mathematics' },
    { dataset: 'CIFAR10', knowledge: 'Computers_Electronics' },
    { dataset: 'COCO', knowledge: 'Computers_Electronics' },

    // NLP datasets
    { dataset: 'WikipediaCorpus', knowledge: 'English_Language' },
    { dataset: 'WikipediaCorpus', knowledge: 'Communications_Media' },
    { dataset: 'CommonCrawl', knowledge: 'English_Language' },
    { dataset: 'CommonCrawl', knowledge: 'Communications_Media' },
    { dataset: 'GLUE', knowledge: 'English_Language' },
    { dataset: 'SQuAD', knowledge: 'English_Language' },

    // Speech datasets
    { dataset: 'LibriSpeech', knowledge: 'English_Language' },
    { dataset: 'LibriSpeech', knowledge: 'Computers_Electronics' },
    { dataset: 'AudioSet', knowledge: 'Computers_Electronics' },

    // Healthcare datasets
    { dataset: 'MIMIC', knowledge: 'Medicine_Dentistry' },
    { dataset: 'MIMIC', knowledge: 'Computers_Electronics' },
    { dataset: 'GenBank', knowledge: 'Biology' },
    { dataset: 'ProteinDataBank', knowledge: 'Biology' },
    { dataset: 'ProteinDataBank', knowledge: 'Chemistry' },

    // Social science datasets
    { dataset: 'WorldBank', knowledge: 'Economics_Accounting' },
    { dataset: 'CensusData', knowledge: 'Sociology_Anthropology' },
    { dataset: 'CensusData', knowledge: 'Mathematics' },

    // Climate datasets
    { dataset: 'NOAA', knowledge: 'Geography' },
    { dataset: 'NOAA', knowledge: 'Physics' },
    { dataset: 'EarthObservation', knowledge: 'Geography' },

    // Finance datasets
    { dataset: 'YahooFinance', knowledge: 'Economics_Accounting' },
    { dataset: 'YahooFinance', knowledge: 'Mathematics' },

    // Geographic datasets
    { dataset: 'OpenStreetMap', knowledge: 'Geography' },
    { dataset: 'OpenStreetMap', knowledge: 'Computers_Electronics' },
    { dataset: 'NYCTaxi', knowledge: 'Transportation' },
    { dataset: 'NYCTaxi', knowledge: 'Mathematics' },

    // Government datasets
    { dataset: 'DataGov', knowledge: 'Law_Government' },
    { dataset: 'OpenDataPortal', knowledge: 'Law_Government' }
  ]

  relationships.sort((a, b) => {
    const datasetCmp = a.dataset.localeCompare(b.dataset)
    return datasetCmp !== 0 ? datasetCmp : a.knowledge.localeCompare(b.knowledge)
  })

  // Write Datasets.Knowledge.tsv
  const relPath = path.join(dataDir, 'Datasets.Knowledge.tsv')
  const relHeaders = ['dataset', 'knowledge']
  const relRows = relationships.map(r => `${r.dataset}\t${r.knowledge}`)

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Datasets.Knowledge.tsv (${relationships.length} relationships)`)

  return relationships
}

async function main() {
  console.log('='.repeat(100))
  console.log('KNOWLEDGE/LEARNING DOMAIN GENERATION')
  console.log('='.repeat(100))

  // Generate domain files
  const skills = await generateSkills()
  const knowledge = await generateKnowledge()
  const education = await generateEducation()
  const courses = await generateCourses()
  const datasets = await generateDatasets()

  console.log('\n' + '='.repeat(100))
  console.log('RELATIONSHIP GENERATION')
  console.log('='.repeat(100))

  // Generate relationship files
  const skillsOccupations = await generateSkillsOccupationsRelationships()
  const knowledgeOccupations = await generateKnowledgeOccupationsRelationships()
  const skillsTools = await generateSkillsToolsRelationships()
  const educationCourses = await generateEducationCoursesRelationships()
  const datasetsKnowledge = await generateDatasetsKnowledgeRelationships()

  console.log('\n' + '='.repeat(100))
  console.log('✅ SUMMARY')
  console.log('='.repeat(100))
  console.log(`
Domain Files:
  • Skills.tsv: ${skills.length} skills
  • Knowledge.tsv: ${knowledge.length} knowledge areas
  • Education.tsv: ${education.length} education levels
  • Courses.tsv: ${courses.length} courses
  • Datasets.tsv: ${datasets.length} datasets

Relationship Files:
  • Skills.Occupations.tsv: ${skillsOccupations.length} relationships
  • Knowledge.Occupations.tsv: ${knowledgeOccupations.length} relationships
  • Skills.Tools.tsv: ${skillsTools.length} relationships
  • Education.Courses.tsv: ${educationCourses.length} relationships
  • Datasets.Knowledge.tsv: ${datasetsKnowledge.length} relationships
  `)
  console.log('='.repeat(100))
}

main().catch(console.error)
