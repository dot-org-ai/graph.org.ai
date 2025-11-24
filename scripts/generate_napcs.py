#!/usr/bin/env python3
"""
Generate NAPCS services classification file.
Converts NAPCS structure to TSV with name-based IDs.
"""

import csv
import re
from pathlib import Path

def clean_name(name):
    """Clean and normalize a name string."""
    if not name:
        return ''
    # Remove quotes and extra whitespace
    name = name.strip().strip('"').strip()
    # Handle tabs and normalize whitespace
    name = re.sub(r'\s+', ' ', name)
    return name

def name_to_id(name):
    """Convert a name to a valid ID (PascalCase)."""
    # Clean the name first
    name = clean_name(name)

    if not name:
        return 'Service'

    # Remove parenthetical content
    name = re.sub(r'\([^)]*\)', '', name)

    # Remove special characters and split into words
    # Keep hyphens as word separators
    name = re.sub(r'[^\w\s-]', ' ', name)

    # Split on whitespace and hyphens
    words = re.split(r'[\s-]+', name)

    # Filter out empty strings and common words
    stop_words = {'and', 'or', 'of', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'nec'}
    words = [w for w in words if w and w.lower() not in stop_words]

    # Convert to PascalCase
    # Handle acronyms (all caps) by keeping them as-is
    pascal_words = []
    for word in words:
        if word.isupper() and len(word) > 1:
            # Keep acronyms as-is
            pascal_words.append(word)
        else:
            # Capitalize first letter, lowercase rest
            pascal_words.append(word.capitalize())

    # Join and ensure it starts with a letter
    id_str = ''.join(pascal_words)

    # If empty or starts with number, prefix with 'Service'
    if not id_str or id_str[0].isdigit():
        id_str = 'Service' + id_str

    return id_str

def get_type_from_level(level, code_title):
    """Determine the type based on hierarchical level."""
    level_map = {
        '1': 'ServiceGroup',
        '2': 'ServiceClass',
        '3': 'ServiceSubclass',
        '4': 'Service'
    }
    return level_map.get(level, 'Service')

def clean_description(desc):
    """Clean description text."""
    if not desc:
        return ''
    # Remove quotes
    desc = desc.strip().strip('"').strip()
    # Normalize whitespace but keep meaningful spaces
    desc = re.sub(r'\s+', ' ', desc)
    return desc

def main():
    source_file = Path('/Users/nathanclevenger/projects/graph.org.ai/.source/NAPCS/NAPCS.NAPCS2022Structure.tsv')
    output_file = Path('/Users/nathanclevenger/projects/graph.org.ai/.data/Services.NAPCS.tsv')

    # Ensure output directory exists
    output_file.parent.mkdir(parents=True, exist_ok=True)

    services = []
    stats = {
        'total': 0,
        'groups': 0,
        'classes': 0,
        'subclasses': 0,
        'details': 0,
        'skipped': 0
    }

    # Track IDs to handle duplicates
    id_counts = {}

    with open(source_file, 'r', encoding='utf-8', newline='') as f:
        # Use csv.QUOTE_NONE to avoid issues with quotes in data
        reader = csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE)

        for row in reader:
            level = (row.get('level') or '').strip()
            code = (row.get('code') or '').strip()
            parent = (row.get('parent') or '').strip()
            code_title = clean_name(row.get('codeTitle') or '')
            definition = clean_description(row.get('codeDefinition') or '')
            hierarchy = (row.get('hierarchicalStructure') or '').strip()

            # Skip empty rows
            if not code_title or not code:
                stats['skipped'] += 1
                continue

            # Generate name-based ID
            base_id = name_to_id(code_title)

            # Handle duplicates by appending the code
            if base_id in id_counts:
                id_counts[base_id] += 1
                service_id = f"{base_id}{code}"
            else:
                id_counts[base_id] = 1
                service_id = base_id

            # Determine type
            service_type = get_type_from_level(level, code_title)

            # Build service record
            service = {
                'id': service_id,
                'type': service_type,
                'code': code,
                'parent': parent,
                'name': code_title,
                'description': definition,
                'level': level,
                'hierarchy': hierarchy
            }

            services.append(service)
            stats['total'] += 1

            # Track level stats
            if hierarchy == 'Group':
                stats['groups'] += 1
            elif hierarchy == 'Class':
                stats['classes'] += 1
            elif hierarchy == 'Subclass':
                stats['subclasses'] += 1
            elif hierarchy == 'Detail':
                stats['details'] += 1

    # Write output file
    if services:
        fieldnames = ['id', 'type', 'code', 'parent', 'name', 'description', 'level', 'hierarchy']

        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t', quoting=csv.QUOTE_MINIMAL)
            writer.writeheader()
            writer.writerows(services)

    # Print stats
    print(f"NAPCS Services Generation Complete")
    print(f"=" * 50)
    print(f"Total services: {stats['total']}")
    print(f"  - Groups: {stats['groups']}")
    print(f"  - Classes: {stats['classes']}")
    print(f"  - Subclasses: {stats['subclasses']}")
    print(f"  - Details: {stats['details']}")
    print(f"Skipped: {stats['skipped']}")
    print(f"\nOutput: {output_file}")

    # Print sample records showing ID vs code separation
    print(f"\nSample records showing ID vs Code:")
    print("-" * 80)
    for i, service in enumerate(services[:10]):
        print(f"{i+1}. ID: {service['id']:30s} Code: {service['code']:10s} Name: {service['name']}")

    # Print some actual service examples (Detail level)
    print(f"\nSample Detail-level services:")
    print("-" * 80)
    detail_services = [s for s in services if s['hierarchy'] == 'Detail']

    # Get a variety of examples from different parts
    example_indices = [0, len(detail_services)//4, len(detail_services)//2, 3*len(detail_services)//4, -1]
    for idx in example_indices[:5]:
        if 0 <= idx < len(detail_services) or idx == -1:
            service = detail_services[idx]
            print(f"\nID: {service['id']}")
            print(f"Code: {service['code']}")
            print(f"Name: {service['name']}")
            print(f"Description: {service['description'][:100]}{'...' if len(service['description']) > 100 else ''}")

    # Show hierarchy levels
    print(f"\nHierarchy Levels:")
    print("-" * 80)
    print(f"Level 1 (Groups): {stats['groups']} entries")
    print(f"Level 2 (Classes): {stats['classes']} entries")
    print(f"Level 3 (Subclasses): {stats['subclasses']} entries")
    print(f"Level 4 (Details): {stats['details']} entries")

if __name__ == '__main__':
    main()
