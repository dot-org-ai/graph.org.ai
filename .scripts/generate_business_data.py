#!/usr/bin/env python3
"""
Generate Business and Department type files in .data directory from source TSV files.
"""

import csv
import re
from pathlib import Path
from typing import List, Dict

def to_url_friendly_id(name: str) -> str:
    """Convert a name to a URL-friendly ID (PascalCase, no special chars)."""
    # If already in PascalCase (no spaces, starts with capital), return as-is
    if name and name[0].isupper() and ' ' not in name and '-' not in name and '_' not in name:
        # Just remove any non-alphanumeric characters
        return re.sub(r'[^\w]', '', name)

    # Remove any text in parentheses
    name = re.sub(r'\([^)]*\)', '', name)
    # Replace special characters and spaces with nothing or proper casing
    name = re.sub(r'[^\w\s-]', '', name)
    # Split on spaces, hyphens, and underscores
    parts = re.split(r'[\s\-_]+', name.strip())
    # Convert to PascalCase
    return ''.join(word.capitalize() for word in parts if word)

def read_tsv(file_path: Path) -> List[Dict[str, str]]:
    """Read a TSV file and return list of dictionaries."""
    rows = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            if row.get('id'):  # Skip empty rows
                rows.append(row)
    return rows

def write_tsv(file_path: Path, rows: List[Dict[str, str]], fieldnames: List[str]):
    """Write a TSV file from list of dictionaries."""
    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t', extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

def process_business_core(source_path: Path) -> List[Dict[str, str]]:
    """Process Business.Core.tsv and add id and type columns."""
    rows = read_tsv(source_path)
    processed = []

    for row in rows:
        original_id = row['id']
        # Generate URL-friendly ID from the original ID
        url_id = to_url_friendly_id(original_id)

        # Determine type based on the description and modifiers
        if 'Department' in original_id:
            type_val = 'BusinessDepartment'
        elif 'Process' in original_id:
            type_val = 'BusinessProcess'
        elif 'Task' in original_id:
            type_val = 'BusinessTask'
        elif 'Resource' in original_id:
            type_val = 'BusinessResource'
        elif 'Metric' in original_id:
            type_val = 'BusinessMetric'
        elif 'Goal' in original_id:
            type_val = 'BusinessGoal'
        elif 'Structure' in original_id:
            type_val = 'LegalStructure'
        elif 'Model' in original_id:
            type_val = 'RevenueModel'
        elif 'Location' in original_id:
            type_val = 'BusinessLocation'
        elif 'Relationship' in original_id:
            type_val = 'StakeholderRelationship'
        elif 'Requirement' in original_id:
            type_val = 'ComplianceRequirement'
        elif 'Risk' in original_id:
            type_val = 'BusinessRisk'
        elif 'Strategy' in original_id:
            type_val = 'RiskMitigationStrategy'
        elif 'Capability' in original_id:
            type_val = 'BusinessCapability'
        else:
            type_val = 'Business'

        processed_row = {
            'id': url_id,
            'type': type_val,
            **row
        }
        processed.append(processed_row)

    return processed

def process_departments(source_path: Path) -> List[Dict[str, str]]:
    """Process Department.Types.tsv and add id and type columns."""
    rows = read_tsv(source_path)
    processed = []

    for row in rows:
        original_id = row['id']
        # Generate URL-friendly ID from the original ID
        url_id = to_url_friendly_id(original_id)

        processed_row = {
            'id': url_id,
            'type': 'Department',
            **row
        }
        processed.append(processed_row)

    return processed

def process_local_business(source_path: Path) -> List[Dict[str, str]]:
    """Process LocalBusiness.tsv and add id and type columns."""
    rows = read_tsv(source_path)
    processed = []

    for row in rows:
        original_id = row['id']
        # Generate URL-friendly ID from the original ID
        url_id = to_url_friendly_id(original_id)

        # Use the URL ID as the type for specific business types
        # For the base LocalBusiness, keep it as LocalBusiness
        type_val = url_id

        processed_row = {
            'id': url_id,
            'type': type_val,
            **row
        }
        processed.append(processed_row)

    return processed

def process_online_business(source_path: Path) -> List[Dict[str, str]]:
    """Process OnlineBusiness.tsv and add id and type columns."""
    rows = read_tsv(source_path)
    processed = []

    for row in rows:
        original_id = row['id']
        # Generate URL-friendly ID from the original ID
        url_id = to_url_friendly_id(original_id)

        # Use the URL ID as the type for specific business types
        type_val = url_id

        processed_row = {
            'id': url_id,
            'type': type_val,
            **row
        }
        processed.append(processed_row)

    return processed

def main():
    # Define paths
    project_root = Path('/Users/nathanclevenger/projects/graph.org.ai')
    source_dir = project_root / '.source' / 'Business'
    data_dir = project_root / '.data'

    # Process each file
    print("Processing Business.Core.tsv...")
    business_core = process_business_core(source_dir / 'Business.Core.tsv')
    print(f"  Processed {len(business_core)} business core types")

    print("\nProcessing Department.Types.tsv...")
    departments = process_departments(source_dir / 'Department.Types.tsv')
    print(f"  Processed {len(departments)} department types")

    print("\nProcessing LocalBusiness.tsv...")
    local_business = process_local_business(source_dir / 'LocalBusiness.tsv')
    print(f"  Processed {len(local_business)} local business types")

    print("\nProcessing OnlineBusiness.tsv...")
    online_business = process_online_business(source_dir / 'OnlineBusiness.tsv')
    print(f"  Processed {len(online_business)} online business types")

    # Consolidate all business types
    all_business_types = business_core + local_business + online_business

    # Define fieldnames for output
    business_fieldnames = ['id', 'type', 'description', 'baseNoun', 'modifiers', 'category',
                          'source', 'relationships', 'properties', 'examples',
                          'keyCharacteristics', 'typicalDepartments', 'typicalIndustries', 'keyProcesses',
                          'keyFunctions', 'typicalOccupations', 'commonProcesses', 'reportsTo']

    department_fieldnames = ['id', 'type', 'description', 'baseNoun', 'modifiers', 'category',
                            'source', 'keyFunctions', 'typicalOccupations', 'commonProcesses', 'reportsTo']

    # Write output files
    print("\nWriting BusinessTypes.tsv...")
    write_tsv(data_dir / 'BusinessTypes.tsv', all_business_types, business_fieldnames)
    print(f"  Wrote {len(all_business_types)} business types")

    print("\nWriting Departments.tsv...")
    write_tsv(data_dir / 'Departments.tsv', departments, department_fieldnames)
    print(f"  Wrote {len(departments)} departments")

    # Print samples
    print("\n" + "="*80)
    print("SAMPLE BUSINESS TYPES:")
    print("="*80)
    for i, row in enumerate(all_business_types[:5]):
        print(f"\n{i+1}. ID: {row['id']}")
        print(f"   Type: {row['type']}")
        print(f"   Description: {row['description']}")

    print("\n" + "="*80)
    print("SAMPLE DEPARTMENTS:")
    print("="*80)
    for i, row in enumerate(departments[:5]):
        print(f"\n{i+1}. ID: {row['id']}")
        print(f"   Type: {row['type']}")
        print(f"   Description: {row['description']}")
        print(f"   Reports To: {row.get('reportsTo', 'N/A')}")

    print("\n" + "="*80)
    print("RELATIONSHIP FILES TO PROCESS LATER:")
    print("="*80)
    relationship_files = list(source_dir.glob('*.Relationships.tsv'))
    for rel_file in relationship_files:
        print(f"  - {rel_file.name}")

    print("\n" + "="*80)
    print("SUMMARY:")
    print("="*80)
    print(f"Total Business Types Generated: {len(all_business_types)}")
    print(f"  - Business Core Types: {len(business_core)}")
    print(f"  - Local Business Types: {len(local_business)}")
    print(f"  - Online Business Types: {len(online_business)}")
    print(f"Total Department Types Generated: {len(departments)}")
    print(f"Relationship Files Found: {len(relationship_files)}")
    print("\nOutput files:")
    print(f"  - {data_dir / 'BusinessTypes.tsv'}")
    print(f"  - {data_dir / 'Departments.tsv'}")

if __name__ == '__main__':
    main()
