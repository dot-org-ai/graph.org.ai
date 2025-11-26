# Product-Service Lifecycle: Ontological Relationships

## Core Insight

Every product exists within an ecosystem of services. No product exists in isolation - each requires:
1. **Production services** to bring it into existence
2. **Distribution services** to move it through supply chains
3. **Consumption services** to enable its use
4. **Maintenance services** to extend its life
5. **End-of-life services** to manage its disposal/recycling

## The Service Lifecycle Stages

### 1. Production Services (Creation)
**Manufacturing:**
- Assembly services
- Fabrication services  
- Production line services
- Quality control/testing

**Primary Industry:**
- Farming/agricultural services
- Mining/extraction services
- Harvesting services
- Logging/forestry services

**Processing:**
- Refining services
- Processing services
- Packaging services

### 2. Distribution Services (Movement)
**Wholesale:**
- Bulk distribution
- Warehousing
- Inventory management

**Transportation:**
- Freight services (road, rail, air, sea)
- Logistics services
- Shipping services
- Last-mile delivery

**Retail:**
- Point-of-sale services
- E-commerce fulfillment
- Customer service

### 3. Consumption Services (Enablement)
**Pre-use:**
- Installation services
- Setup/configuration services
- Training services
- Onboarding services

**During use:**
- Technical support
- Customer service
- Usage optimization
- Consulting services

### 4. Maintenance Services (Extension)
**Preventive:**
- Routine maintenance
- Inspection services
- Cleaning services
- Calibration services

**Corrective:**
- Repair services
- Replacement services
- Refurbishment services
- Upgrade services

### 5. End-of-Life Services (Closure)
**Recovery:**
- Recycling services
- Reclamation services
- Salvage services
- Parts harvesting

**Disposal:**
- Waste management
- Decommissioning services
- Environmental remediation
- Hazardous waste handling

## Business Context Layers

### B2B vs B2C Services
**Business-to-Business:**
- Procurement services
- Contract manufacturing
- Enterprise support
- Fleet management
- Bulk maintenance

**Business-to-Consumer:**
- Retail services
- Consumer support
- Home installation
- Individual repair

### Industry-Specific Patterns
**Agriculture:**
- Product: Crops
- Services: Planting, irrigation, harvesting, processing, distribution

**Manufacturing:**
- Product: Machinery
- Services: Design, fabrication, installation, maintenance, decommissioning

**Technology:**
- Product: Software/Hardware
- Services: Development, deployment, support, updates, migration

**Healthcare:**
- Product: Medical devices
- Services: Installation, calibration, sterilization, maintenance, disposal

## NAPCS Service Patterns to Explore

### Identified Service Categories in NAPCS
From our initial analysis, NAPCS contains:
- Transportation services (road, rail, air, sea)
- Maintenance and repair services
- Rental and leasing services  
- Installation services
- Professional services (consulting, research)
- Information services
- Financial services
- Healthcare services

### Missing Service-Product Connections
**Questions:**
1. For each product in UNSPSC/GS1, what services are implied but not explicit?
2. How do we infer "Widgets" → "Widget Manufacturing Services"?
3. How do we connect "Medical Equipment" → "Medical Equipment Maintenance"?
4. What naming conventions link products to their lifecycle services?

## Implementation Approach

### Phase 1: Identify Explicit Connections
**Pattern matching in NAPCS service names:**
- "Maintenance and repair services for X" → links to product category X
- "Manufacturing services for X" → links to product category X  
- "Installation services for X" → links to product category X

### Phase 2: Create Relationship Graph
**Schema for Product-Service relationships:**
```typescript
{
  product: "MedicalImaging Equipment",
  services: {
    production: ["MedicalEquipmentManufacturing"],
    distribution: ["MedicalEquipmentWholesale", "MedicalEquipmentRetail"],
    installation: ["MedicalEquipmentInstallation"],
    maintenance: ["MedicalEquipmentMaintenance", "MedicalEquipmentRepair"],
    disposal: ["MedicalWasteDisposal", "EquipmentDecommissioning"]
  }
}
```

### Phase 3: Infer Missing Services
**For products without explicit service matches:**
- Generate canonical service names following patterns
- Example: "Widgets" → "WidgetManufacturing", "WidgetMaintenance", etc.
- Flag as inferred vs explicit

### Phase 4: Build Ontology
**Create comprehensive ontology:**
- Product taxonomy (UNSPSC/GS1)
- Service taxonomy (NAPCS/NAICS)
- Lifecycle stage ontology
- Relationship types (produces, distributes, maintains, etc.)

## Data Sources to Leverage

### Product Taxonomies
- **UNSPSC:** 50K+ commodities (physical products)
- **GS1 GPC:** Global product classification
- **HS Codes:** International trade classification

### Service Taxonomies
- **NAPCS:** 3K+ service products (what we're debugging now)
- **NAICS:** Industry classification (includes service industries)
- **APQC:** Process classifications
- **O*NET:** Occupation-based tasks (manual services)

### Linking Strategies
**Name-based matching:**
- "Computer hardware" (product) ↔ "Computer hardware maintenance" (service)
- "Automotive parts" (product) ↔ "Automotive repair services" (service)

**Code-based matching:**
- NAPCS codes may reference UNSPSC/NAICS codes
- Cross-reference tables may exist

**Semantic inference:**
- Every manufactured product → manufacturing service
- Every mechanical product → maintenance service
- Every food product → food service (preparation, catering)

## Analysis Results (Iteration #3 & #4)

### NAPCS Composition Discovery

**CRITICAL FINDING:** NAPCS contains BOTH products AND services (it's misnamed!)

**Breakdown of 2,889 NAPCS Detail entries:**

1. **Product Lifecycle Services (320 = 11%)**
   - Production: 66 services
   - Distribution: 150 services
   - Consumption: 52 services
   - Maintenance: 57 services (82% have clear product references!)
   - End-of-Life: 48 services

2. **Pure Business/Consumer Services (478 = 17%)**
   - Financial Services: 60
   - Healthcare: 62
   - Real Estate: 51
   - Personal Services: 47
   - Information/Telecom: 47
   - R&D/Scientific: 46
   - Entertainment/Arts: 41
   - Government/Public: 35
   - Professional Services: 34
   - Other Business: 22
   - Advertising/Marketing: 16
   - Education: 17

3. **Physical Products (~2,091 = 72%)**
   - Overlaps significantly with UNSPSC
   - Examples: Abrasive grain, adhesives, air bags, agricultural chemicals, wire, cable, castings, etc.

### Key Patterns Identified

**Best Pattern Extraction:** Maintenance services
- "Aircraft maintenance and repair services" → Product: "aircraft"
- "Computer hardware maintenance" → Product: "computer hardware"
- 82% extraction rate vs 9-21% for other lifecycle stages

**Weakest Pattern Extraction:** Production and End-of-Life
- Often generic: "Manufacturing services", "Waste disposal"
- Lack specific product references
- Need domain inference

### Product Reference Extraction Patterns

1. **Pattern: "services for X"**
   - "Maintenance and repair services for X"
   - "Support services for X"
   - "Consulting services for X"

2. **Pattern: "X services"**
   - "Aircraft maintenance"
   - "Computer repair"
   - "Building cleaning"

3. **Pattern: "transportation of X"**
   - "Transportation of waste"
   - "Transportation of general freight"

## Next Steps

1. ✅ **Analyze NAPCS service descriptions** for product references → COMPLETED
2. ✅ **Extract pattern:** "services for [product category]" → COMPLETED
3. **Build mapping table:** Product → Service lifecycle stages
4. **Identify gaps:** Products without services, services without products
5. **Distinguish NAPCS products from NAPCS services** - need classification logic
6. **Create inference rules:** Generate missing service connections for products
7. **Validate:** Sample 100 products, verify service coverage
8. **Cross-reference:** Compare NAPCS products with UNSPSC to find overlaps and gaps

## Research Questions

1. How complete is NAPCS coverage of lifecycle services?
2. Are there systematic gaps (e.g., more maintenance than manufacturing)?
3. Do service names consistently reference product categories?
4. Can we build a generative model for product → service mapping?
5. How do we handle:
   - Products that ARE services (e.g., "Consulting")
   - Services that produce products (e.g., "Custom manufacturing")
   - Circular relationships (repair parts, replacement parts)
