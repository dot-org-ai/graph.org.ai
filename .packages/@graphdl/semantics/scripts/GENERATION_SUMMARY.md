# People/Agents/Organizations Domain Generation Summary

Generated on: 2025-11-24

## Overview

Successfully generated TSV domain files and relationships for the People/Agents/Organizations domain group in the graph.org.ai ecosystem.

## Source Data Found

1. **ONET.Occupation.tsv** (1,016 occupations)
   - Used to generate Roles.tsv and Roles.Occupations.tsv
   - Provides comprehensive occupation data from O*NET

2. **Apps.tsv** (9,098 apps from Zapier integrations)
   - Used to generate Agents.tsv (AI/automation tools)
   - Used to generate Companies.tsv (all apps as companies)
   - Provides real-world application and company data

3. **NAICS.Industry.tsv** (NAICS industry codes)
   - Used to create Companies.Industries.tsv relationships
   - Maps company categories to industry codes

## Files Generated

### Domain Files

1. **Roles.tsv** (1,016 roles)
   - Columns: id, name, description, level
   - Extracted from ONET occupations
   - Level distribution:
     - Professional: 925 (91.0%)
     - Manager: 78 (7.7%)
     - Director: 8 (0.8%)
     - Executive: 4 (0.4%)
     - Entry: 1 (0.1%)

2. **Agents.tsv** (1,338 AI agents)
   - Columns: id, name, description, type
   - Filtered from Apps based on AI/automation indicators
   - Top types:
     - Analytics: 121
     - CRM: 91
     - Marketing Automation: 88
     - AI Assistants: 88
     - Email: 52

3. **Companies.tsv** (9,046 companies)
   - Columns: id, name, description, industry
   - All apps treated as companies
   - Top industries:
     - CRM: 989
     - Marketing Automation: 454
     - Forms & Surveys: 324
     - eCommerce: 316
     - Marketing: 303

4. **People.tsv** (15 person types - stub)
   - Columns: id, name, description, type
   - Common person types including:
     - Employee, Manager, Executive (Workers/Leadership)
     - Contractor, Freelancer, Consultant (Professionals)
     - Customer, Supplier, Partner, Investor (Stakeholders)
     - Founder, Director, Specialist, Analyst, Administrator

5. **Organizations.tsv** (15 organization types - stub)
   - Columns: id, name, description, type
   - Common organization types including:
     - Corporation, LLC, Partnership, SoleProprietorship (Business)
     - Nonprofit, NGO, Foundation (Nonprofit)
     - Government (Government)
     - PublicCompany, PrivateCompany, Startup, Enterprise, SmallBusiness

### Relationship Files

1. **Roles.Occupations.tsv** (1,016 relationships)
   - Links roles to ONET occupation IDs
   - 1:1 mapping from roles to occupations

2. **Agents.Apps.tsv** (1,338 relationships)
   - Links AI agents to their source apps
   - 1:1 mapping from agents to apps

3. **Companies.Industries.tsv** (9,046 relationships)
   - Links companies to NAICS industry codes
   - Maps app categories to standard industry classifications
   - Default: 51121 (Software Publishers)

4. **People.Roles.tsv** (99 relationships)
   - Links person types to roles based on role level
   - Sample relationships showing common mappings:
     - Executive → Executive-level roles
     - Director → Director-level roles
     - Manager → Manager-level roles
     - Employee → Professional-level roles

## Script Details

**Script:** `/Users/nathanclevenger/projects/graph.org.ai/.packages/@graphdl/semantics/scripts/generate-people-agents-orgs.ts`

**Key Functions:**
- `toPascalCase()` - Converts names to PascalCase IDs
- `extractRoleLevel()` - Determines role level from occupation title
- `generateRoles()` - Creates roles from ONET occupations
- `generateAgents()` - Filters AI/automation tools from apps
- `generateCompanies()` - Creates companies from all apps
- `generatePeople()` - Creates stub person types with sample relationships
- `generateOrganizations()` - Creates stub organization types

## Data Quality Notes

### High-Quality Data (from source files)
- **Roles**: Complete data from ONET with 1,016 occupations
- **Agents**: Filtered from 9,098 apps using AI/automation indicators (1,338 found)
- **Companies**: Complete data using all apps as companies (9,046)

### Stub Data (created as examples)
- **People**: 15 common person types - could be expanded with actual person data
- **Organizations**: 15 common organization types - could be expanded with real organizations

## Missing Data Sources

The following data sources were not found and would enhance the domain:

1. **People Data**: No source found for actual people or person records
   - Created stub with 15 common person types
   - Could be populated from HR systems, LinkedIn, etc.

2. **Organization Data**: No source found for actual organizations
   - Created stub with 15 organization types
   - Could be populated from business registries, databases

3. **Department/Team Data**: No organizational structure data found
   - Could add Departments.tsv and Teams.tsv
   - Could be sourced from org charts, HR systems

## Usage

Run the generation script:
```bash
cd /Users/nathanclevenger/projects/graph.org.ai/.packages/@graphdl/semantics
tsx scripts/generate-people-agents-orgs.ts
```

## Next Steps

Potential enhancements:
1. Add actual people data from LinkedIn, company websites, etc.
2. Add real organization data from business registries
3. Create Departments.tsv and Teams.tsv for organizational structure
4. Add Person.Companies.tsv to link people to companies
5. Add more granular role hierarchies
6. Add skills and competencies to roles
7. Add industry-specific role variations

## File Locations

All generated files are in: `/Users/nathanclevenger/projects/graph.org.ai/.data/`

Domain files:
- Roles.tsv (77 KB, 1,016 records)
- Agents.tsv (222 KB, 1,338 records)
- Companies.tsv (1.4 MB, 9,046 records)
- People.tsv (1.2 KB, 15 records)
- Organizations.tsv (1.3 KB, 15 records)

Relationship files:
- Roles.Occupations.tsv
- Agents.Apps.tsv
- Companies.Industries.tsv
- People.Roles.tsv

Total records: 20,530 entities + 11,499 relationships = 32,029 total records
