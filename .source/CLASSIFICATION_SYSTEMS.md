# Classification Systems Research

## Summary

This document catalogs global classification systems for products, services, industries, and healthcare. Use this as a reference for future data integration.

---

## Currently Integrated ✅

### 1. UNSPSC (United Nations Standard Products and Services Code)
- **Status**: ✅ Integrated (158,464 commodities)
- **Coverage**: Global products and services
- **Structure**: 4-tier (Segment → Family → Class → Commodity)
- **Source**: [UNSPSC.org](https://www.unspsc.org/)
- **Output**: 182,918 entities (Products + Services)

### 2. NAPCS (North American Product Classification System)
- **Status**: ✅ Integrated (3,049 detail entries)
- **Version**: 2022 v1.0
- **Coverage**: North American products and services
- **Structure**: 4-tier (Group → Class → Subclass → Detail)
- **Source**: [Statistics Canada](https://open.canada.ca/data/en/dataset/c6ef2768-f261-422c-b0da-e26017c98444)
- **Output**: 5,558 entities

### 3. GS1 GPC (Global Product Classification)
- **Status**: ✅ Integrated (5,297 Bricks)
- **Version**: November 2024 (GDSN)
- **Coverage**: Global product classification with detailed includes/excludes
- **Structure**: 4-tier (Segment → Family → Class → Brick)
- **Source**: [GPC Browser](https://gpc-browser.gs1.org/)
- **Format**: Excel (read directly via xlsx package)
- **Output**: 5,364 product entities

### 4. NAICS (North American Industry Classification System)
- **Status**: ✅ Integrated (2,125 industries)
- **Coverage**: North American industries
- **Source**: US Census Bureau
- **Output**: 3,618 industry entities (70% expansion)

### 5. O*NET (Occupational Information Network)
- **Status**: ✅ Integrated (1,016 occupations)
- **Coverage**: US occupations and tasks
- **Source**: [O*NET Online](https://www.onetcenter.org/)
- **Output**: 1,675 occupation entities, 73,036 task entities

### 6. APQC PCF (Process Classification Framework)
- **Status**: ✅ Integrated
- **Coverage**: Business processes
- **Source**: APQC
- **Output**: 49,095 process entities, 59 concept entities

---

## To Be Integrated 🔄

### 7. HS Codes (Harmonized System)
- **Status**: 🔄 Research complete
- **Coverage**: International trade classification
- **Current Version**: HS 2022 (HS 2024 forthcoming)
- **Structure**: 6-digit code system managed by WCO
- **Authority**: World Customs Organization (WCO)

#### Download Sources:
1. **Official WCO** (Paid):
   - [WCO Bookshop - HS 2022 XML/CSV](https://www.wcoomdpublications.org/en/products/harmonized-system/harmonized-system-nomenclature-2022-xml-csv-formats)
   - [WCO HS Database](http://harmonizedsystem.wcoomdpublications.org/)

2. **Free GitHub Resources**:
   - [datasets/harmonized-system](https://github.com/datasets/harmonized-system)
   - [WCO-HS-Codes CSV](https://github.com/warrantgroup/WCO-HS-Codes/blob/master/data/hscodes.csv)

3. **WTO Tariff Download Facility**:
   - [WTO Tariff Data](http://tariffdata.wto.org/)
   - Formats: Excel, XML, CSV

### 8. CPV (Common Procurement Vocabulary)
- **Status**: 🔄 Research complete
- **Coverage**: EU public procurement
- **Codes**: 8,323 CPV codes
- **Authority**: European Commission
- **Version**: In use since 2008

#### Download Sources:
1. **Official EU SIMAP** (Free):
   - [TED/SIMAP CPV](https://ted.europa.eu/en/simap/cpv)
   - Formats: PDF, XML, ODS, XLS

2. **Alternative**:
   - [Public Tendering CPV Codes](https://www.publictendering.com/cpv-codes/list-of-the-cpv-codes/)
   - [CPV Codes Search](https://cpvcodes.eu/en)

### 9. ISIC (International Standard Industrial Classification)
- **Status**: 🔄 Research complete
- **Coverage**: Economic activities (industries)
- **Current Version**: ISIC Rev. 5 (adopted March 2023)
- **Previous**: ISIC Rev. 4
- **Authority**: UN Statistics Division

#### Download Sources:
1. **Official UN**:
   - [ISIC Homepage](https://unstats.un.org/unsd/classifications/Econ/isic)
   - [ISIC Rev. 4 Detail](https://unstats.un.org/unsd/classifications/Family/Detail/27)
   - [ISIC Rev. 5](https://unstats.un.org/unsd/classifications/isic/revision) (forthcoming publication)

2. **Classification.Codes**:
   - [ISIC Browser](https://classification.codes/classifications/industry/isic)

---

## Healthcare Classification Systems 🏥

### 10. ICD-10/11 (International Classification of Diseases)
- **Status**: 🔄 Research complete
- **Coverage**: Diseases, disorders, injuries, external causes
- **Authority**: World Health Organization (WHO)
- **Versions**:
  - ICD-10: Current widely-used version
  - ICD-11: Latest (2024), includes 200+ new allergen codes

#### Download Sources:
1. **WHO ICD-10**:
   - [ICD-10 Download Page](https://icdcdn.who.int/icd10/index.html)
   - [ICD-11 Downloads](https://icd.who.int/dev11/downloads/)

2. **US CDC ICD-10-CM** (Clinical Modification):
   - [CDC ICD-10-CM Files](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html)
   - [ICD-10-CM Browser Tool](https://icd10cmtool.cdc.gov/)
   - **FY25 codes**: Valid April 1, 2025 - September 30, 2025

#### Integration Notes:
- Available in XML and various proprietary formats
- May require conversion to CSV/TSV
- Contains 10,000+ codes

### 11. SNOMED CT (Systematized Nomenclature of Medicine Clinical Terms)
- **Status**: 🔄 Research complete
- **Coverage**: Comprehensive clinical terminology
- **Authority**: SNOMED International
- **License**: Required (UMLS Affiliate License)

#### Download Sources:
1. **NLM UMLS** (License Required):
   - [SNOMED CT Homepage](https://www.nlm.nih.gov/healthit/snomedct/index.html)
   - [SNOMED CT International Edition](https://www.nlm.nih.gov/healthit/snomedct/international.html)
   - [SNOMED CT Archives](https://www.nlm.nih.gov/healthit/snomedct/archive.html)

2. **Regional**:
   - [Public Health Scotland](https://publichealthscotland.scot/resources-and-tools/health-intelligence-and-data-management/terminology-services-and-clinical-coding/snomed-clinical-terms-snomed-ct-resources/download-the-latest-snomed-ct-files/)
   - [NHS England Digital](https://digital.nhs.uk/services/terminology-and-classifications/snomed-ct)

#### Integration Notes:
- Format: RF2 (Release Format 2) - tab-delimited text files
- 2024 Releases: Monthly (June-December 2024)
- Contains 300,000+ active concepts
- Requires UMLS license registration

### 12. Additional Healthcare Classifications
- **CPT (Current Procedural Terminology)**: Procedures and services (AMA, license required)
- **LOINC (Logical Observation Identifiers Names and Codes)**: Lab tests and clinical observations (free)
- **RxNorm**: Medications (NLM, free)
- **NDC (National Drug Code)**: Drug products (FDA, free)

---

## Manufacturing & Industry-Specific 🏭

### 13. SIC (Standard Industrial Classification)
- **Status**: ⏳ Superseded by NAICS but still used
- **Coverage**: US industries
- **Structure**: 4-digit codes
- **Authority**: US Government (various agencies)

#### Download Sources:
1. **SEC SIC Code List**:
   - [SEC SIC Codes](https://www.sec.gov/corpfin/division-of-corporation-finance-standard-industrial-classification-sic-code-list)

2. **OSHA SIC Search**:
   - [OSHA SIC Search Tool](https://www.osha.gov/data/sic-search)

3. **Commercial**:
   - [SICCODE.com](https://siccode.com/)

### 14. ISO Standards Classifications
- **Status**: 🔄 Research complete
- **Coverage**: International standards across all industries
- **Authority**: International Organization for Standardization

#### Download Sources:
- [ISO Standards Catalog](https://www.iso.org/standards.html)
- [ICS (International Classification for Standards)](https://www.iso.org/standards-catalogue/browse-by-ics.html)
- **Open Data**: CSV, JSON, Parquet formats available

#### Automotive Specific:
- ISO 26262 (Automotive functional safety)
- IATF 16949 (Automotive quality management)
- SAE standards classification

#### Electronics Specific:
- IEC standards (International Electrotechnical Commission)
- Electronic components: SIC 36xx codes

---

## Additional Classification Systems

### 15. NACE (Nomenclature of Economic Activities)
- **Coverage**: European economic activities
- **Authority**: European Commission (Eurostat)
- **Current**: NACE Rev. 2
- **Similar to**: ISIC (but EU-specific)

### 16. CPC (Central Product Classification)
- **Coverage**: UN product classification
- **Authority**: UN Statistics Division
- **Current**: CPC Ver. 2.1
- **Companion to**: ISIC

### 17. SITC (Standard International Trade Classification)
- **Coverage**: International trade commodities
- **Authority**: UN Statistics Division
- **Current**: SITC Rev. 4

---

## Integration Priority 🎯

### Phase 1 (High Priority)
1. ✅ UNSPSC - Complete
2. ✅ NAPCS - Complete
3. ✅ GS1 GPC - Complete
4. 🔄 HS Codes - Download from GitHub
5. 🔄 CPV - Download from SIMAP
6. 🔄 ISIC Rev. 5 - Download from UN

### Phase 2 (Medium Priority)
7. ⏳ ICD-10/11 - Download from CDC
8. ⏳ LOINC - Free download available
9. ⏳ SIC Codes - Download from SEC
10. ⏳ ISO ICS - Download open data

### Phase 3 (Licensed/Complex)
11. ⏳ SNOMED CT - Requires UMLS license
12. ⏳ CPT - Requires AMA license
13. ⏳ RxNorm - Free but complex structure

---

## Current Integration Status

**Total Entities: 321,780**

| Category | Count | Sources |
|----------|-------|---------|
| Services | 102,515 | UNSPSC, NAPCS |
| **Products** | **91,342** | **UNSPSC, NAPCS, GS1 GPC** ✅ |
| Tasks | 73,036 | O*NET, APQC |
| Processes | 49,095 | APQC |
| Industries | 3,618 | NAICS |
| Occupations | 1,675 | O*NET |
| Verbs | 432 | All sources |
| Concepts | 59 | APQC, O*NET |

---

## Data Sources Summary

Sources:
- [HS Codes GitHub](https://github.com/datasets/harmonized-system)
- [WCO HS Database](http://harmonizedsystem.wcoomdpublications.org/)
- [CPV SIMAP](https://ted.europa.eu/en/simap/cpv)
- [ISIC UN Statistics](https://unstats.un.org/unsd/classifications/Econ/isic)
- [ICD-10 CDC](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html)
- [ICD-11 WHO](https://icd.who.int/dev11/downloads/)
- [SNOMED CT NLM](https://www.nlm.nih.gov/healthit/snomedct/index.html)
- [SEC SIC Codes](https://www.sec.gov/corpfin/division-of-corporation-finance-standard-industrial-classification-sic-code-list)
- [ISO Standards](https://www.iso.org/standards.html)

---

## Next Steps

1. ✅ Delete TSV files created by Python (use direct Excel reading instead)
2. 🔄 Download HS Codes from GitHub
3. 🔄 Download CPV from SIMAP
4. 🔄 Download ISIC Rev. 5 from UN
5. 🔄 Update generation script to include HS, CPV, ISIC
6. ⏳ Evaluate healthcare classification priority
7. ⏳ Evaluate SIC codes integration need

---

*Last Updated: 2024-11-22*
