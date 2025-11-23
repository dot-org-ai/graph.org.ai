#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Add GLN location hierarchy to GS1 vocabulary
 *
 * GLNs can identify different types of locations at various hierarchical levels:
 * - Legal entities (companies, organizations)
 * - Physical locations (sites, buildings, rooms)
 * - Functional locations (departments, work centers)
 * - Digital locations (servers, endpoints)
 */

interface LocationClass {
  id: string
  label: string
  type: string
  description: string
  source: string
  parentType?: string
  glnFunctionalType: string
}

interface LocationRelationship {
  id: string
  fromType: string
  toType: string
  relationship: string
  description: string
}

async function main() {
  const sourceDir = path.resolve(__dirname, '../.source/GS1')
  const dataDir = path.resolve(__dirname, '../.data')

  console.log('='.repeat(80))
  console.log('ADDING GLN LOCATION HIERARCHY')
  console.log('='.repeat(80))
  console.log()

  // GLN Functional Types (from GS1 GLN Allocation Rules)
  const glnFunctionalTypes = [
    { id: 'PhysicalLocation', label: 'Physical Location', description: 'A physical place where something can be located or where something happens' },
    { id: 'LegalEntity', label: 'Legal Entity', description: 'A person, organization, or department recognized as having legal rights and responsibilities' },
    { id: 'FunctionalEntity', label: 'Functional Entity', description: 'A department, function, or operational unit' },
    { id: 'DigitalLocation', label: 'Digital Location', description: 'A digital or virtual location (server, endpoint, system)' }
  ]

  // Hierarchical location types
  const locationTypes: LocationClass[] = [
    // Legal entities
    {
      id: 'Company',
      label: 'Company',
      type: 'LocationClass',
      description: 'A legal entity operating as a business',
      source: 'GS1 GLN',
      glnFunctionalType: 'LegalEntity'
    },
    {
      id: 'Division',
      label: 'Division',
      type: 'LocationClass',
      description: 'A major subdivision of a company',
      source: 'GS1 GLN',
      parentType: 'Company',
      glnFunctionalType: 'LegalEntity'
    },
    {
      id: 'Department',
      label: 'Department',
      type: 'LocationClass',
      description: 'A functional subdivision within an organization',
      source: 'GS1 GLN',
      parentType: 'Division',
      glnFunctionalType: 'FunctionalEntity'
    },

    // Physical locations - Site level
    {
      id: 'Site',
      label: 'Site',
      type: 'LocationClass',
      description: 'A physical location containing one or more buildings or facilities',
      source: 'GS1 GLN',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Facility',
      label: 'Facility',
      type: 'LocationClass',
      description: 'A building or complex dedicated to a particular purpose',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Warehouse',
      label: 'Warehouse',
      type: 'LocationClass',
      description: 'A storage facility for goods',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'DistributionCenter',
      label: 'Distribution Center',
      type: 'LocationClass',
      description: 'A facility for receiving, storing, and distributing goods',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Store',
      label: 'Store',
      type: 'LocationClass',
      description: 'A retail location where goods are sold',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'ManufacturingPlant',
      label: 'Manufacturing Plant',
      type: 'LocationClass',
      description: 'A facility where products are manufactured',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    },

    // Physical locations - Building level
    {
      id: 'Building',
      label: 'Building',
      type: 'LocationClass',
      description: 'A structure with a roof and walls',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Floor',
      label: 'Floor',
      type: 'LocationClass',
      description: 'A level within a building',
      source: 'GS1 GLN',
      parentType: 'Building',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Room',
      label: 'Room',
      type: 'LocationClass',
      description: 'An enclosed space within a building',
      source: 'GS1 GLN',
      parentType: 'Floor',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Zone',
      label: 'Zone',
      type: 'LocationClass',
      description: 'A designated area within a location',
      source: 'GS1 GLN',
      parentType: 'Floor',
      glnFunctionalType: 'PhysicalLocation'
    },

    // Warehouse-specific locations
    {
      id: 'WarehouseArea',
      label: 'Warehouse Area',
      type: 'LocationClass',
      description: 'A designated area within a warehouse',
      source: 'GS1 GLN',
      parentType: 'Warehouse',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Aisle',
      label: 'Aisle',
      type: 'LocationClass',
      description: 'A passageway between storage locations',
      source: 'GS1 GLN',
      parentType: 'WarehouseArea',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Bay',
      label: 'Bay',
      type: 'LocationClass',
      description: 'A storage section along an aisle',
      source: 'GS1 GLN',
      parentType: 'Aisle',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Shelf',
      label: 'Shelf',
      type: 'LocationClass',
      description: 'A horizontal storage surface',
      source: 'GS1 GLN',
      parentType: 'Bay',
      glnFunctionalType: 'PhysicalLocation'
    },
    {
      id: 'Bin',
      label: 'Bin',
      type: 'LocationClass',
      description: 'A specific storage position',
      source: 'GS1 GLN',
      parentType: 'Shelf',
      glnFunctionalType: 'PhysicalLocation'
    },

    // Functional locations
    {
      id: 'LoadingDock',
      label: 'Loading Dock',
      type: 'LocationClass',
      description: 'A platform for loading and unloading vehicles',
      source: 'GS1 GLN',
      parentType: 'Facility',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'ReceivingArea',
      label: 'Receiving Area',
      type: 'LocationClass',
      description: 'An area designated for receiving goods',
      source: 'GS1 GLN',
      parentType: 'Facility',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'ShippingArea',
      label: 'Shipping Area',
      type: 'LocationClass',
      description: 'An area designated for shipping goods',
      source: 'GS1 GLN',
      parentType: 'Facility',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'StagingArea',
      label: 'Staging Area',
      type: 'LocationClass',
      description: 'A temporary holding area for goods in transit',
      source: 'GS1 GLN',
      parentType: 'Facility',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'PickingArea',
      label: 'Picking Area',
      type: 'LocationClass',
      description: 'An area designated for order picking',
      source: 'GS1 GLN',
      parentType: 'Warehouse',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'PackingStation',
      label: 'Packing Station',
      type: 'LocationClass',
      description: 'A workstation for packing orders',
      source: 'GS1 GLN',
      parentType: 'Facility',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'QualityControlArea',
      label: 'Quality Control Area',
      type: 'LocationClass',
      description: 'An area designated for quality inspection',
      source: 'GS1 GLN',
      parentType: 'Facility',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'ProductionLine',
      label: 'Production Line',
      type: 'LocationClass',
      description: 'A manufacturing line or work cell',
      source: 'GS1 GLN',
      parentType: 'ManufacturingPlant',
      glnFunctionalType: 'FunctionalEntity'
    },
    {
      id: 'WorkCenter',
      label: 'Work Center',
      type: 'LocationClass',
      description: 'A designated work area or station',
      source: 'GS1 GLN',
      parentType: 'ProductionLine',
      glnFunctionalType: 'FunctionalEntity'
    },

    // Digital locations
    {
      id: 'DigitalEndpoint',
      label: 'Digital Endpoint',
      type: 'LocationClass',
      description: 'A digital service endpoint or API',
      source: 'GS1 GLN',
      glnFunctionalType: 'DigitalLocation'
    },
    {
      id: 'Server',
      label: 'Server',
      type: 'LocationClass',
      description: 'A computer server',
      source: 'GS1 GLN',
      glnFunctionalType: 'DigitalLocation'
    },
    {
      id: 'DataCenter',
      label: 'Data Center',
      type: 'LocationClass',
      description: 'A facility housing computer systems',
      source: 'GS1 GLN',
      parentType: 'Site',
      glnFunctionalType: 'PhysicalLocation'
    }
  ]

  // Location relationships (hierarchies)
  const relationships: LocationRelationship[] = []

  for (const locType of locationTypes) {
    if (locType.parentType) {
      relationships.push({
        id: `${locType.id}.isPartOf.${locType.parentType}`,
        fromType: locType.id,
        toType: locType.parentType,
        relationship: 'isPartOf',
        description: `${locType.label} is part of ${locType.parentType}`
      })

      relationships.push({
        id: `${locType.parentType}.contains.${locType.id}`,
        fromType: locType.parentType,
        toType: locType.id,
        relationship: 'contains',
        description: `${locType.parentType} contains ${locType.label}`
      })
    }
  }

  console.log(`Loaded ${glnFunctionalTypes.length} GLN functional types`)
  console.log(`Loaded ${locationTypes.length} location types`)
  console.log(`Generated ${relationships.length} hierarchical relationships`)
  console.log()

  // Location type breakdown
  const byFunctionalType = new Map<string, LocationClass[]>()
  for (const loc of locationTypes) {
    if (!byFunctionalType.has(loc.glnFunctionalType)) {
      byFunctionalType.set(loc.glnFunctionalType, [])
    }
    byFunctionalType.get(loc.glnFunctionalType)!.push(loc)
  }

  console.log('Location types by GLN functional type:')
  for (const [funcType, locs] of byFunctionalType) {
    console.log(`  ${funcType}: ${locs.length} types`)
    console.log(`    ${locs.map(l => l.id).join(', ')}`)
  }
  console.log()

  // Write GLN functional types
  const functionalTypesPath = path.join(sourceDir, 'GS1.GLN.FunctionalTypes.tsv')
  const functionalTypesHeader = 'id\tlabel\tdescription\n'
  const functionalTypesRows = glnFunctionalTypes
    .map(ft => `${ft.id}\t${ft.label}\t${ft.description}`)
    .join('\n')

  fs.writeFileSync(functionalTypesPath, functionalTypesHeader + functionalTypesRows)
  console.log(`  ✓ Wrote ${functionalTypesPath}`)

  // Write location types
  const locationTypesPath = path.join(sourceDir, 'GS1.Location.Types.tsv')
  const locationTypesHeader = 'id\tlabel\ttype\tdescription\tsource\tparentType\tglnFunctionalType\n'
  const locationTypesRows = locationTypes
    .map(lt => `${lt.id}\t${lt.label}\t${lt.type}\t${lt.description}\t${lt.source}\t${lt.parentType || ''}\t${lt.glnFunctionalType}`)
    .join('\n')

  fs.writeFileSync(locationTypesPath, locationTypesHeader + locationTypesRows)
  console.log(`  ✓ Wrote ${locationTypesPath}`)

  // Write location relationships (hierarchy)
  const relationshipsPath = path.join(sourceDir, 'GS1.Location.Relationships.tsv')
  const relationshipsHeader = 'id\tfromType\ttoType\trelationship\tdescription\n'
  const relationshipsRows = relationships
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(r => `${r.id}\t${r.fromType}\t${r.toType}\t${r.relationship}\t${r.description}`)
    .join('\n')

  fs.writeFileSync(relationshipsPath, relationshipsHeader + relationshipsRows)
  console.log(`  ✓ Wrote ${relationshipsPath}`)

  console.log()
  console.log('='.repeat(80))
  console.log('LOCATION HIERARCHY COMPLETE')
  console.log('='.repeat(80))
  console.log(`GLN Functional Types: ${glnFunctionalTypes.length}`)
  console.log(`Location Types: ${locationTypes.length}`)
  console.log(`Hierarchical Relationships: ${relationships.length}`)
  console.log()

  // Example hierarchies
  console.log('Example location hierarchies:')
  console.log()
  console.log('Physical Warehouse Hierarchy:')
  console.log('  Warehouse → WarehouseArea → Aisle → Bay → Shelf → Bin')
  console.log()
  console.log('Building Hierarchy:')
  console.log('  Site → Building → Floor → Room')
  console.log()
  console.log('Legal Entity Hierarchy:')
  console.log('  Company → Division → Department')
  console.log()
  console.log('Manufacturing Hierarchy:')
  console.log('  ManufacturingPlant → ProductionLine → WorkCenter')
  console.log()
}

main().catch(console.error)
