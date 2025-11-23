#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface VocabEntry {
  id: string
  label: string
  type: string
  description: string
  source: string
  verb?: string
  noun?: string
  relatedEvent?: string
}

async function fetchWebVocabulary(): Promise<VocabEntry[]> {
  console.log('Fetching GS1 Web Vocabulary...')
  const entries: VocabEntry[] = []
  
  // GS1 Core Classes
  const coreClasses = [
    // Products and Trade Items
    { id: 'Product', label: 'Product', type: 'Class', description: 'Any item (product or service) upon which there is a need to retrieve pre-defined information', noun: 'Product' },
    { id: 'TradeItem', label: 'Trade Item', type: 'Class', description: 'A product or service that is sold, delivered, or invoiced', noun: 'Item' },
    { id: 'ConsumerProduct', label: 'Consumer Product', type: 'Class', description: 'A product intended for consumer purchase and use', noun: 'Product' },
    { id: 'FoodBeverageTobaccoProduct', label: 'Food Beverage Tobacco Product', type: 'Class', description: 'Products in the food, beverage, or tobacco category', noun: 'Product' },
    { id: 'HealthcareProduct', label: 'Healthcare Product', type: 'Class', description: 'Products used in healthcare settings', noun: 'Product' },
    { id: 'NonFoodProduct', label: 'Non-Food Product', type: 'Class', description: 'Products that are not food, beverage, or tobacco', noun: 'Product' },
    
    // Organizations and Parties
    { id: 'Organization', label: 'Organization', type: 'Class', description: 'A business, government body, department, charity, or institution', noun: 'Organization' },
    { id: 'Brand', label: 'Brand', type: 'Class', description: 'A brand name or trademark', noun: 'Brand' },
    { id: 'Manufacturer', label: 'Manufacturer', type: 'Class', description: 'An organization that produces goods', noun: 'Manufacturer' },
    { id: 'Distributor', label: 'Distributor', type: 'Class', description: 'An organization that distributes goods', noun: 'Distributor' },
    { id: 'Retailer', label: 'Retailer', type: 'Class', description: 'An organization that sells goods to consumers', noun: 'Retailer' },
    
    // Places and Locations
    { id: 'Place', label: 'Place', type: 'Class', description: 'A physical location', noun: 'Place' },
    { id: 'PostalAddress', label: 'Postal Address', type: 'Class', description: 'A physical mailing address', noun: 'Address' },
    { id: 'GeoCoordinates', label: 'Geo Coordinates', type: 'Class', description: 'Geographic coordinates of a location', noun: 'Coordinates' },
    { id: 'Location', label: 'Location', type: 'Class', description: 'A specific place or position', noun: 'Location' },
    
    // Logistics and Packaging
    { id: 'LogisticUnit', label: 'Logistic Unit', type: 'Class', description: 'A unit of packaging used for shipping and handling', noun: 'Unit' },
    { id: 'Package', label: 'Package', type: 'Class', description: 'A container or wrapper for products', noun: 'Package' },
    { id: 'Packaging', label: 'Packaging', type: 'Class', description: 'Materials used to wrap or protect products', noun: 'Packaging' },
    { id: 'PackagingMarkedLabel', label: 'Packaging Marked Label', type: 'Class', description: 'Information marked or labeled on packaging', noun: 'Label' },
    
    // Assets
    { id: 'Asset', label: 'Asset', type: 'Class', description: 'A physical or digital resource of value', noun: 'Asset' },
    { id: 'ReturnableAsset', label: 'Returnable Asset', type: 'Class', description: 'An asset intended to be returned after use', noun: 'Asset' },
    { id: 'Pallet', label: 'Pallet', type: 'Class', description: 'A platform used for transporting goods', noun: 'Pallet' },
    { id: 'Container', label: 'Container', type: 'Class', description: 'A receptacle for holding goods', noun: 'Container' },
    
    // Documents and Certifications
    { id: 'Document', label: 'Document', type: 'Class', description: 'A written, drawn, or recorded matter', noun: 'Document' },
    { id: 'Certificate', label: 'Certificate', type: 'Class', description: 'An official document attesting to a fact', noun: 'Certificate' },
    { id: 'Certification', label: 'Certification', type: 'Class', description: 'A credential or designation earned', noun: 'Certification' },
    { id: 'CertificationRecord', label: 'Certification Record', type: 'Class', description: 'A record of a certification', noun: 'Record' },
    
    // Measurements and Quantities
    { id: 'QuantitativeValue', label: 'Quantitative Value', type: 'Class', description: 'A numerical value with a unit of measurement', noun: 'Value' },
    { id: 'Measurement', label: 'Measurement', type: 'Class', description: 'A measured value', noun: 'Measurement' },
    { id: 'Dimension', label: 'Dimension', type: 'Class', description: 'A measurable extent (length, width, height)', noun: 'Dimension' },
    { id: 'Weight', label: 'Weight', type: 'Class', description: 'The measure of how heavy something is', noun: 'Weight' },
    
    // Offers and Commerce
    { id: 'Offer', label: 'Offer', type: 'Class', description: 'An offer to transfer ownership or provide a service', noun: 'Offer' },
    { id: 'PriceSpecification', label: 'Price Specification', type: 'Class', description: 'Structured value representing price', noun: 'Price' },
    { id: 'ShippingSpecification', label: 'Shipping Specification', type: 'Class', description: 'Details about shipping options', noun: 'Specification' },
  ]
  
  entries.push(...coreClasses.map(c => ({ ...c, source: 'GS1 Web Vocabulary' })))
  
  // Business Transactions
  const businessTransactions = [
    { id: 'PurchaseOrder', label: 'Purchase Order', type: 'BusinessTransaction', description: 'A commercial document issued by a buyer to a seller', noun: 'Order' },
    { id: 'Invoice', label: 'Invoice', type: 'BusinessTransaction', description: 'A commercial document issued by a seller to a buyer', noun: 'Invoice' },
    { id: 'BillOfLading', label: 'Bill of Lading', type: 'BusinessTransaction', description: 'A document issued by a carrier acknowledging receipt of cargo', noun: 'Bill' },
    { id: 'ReceivingAdvice', label: 'Receiving Advice', type: 'BusinessTransaction', description: 'A document confirming receipt of goods', noun: 'Advice' },
    { id: 'DespatchAdvice', label: 'Despatch Advice', type: 'BusinessTransaction', description: 'A document informing of shipment details', noun: 'Advice' },
    { id: 'PackingList', label: 'Packing List', type: 'BusinessTransaction', description: 'A document listing the contents of a shipment', noun: 'List' },
    { id: 'ShippingNotice', label: 'Shipping Notice', type: 'BusinessTransaction', description: 'A notification that goods have been shipped', noun: 'Notice' },
    { id: 'ReturnMerchandiseAuthorization', label: 'Return Merchandise Authorization', type: 'BusinessTransaction', description: 'Authorization to return goods', noun: 'Authorization' },
    { id: 'PaymentReceipt', label: 'Payment Receipt', type: 'BusinessTransaction', description: 'Confirmation of payment received', noun: 'Receipt' },
    { id: 'CreditNote', label: 'Credit Note', type: 'BusinessTransaction', description: 'A document crediting an amount to a customer', noun: 'Note' },
    { id: 'DebitNote', label: 'Debit Note', type: 'BusinessTransaction', description: 'A document debiting an amount from a customer', noun: 'Note' },
  ]
  
  entries.push(...businessTransactions.map(t => ({ ...t, source: 'GS1 CBV' })))
  
  // EPCIS Supply Chain Events
  const supplyChainEvents = [
    { id: 'ObjectEvent', label: 'Object Event', type: 'SupplyChainEvent', description: 'Records information about objects observed or acted upon', relatedEvent: 'observe' },
    { id: 'AggregationEvent', label: 'Aggregation Event', type: 'SupplyChainEvent', description: 'Records the aggregation or disaggregation of objects', verb: 'aggregate' },
    { id: 'TransactionEvent', label: 'Transaction Event', type: 'SupplyChainEvent', description: 'Records business transaction details associated with objects', verb: 'transact' },
    { id: 'TransformationEvent', label: 'Transformation Event', type: 'SupplyChainEvent', description: 'Records the transformation of input objects into output objects', verb: 'transform' },
    { id: 'AssociationEvent', label: 'Association Event', type: 'SupplyChainEvent', description: 'Records the association between a parent object and child objects', verb: 'associate' },
  ]
  
  entries.push(...supplyChainEvents.map(e => ({ ...e, source: 'GS1 EPCIS' })))
  
  // Business Steps (Activities)
  const businessSteps = [
    { id: 'Accepting', label: 'Accepting', type: 'BusinessStep', description: 'Accepting goods or services', verb: 'accept', noun: 'Goods' },
    { id: 'Arriving', label: 'Arriving', type: 'BusinessStep', description: 'Arriving at a location', verb: 'arrive', noun: 'Location' },
    { id: 'Assembling', label: 'Assembling', type: 'BusinessStep', description: 'Assembling components into products', verb: 'assemble', noun: 'Components' },
    { id: 'Collecting', label: 'Collecting', type: 'BusinessStep', description: 'Collecting items', verb: 'collect', noun: 'Items' },
    { id: 'Commissioning', label: 'Commissioning', type: 'BusinessStep', description: 'Creating new instances of objects', verb: 'commission', noun: 'Objects' },
    { id: 'Consigning', label: 'Consigning', type: 'BusinessStep', description: 'Consigning goods to carrier', verb: 'consign', noun: 'Goods' },
    { id: 'CycleCounting', label: 'Cycle Counting', type: 'BusinessStep', description: 'Periodic inventory counting', verb: 'count', noun: 'Inventory' },
    { id: 'Decommissioning', label: 'Decommissioning', type: 'BusinessStep', description: 'Permanently removing objects from use', verb: 'decommission', noun: 'Objects' },
    { id: 'Departing', label: 'Departing', type: 'BusinessStep', description: 'Departing from a location', verb: 'depart', noun: 'Location' },
    { id: 'Destroying', label: 'Destroying', type: 'BusinessStep', description: 'Destroying objects', verb: 'destroy', noun: 'Objects' },
    { id: 'Disassembling', label: 'Disassembling', type: 'BusinessStep', description: 'Disassembling products into components', verb: 'disassemble', noun: 'Products' },
    { id: 'Dispensing', label: 'Dispensing', type: 'BusinessStep', description: 'Dispensing products', verb: 'dispense', noun: 'Products' },
    { id: 'Encoding', label: 'Encoding', type: 'BusinessStep', description: 'Encoding identification', verb: 'encode', noun: 'Identification' },
    { id: 'EnteringExiting', label: 'Entering/Exiting', type: 'BusinessStep', description: 'Entering or exiting a facility', verb: 'enter', noun: 'Facility' },
    { id: 'Holding', label: 'Holding', type: 'BusinessStep', description: 'Holding items in storage', verb: 'hold', noun: 'Items' },
    { id: 'Inspecting', label: 'Inspecting', type: 'BusinessStep', description: 'Inspecting items for quality', verb: 'inspect', noun: 'Items' },
    { id: 'Installing', label: 'Installing', type: 'BusinessStep', description: 'Installing equipment or systems', verb: 'install', noun: 'Equipment' },
    { id: 'Loading', label: 'Loading', type: 'BusinessStep', description: 'Loading onto transport', verb: 'load', noun: 'Transport' },
    { id: 'Packing', label: 'Packing', type: 'BusinessStep', description: 'Packing items', verb: 'pack', noun: 'Items' },
    { id: 'Picking', label: 'Picking', type: 'BusinessStep', description: 'Picking items for order fulfillment', verb: 'pick', noun: 'Items' },
    { id: 'Receiving', label: 'Receiving', type: 'BusinessStep', description: 'Receiving goods', verb: 'receive', noun: 'Goods' },
    { id: 'Removing', label: 'Removing', type: 'BusinessStep', description: 'Removing from location', verb: 'remove', noun: 'Items' },
    { id: 'Repackaging', label: 'Repackaging', type: 'BusinessStep', description: 'Changing packaging', verb: 'repackage', noun: 'Packages' },
    { id: 'Repairing', label: 'Repairing', type: 'BusinessStep', description: 'Repairing items', verb: 'repair', noun: 'Items' },
    { id: 'Replacing', label: 'Replacing', type: 'BusinessStep', description: 'Replacing items', verb: 'replace', noun: 'Items' },
    { id: 'Reserving', label: 'Reserving', type: 'BusinessStep', description: 'Reserving for future use', verb: 'reserve', noun: 'Items' },
    { id: 'RetailSelling', label: 'Retail Selling', type: 'BusinessStep', description: 'Selling at retail', verb: 'sell', noun: 'Products' },
    { id: 'Sampling', label: 'Sampling', type: 'BusinessStep', description: 'Taking samples for testing', verb: 'sample', noun: 'Products' },
    { id: 'SensorReporting', label: 'Sensor Reporting', type: 'BusinessStep', description: 'Reporting sensor data', verb: 'report', noun: 'Data' },
    { id: 'Shipping', label: 'Shipping', type: 'BusinessStep', description: 'Shipping to destination', verb: 'ship', noun: 'Goods' },
    { id: 'StagingOutbound', label: 'Staging Outbound', type: 'BusinessStep', description: 'Staging for outbound shipment', verb: 'stage', noun: 'Shipment' },
    { id: 'StockTaking', label: 'Stock Taking', type: 'BusinessStep', description: 'Taking inventory', verb: 'take', noun: 'Inventory' },
    { id: 'Stocking', label: 'Stocking', type: 'BusinessStep', description: 'Stocking shelves', verb: 'stock', noun: 'Shelves' },
    { id: 'Storing', label: 'Storing', type: 'BusinessStep', description: 'Storing in warehouse', verb: 'store', noun: 'Goods' },
    { id: 'Transporting', label: 'Transporting', type: 'BusinessStep', description: 'Transporting between locations', verb: 'transport', noun: 'Goods' },
    { id: 'Unloading', label: 'Unloading', type: 'BusinessStep', description: 'Unloading from transport', verb: 'unload', noun: 'Transport' },
    { id: 'Unpacking', label: 'Unpacking', type: 'BusinessStep', description: 'Unpacking items', verb: 'unpack', noun: 'Items' },
  ]
  
  entries.push(...businessSteps.map(s => ({ ...s, source: 'GS1 CBV' })))
  
  // Dispositions (states - map to past tense verbs via events)
  const dispositions = [
    { id: 'Active', label: 'Active', type: 'Disposition', description: 'In active use', verb: 'activate' },
    { id: 'Available', label: 'Available', type: 'Disposition', description: 'Available for use', verb: 'make_available' },
    { id: 'Conformant', label: 'Conformant', type: 'Disposition', description: 'Meets conformance requirements', verb: 'conform' },
    { id: 'ContainerClosed', label: 'Container Closed', type: 'Disposition', description: 'Container is closed', verb: 'close' },
    { id: 'ContainerOpen', label: 'Container Open', type: 'Disposition', description: 'Container is open', verb: 'open' },
    { id: 'Damaged', label: 'Damaged', type: 'Disposition', description: 'Item is damaged', verb: 'damage' },
    { id: 'Destroyed', label: 'Destroyed', type: 'Disposition', description: 'Item has been destroyed', verb: 'destroy' },
    { id: 'Dispensed', label: 'Dispensed', type: 'Disposition', description: 'Item has been dispensed', verb: 'dispense' },
    { id: 'Disposed', label: 'Disposed', type: 'Disposition', description: 'Item has been disposed of', verb: 'dispose' },
    { id: 'Encoded', label: 'Encoded', type: 'Disposition', description: 'Identification has been encoded', verb: 'encode' },
    { id: 'Expired', label: 'Expired', type: 'Disposition', description: 'Item has expired', verb: 'expire' },
    { id: 'InProgress', label: 'In Progress', type: 'Disposition', description: 'Operation in progress', verb: 'progress' },
    { id: 'InTransit', label: 'In Transit', type: 'Disposition', description: 'In transit to destination', verb: 'transit' },
    { id: 'Inactive', label: 'Inactive', type: 'Disposition', description: 'Not in active use', verb: 'deactivate' },
    { id: 'NonConformant', label: 'Non-Conformant', type: 'Disposition', description: 'Does not meet requirements', verb: 'reject' },
    { id: 'Recalled', label: 'Recalled', type: 'Disposition', description: 'Subject to recall', verb: 'recall' },
    { id: 'Reserved', label: 'Reserved', type: 'Disposition', description: 'Reserved for specific use', verb: 'reserve' },
    { id: 'RetailSold', label: 'Retail Sold', type: 'Disposition', description: 'Sold at retail', verb: 'sell' },
    { id: 'Returned', label: 'Returned', type: 'Disposition', description: 'Returned by customer', verb: 'return' },
    { id: 'SellableAccessible', label: 'Sellable Accessible', type: 'Disposition', description: 'Sellable and accessible', verb: 'make_sellable' },
    { id: 'SellableNotAccessible', label: 'Sellable Not Accessible', type: 'Disposition', description: 'Sellable but not accessible', verb: 'make_sellable' },
    { id: 'Stolen', label: 'Stolen', type: 'Disposition', description: 'Item has been stolen', verb: 'steal' },
    { id: 'Unavailable', label: 'Unavailable', type: 'Disposition', description: 'Not available', verb: 'make_unavailable' },
    { id: 'Unknown', label: 'Unknown', type: 'Disposition', description: 'Status unknown', verb: 'unknown' },
  ]
  
  entries.push(...dispositions.map(d => ({ ...d, source: 'GS1 CBV' })))
  
  // GS1 Identifiers
  const identifiers = [
    { id: 'GTIN', label: 'Global Trade Item Number', type: 'Identifier', description: 'Unique identifier for trade items (products)', noun: 'TradeItem' },
    { id: 'GLN', label: 'Global Location Number', type: 'Identifier', description: 'Unique identifier for physical, functional, or legal entities', noun: 'Location' },
    { id: 'SSCC', label: 'Serial Shipping Container Code', type: 'Identifier', description: 'Unique identifier for logistics units', noun: 'Container' },
    { id: 'GRAI', label: 'Global Returnable Asset Identifier', type: 'Identifier', description: 'Identifier for returnable assets (pallets, containers)', noun: 'Asset' },
    { id: 'GIAI', label: 'Global Individual Asset Identifier', type: 'Identifier', description: 'Identifier for fixed assets (equipment, tools)', noun: 'Asset' },
    { id: 'GSRN', label: 'Global Service Relation Number', type: 'Identifier', description: 'Identifier for service relationships', noun: 'Service' },
    { id: 'GDTI', label: 'Global Document Type Identifier', type: 'Identifier', description: 'Identifier for documents and certificates', noun: 'Document' },
    { id: 'GINC', label: 'Global Identification Number for Consignment', type: 'Identifier', description: 'Identifier for grouping logistics units', noun: 'Consignment' },
    { id: 'GSIN', label: 'Global Shipment Identification Number', type: 'Identifier', description: 'Identifier for shipments', noun: 'Shipment' },
    { id: 'GCN', label: 'Global Coupon Number', type: 'Identifier', description: 'Identifier for coupons and promotional offers', noun: 'Coupon' },
    { id: 'CPID', label: 'Component/Part Identifier', type: 'Identifier', description: 'Identifier for components and parts', noun: 'Component' },
    { id: 'GMN', label: 'Global Model Number', type: 'Identifier', description: 'Identifier for product models', noun: 'Model' },
  ]
  
  entries.push(...identifiers.map(i => ({ ...i, source: 'GS1 Standards' })))
  
  console.log(`  ✓ Loaded ${entries.length} GS1 vocabulary entries`)
  return entries
}

async function main() {
  const sourceDir = path.resolve(__dirname, '../.source/GS1')
  
  console.log('='.repeat(80))
  console.log('GS1 WEB VOCABULARY FETCH')
  console.log('='.repeat(80))
  console.log()
  
  const entries = await fetchWebVocabulary()
  
  console.log()
  console.log(`Total entries: ${entries.length}`)
  console.log()
  
  // Group by type
  const byType = new Map<string, VocabEntry[]>()
  for (const entry of entries) {
    if (!byType.has(entry.type)) {
      byType.set(entry.type, [])
    }
    byType.get(entry.type)!.push(entry)
  }
  
  console.log('Entries by type:')
  for (const [type, typeEntries] of byType) {
    console.log(`  ${type}: ${typeEntries.length}`)
  }
  console.log()
  
  // Write main vocabulary TSV
  const outputPath = path.join(sourceDir, 'GS1.Vocabulary.tsv')
  const header = 'id\tlabel\ttype\tdescription\tsource\tverb\tnoun\trelatedEvent\n'
  const rows = entries.map(e =>
    `${e.id}\t${e.label}\t${e.type}\t${e.description}\t${e.source}\t${e.verb || ''}\t${e.noun || ''}\t${e.relatedEvent || ''}`
  ).join('\n')
  
  fs.writeFileSync(outputPath, header + rows)
  console.log(`  ✓ Wrote ${outputPath}`)
  
  // Create mapping files
  
  // BusinessStep -> Verb mapping
  const businessStepMappings = entries
    .filter(e => e.type === 'BusinessStep' && e.verb)
    .map(e => `${e.id}\t${e.verb}\t${e.noun || ''}\t${e.label}`)
  const businessStepPath = path.join(sourceDir, 'GS1.BusinessStep.VerbMapping.tsv')
  fs.writeFileSync(businessStepPath, 'businessStep\tverb\tnoun\tdescription\n' + businessStepMappings.join('\n'))
  console.log(`  ✓ Wrote ${businessStepPath}`)
  
  // Disposition -> Verb mapping (state changes via events)
  const dispositionMappings = entries
    .filter(e => e.type === 'Disposition' && e.verb)
    .map(e => `${e.id}\t${e.verb}\t${e.label}`)
  const dispositionPath = path.join(sourceDir, 'GS1.Disposition.VerbMapping.tsv')
  fs.writeFileSync(dispositionPath, 'disposition\tverb\tdescription\n' + dispositionMappings.join('\n'))
  console.log(`  ✓ Wrote ${dispositionPath}`)
  
  // Identifier -> Class mapping
  const identifierMappings = entries
    .filter(e => e.type === 'Identifier' && e.noun)
    .map(e => `${e.id}\t${e.noun}\t${e.label}`)
  const identifierPath = path.join(sourceDir, 'GS1.Identifier.ClassMapping.tsv')
  fs.writeFileSync(identifierPath, 'identifier\tclass\tdescription\n' + identifierMappings.join('\n'))
  console.log(`  ✓ Wrote ${identifierPath}`)
  
  console.log()
  console.log('='.repeat(80))
  console.log('FETCH COMPLETE')
  console.log('='.repeat(80))
  console.log()
}

main().catch(console.error)
