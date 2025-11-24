#!/usr/bin/env python3
"""
Process AdvanceCTE data files to generate CareerClusters.tsv and EducationPrograms.tsv
with name-based IDs and comprehensive relationship mappings.
"""

import csv
import re
from collections import defaultdict
from pathlib import Path

def slugify(text):
    """Convert text to a URL-friendly slug for use as ID."""
    # Remove special characters and convert to lowercase
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def read_tsv(filepath):
    """Read a TSV file and return rows as dictionaries."""
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append(row)
    return rows

def write_tsv(filepath, fieldnames, rows):
    """Write rows to a TSV file."""
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
        writer.writeheader()
        writer.writerows(rows)

def main():
    # Define paths
    base_dir = Path('/Users/nathanclevenger/projects/graph.org.ai')
    source_dir = base_dir / '.source' / 'AdvanceCTE'
    data_dir = base_dir / '.data'
    data_dir.mkdir(exist_ok=True)

    # Read source files
    print("Reading source files...")
    soc_cc = read_tsv(source_dir / 'AdvanceCTE.SOC-CareerClusters.SOC---CC---Sub-Clusters.tsv')
    cip_cc = read_tsv(source_dir / 'AdvanceCTE.CIP-CareerClusters.CIP---CC---Sub-Clusters.tsv')
    full_crosswalk = read_tsv(source_dir / 'AdvanceCTE.FullCrosswalk.SOC---CIP---CC.tsv')

    print(f"Loaded {len(soc_cc)} SOC-CC mappings")
    print(f"Loaded {len(cip_cc)} CIP-CC mappings")
    print(f"Loaded {len(full_crosswalk)} full crosswalk entries")

    # Build career cluster data structures
    clusters = {}
    subclusters = {}
    cluster_naics = defaultdict(set)
    cluster_socs = defaultdict(set)
    cluster_cips = defaultdict(set)
    subcluster_to_cluster = {}

    # Process full crosswalk for NAICS mappings and complete data
    for row in full_crosswalk:
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()
        naics_2digit = row.get('2DigitNAICS', '').strip()
        soc_code = row.get('sOCCode', '').strip()
        cip_code = row.get('cIPCode2020)', '').strip()

        if not cluster:
            continue

        cluster_id = slugify(cluster)
        clusters[cluster_id] = cluster

        if subcluster:
            subcluster_id = f"{cluster_id}/{slugify(subcluster)}"
            subclusters[subcluster_id] = subcluster
            subcluster_to_cluster[subcluster_id] = cluster_id

        if naics_2digit:
            cluster_naics[cluster_id].add(naics_2digit)

        if soc_code:
            cluster_socs[cluster_id].add(soc_code)

        if cip_code:
            cluster_cips[cluster_id].add(cip_code)

    # Also process SOC-CC mappings
    for row in soc_cc:
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()
        soc_code = row['sOCCode'].strip()

        if not cluster:
            continue

        cluster_id = slugify(cluster)
        clusters[cluster_id] = cluster

        if subcluster:
            subcluster_id = f"{cluster_id}/{slugify(subcluster)}"
            subclusters[subcluster_id] = subcluster
            subcluster_to_cluster[subcluster_id] = cluster_id

        if soc_code:
            cluster_socs[cluster_id].add(soc_code)

    # Generate CareerClusters.tsv
    print("\nGenerating CareerClusters.tsv...")
    career_cluster_rows = []

    for cluster_id in sorted(clusters.keys()):
        cluster_name = clusters[cluster_id]
        naics_codes = sorted(cluster_naics[cluster_id])
        soc_codes = sorted(cluster_socs[cluster_id])
        cip_codes = sorted(cluster_cips[cluster_id])

        # Find subclusters for this cluster
        cluster_subclusters = [sc_id for sc_id in subclusters.keys() if sc_id.startswith(f"{cluster_id}/")]

        career_cluster_rows.append({
            'id': cluster_id,
            'name': cluster_name,
            'subclusters': len(cluster_subclusters),
            'naics_codes': ','.join(naics_codes),
            'soc_count': len(soc_codes),
            'cip_count': len(cip_codes),
            'description': f'{cluster_name} career cluster with {len(cluster_subclusters)} sub-clusters'
        })

    write_tsv(
        data_dir / 'CareerClusters.tsv',
        ['id', 'name', 'subclusters', 'naics_codes', 'soc_count', 'cip_count', 'description'],
        career_cluster_rows
    )

    print(f"Generated {len(career_cluster_rows)} career clusters")

    # Generate SubClusters.tsv
    print("\nGenerating SubClusters.tsv...")
    subcluster_rows = []
    subcluster_socs = defaultdict(set)
    subcluster_cips = defaultdict(set)

    # Count SOCs and CIPs per subcluster
    for row in soc_cc:
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()
        soc_code = row['sOCCode'].strip()

        if cluster and subcluster:
            cluster_id = slugify(cluster)
            subcluster_id = f"{cluster_id}/{slugify(subcluster)}"
            if soc_code:
                subcluster_socs[subcluster_id].add(soc_code)

    for row in cip_cc:
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()
        cip_code = row['cIPCode2020)'].strip()

        if cluster and subcluster:
            cluster_id = slugify(cluster)
            subcluster_id = f"{cluster_id}/{slugify(subcluster)}"
            if cip_code:
                subcluster_cips[subcluster_id].add(cip_code)

    for subcluster_id in sorted(subclusters.keys()):
        subcluster_name = subclusters[subcluster_id]
        cluster_id = subcluster_to_cluster[subcluster_id]
        cluster_name = clusters[cluster_id]

        subcluster_rows.append({
            'id': subcluster_id,
            'name': subcluster_name,
            'career_cluster_id': cluster_id,
            'career_cluster_name': cluster_name,
            'soc_count': len(subcluster_socs[subcluster_id]),
            'cip_count': len(subcluster_cips[subcluster_id]),
            'description': f'{subcluster_name} sub-cluster within {cluster_name}'
        })

    write_tsv(
        data_dir / 'SubClusters.tsv',
        ['id', 'name', 'career_cluster_id', 'career_cluster_name', 'soc_count', 'cip_count', 'description'],
        subcluster_rows
    )

    print(f"Generated {len(subcluster_rows)} sub-clusters")

    # Generate EducationPrograms.tsv
    print("\nGenerating EducationPrograms.tsv...")

    # Collect unique CIP codes with their titles
    cip_programs = {}
    cip_clusters = defaultdict(set)
    cip_subclusters = defaultdict(set)
    cip_socs = defaultdict(set)

    for row in cip_cc:
        cip_code = row['cIPCode2020)'].strip()
        cip_title = row['cIPTitle2020)'].strip()
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()

        if not cip_code:
            continue

        # Create name-based ID from CIP title
        cip_id = slugify(cip_title)
        cip_programs[cip_code] = {
            'id': cip_id,
            'code': cip_code,
            'title': cip_title
        }

        if cluster:
            cluster_id = slugify(cluster)
            cip_clusters[cip_code].add(cluster_id)

            if subcluster:
                subcluster_id = f"{cluster_id}/{slugify(subcluster)}"
                cip_subclusters[cip_code].add(subcluster_id)

    # Add SOC mappings from full crosswalk
    for row in full_crosswalk:
        cip_code = row.get('cIPCode2020)', '').strip()
        cip_title = row.get('cIPTitle2020)', '').strip()
        soc_code = row.get('sOCCode', '').strip()

        if cip_code and cip_title:
            if cip_code not in cip_programs:
                cip_id = slugify(cip_title)
                cip_programs[cip_code] = {
                    'id': cip_id,
                    'code': cip_code,
                    'title': cip_title
                }

            if soc_code:
                cip_socs[cip_code].add(soc_code)

    education_program_rows = []
    for cip_code in sorted(cip_programs.keys()):
        program = cip_programs[cip_code]
        clusters = sorted(cip_clusters[cip_code])
        subclusters_list = sorted(cip_subclusters[cip_code])
        socs = sorted(cip_socs[cip_code])

        education_program_rows.append({
            'id': program['id'],
            'cip_code': cip_code,
            'name': program['title'],
            'career_clusters': ','.join(clusters),
            'subclusters': ','.join(subclusters_list),
            'soc_count': len(socs),
            'description': program['title']
        })

    write_tsv(
        data_dir / 'EducationPrograms.tsv',
        ['id', 'cip_code', 'name', 'career_clusters', 'subclusters', 'soc_count', 'description'],
        education_program_rows
    )

    print(f"Generated {len(education_program_rows)} education programs")

    # Generate relationship mappings
    print("\nGenerating relationship mappings...")

    # SOC to CareerCluster mappings
    soc_cluster_mappings = []
    for row in soc_cc:
        soc_code = row['sOCCode'].strip()
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()

        if not soc_code or not cluster:
            continue

        cluster_id = slugify(cluster)
        subcluster_id = f"{cluster_id}/{slugify(subcluster)}" if subcluster else ''

        soc_cluster_mappings.append({
            'soc_code': soc_code,
            'career_cluster_id': cluster_id,
            'subcluster_id': subcluster_id
        })

    write_tsv(
        data_dir / 'SOC_CareerCluster_Mappings.tsv',
        ['soc_code', 'career_cluster_id', 'subcluster_id'],
        soc_cluster_mappings
    )

    print(f"Generated {len(soc_cluster_mappings)} SOC-to-CareerCluster mappings")

    # CIP to CareerCluster mappings
    cip_cluster_mappings = []
    for row in cip_cc:
        cip_code = row['cIPCode2020)'].strip()
        cip_title = row['cIPTitle2020)'].strip()
        cluster = row['careerCluster'].strip()
        subcluster = row['subCluster'].strip()

        if not cip_code or not cluster:
            continue

        cip_id = slugify(cip_title)
        cluster_id = slugify(cluster)
        subcluster_id = f"{cluster_id}/{slugify(subcluster)}" if subcluster else ''

        cip_cluster_mappings.append({
            'education_program_id': cip_id,
            'cip_code': cip_code,
            'career_cluster_id': cluster_id,
            'subcluster_id': subcluster_id
        })

    write_tsv(
        data_dir / 'EducationProgram_CareerCluster_Mappings.tsv',
        ['education_program_id', 'cip_code', 'career_cluster_id', 'subcluster_id'],
        cip_cluster_mappings
    )

    print(f"Generated {len(cip_cluster_mappings)} CIP-to-CareerCluster mappings")

    # SOC to CIP mappings (from full crosswalk)
    soc_cip_mappings = []
    seen_pairs = set()

    for row in full_crosswalk:
        soc_code = row.get('sOCCode', '').strip()
        cip_code = row.get('cIPCode2020)', '').strip()
        cip_title = row.get('cIPTitle2020)', '').strip()
        cluster = row['careerCluster'].strip()

        if not soc_code or not cip_code:
            continue

        pair = (soc_code, cip_code)
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)

        cip_id = slugify(cip_title)
        cluster_id = slugify(cluster) if cluster else ''

        soc_cip_mappings.append({
            'soc_code': soc_code,
            'education_program_id': cip_id,
            'cip_code': cip_code,
            'career_cluster_id': cluster_id
        })

    write_tsv(
        data_dir / 'SOC_EducationProgram_Mappings.tsv',
        ['soc_code', 'education_program_id', 'cip_code', 'career_cluster_id'],
        soc_cip_mappings
    )

    print(f"Generated {len(soc_cip_mappings)} SOC-to-CIP mappings")

    # Generate summary statistics
    print("\n" + "="*80)
    print("SUMMARY STATISTICS")
    print("="*80)
    print(f"\nCareer Clusters: {len(career_cluster_rows)}")
    print(f"Sub-Clusters: {len(subcluster_rows)}")
    print(f"Education Programs (CIP codes): {len(education_program_rows)}")
    print(f"Unique SOC codes: {len(set(row['soc_code'] for row in soc_cluster_mappings))}")
    print(f"\nRelationship Mappings:")
    print(f"  SOC → Career Cluster: {len(soc_cluster_mappings)}")
    print(f"  CIP → Career Cluster: {len(cip_cluster_mappings)}")
    print(f"  SOC → CIP: {len(soc_cip_mappings)}")

    # Sample mappings
    print("\n" + "="*80)
    print("SAMPLE MAPPINGS")
    print("="*80)

    print("\nSample Career Clusters:")
    for row in career_cluster_rows[:3]:
        print(f"  {row['id']}: {row['name']}")
        print(f"    NAICS: {row['naics_codes']}")
        print(f"    {row['soc_count']} SOCs, {row['cip_count']} CIPs, {row['subclusters']} sub-clusters")

    print("\nSample Education Programs:")
    for row in education_program_rows[:3]:
        print(f"  {row['id']} ({row['cip_code']}): {row['name']}")
        print(f"    Clusters: {row['career_clusters']}")
        print(f"    {row['soc_count']} related occupations")

    print("\nSample Crosswalk (SOC → CIP → Career Cluster):")
    for row in soc_cip_mappings[:5]:
        print(f"  SOC {row['soc_code']} → CIP {row['cip_code']} ({row['education_program_id']}) → {row['career_cluster_id']}")

    print("\n" + "="*80)
    print("Files generated in .data directory:")
    print("  - CareerClusters.tsv")
    print("  - SubClusters.tsv")
    print("  - EducationPrograms.tsv")
    print("  - SOC_CareerCluster_Mappings.tsv")
    print("  - EducationProgram_CareerCluster_Mappings.tsv")
    print("  - SOC_EducationProgram_Mappings.tsv")
    print("="*80)

if __name__ == '__main__':
    main()
