/**
 * Utilities for building hierarchical sidebar structures
 */

import type { PageMetadata } from '@graph.org.ai/mdxdb/clickhouse-queries';
import type * as PageTree from 'fumadocs-core/page-tree';

/**
 * Build hierarchical tree for UNSPSC domain
 * Hierarchy: Segment (XX000000) → Family (XXXX0000) → Class (XXXXXX00) → Commodity (XXXXXXXX)
 */
export function buildUNSPSCHierarchy(items: PageMetadata[]): PageTree.Node[] {
  // Separate by type
  const segments = items.filter(i => i.title.endsWith('000000'));
  const families = items.filter(i => i.title.endsWith('00000') && !i.title.endsWith('000000'));
  const classes = items.filter(i => i.title.endsWith('00') && !i.title.endsWith('0000'));
  const commodities = items.filter(i => !i.title.endsWith('00'));

  // Build hierarchy bottom-up
  const hierarchyMap = new Map<string, PageTree.Node>();

  // Add commodities as leaf nodes
  commodities.forEach(comm => {
    hierarchyMap.set(comm.title, {
      type: 'page' as const,
      name: comm.title,
      url: comm.url,
    });
  });

  // Add classes as folders containing commodities
  classes.forEach(cls => {
    const classCode = cls.title;
    const childCommodities = commodities
      .filter(c => c.title.startsWith(classCode.substring(0, 6)) && c.title !== classCode)
      .map(c => hierarchyMap.get(c.title)!)
      .filter(Boolean);

    hierarchyMap.set(classCode, {
      type: 'folder' as const,
      name: classCode,
      index: {
        type: 'page' as const,
        name: classCode,
        url: cls.url,
      },
      children: childCommodities,
    });
  });

  // Add families as folders containing classes
  families.forEach(fam => {
    const famCode = fam.title;
    const childClasses = classes
      .filter(c => c.title.startsWith(famCode.substring(0, 4)) && c.title !== famCode)
      .map(c => hierarchyMap.get(c.title)!)
      .filter(Boolean);

    hierarchyMap.set(famCode, {
      type: 'folder' as const,
      name: famCode,
      index: {
        type: 'page' as const,
        name: famCode,
        url: fam.url,
      },
      children: childClasses,
    });
  });

  // Add segments as top-level folders containing families
  const segmentNodes = segments.map(seg => {
    const segCode = seg.title;
    const childFamilies = families
      .filter(f => f.title.startsWith(segCode.substring(0, 2)) && f.title !== segCode)
      .map(f => hierarchyMap.get(f.title)!)
      .filter(Boolean);

    return {
      type: 'folder' as const,
      name: segCode,
      index: {
        type: 'page' as const,
        name: segCode,
        url: seg.url,
      },
      children: childFamilies,
    };
  });

  return segmentNodes;
}

/**
 * Build hierarchical tree for O*NET domain
 * Group by type: Occupations, Tasks, Skills, etc.
 */
export function buildONETHierarchy(items: PageMetadata[]): PageTree.Node[] {
  const typeGroups = new Map<string, PageMetadata[]>();

  items.forEach(item => {
    if (!typeGroups.has(item.type)) {
      typeGroups.set(item.type, []);
    }
    typeGroups.get(item.type)!.push(item);
  });

  console.log(`[buildONETHierarchy] Found ${typeGroups.size} types:`, Array.from(typeGroups.keys()));

  const MAX_ITEMS_PER_TYPE = 100;

  return Array.from(typeGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, typeItems]) => {
      const sortedItems = typeItems.sort((a, b) => a.title.localeCompare(b.title));
      const displayItems = sortedItems.slice(0, MAX_ITEMS_PER_TYPE);

      const children: PageTree.Node[] = displayItems.map(item => ({
        type: 'page' as const,
        name: item.title,
        url: item.url,
      }));

      if (sortedItems.length > MAX_ITEMS_PER_TYPE) {
        children.push({
          type: 'page' as const,
          name: `... and ${sortedItems.length - MAX_ITEMS_PER_TYPE} more`,
          url: `/${type}`,
        });
      }

      return {
        type: 'folder' as const,
        name: `${type} (${sortedItems.length})`,
        index: {
          type: 'page' as const,
          name: `All ${type}s`,
          url: `/${type}`,
        },
        children,
      };
    });
}

/**
 * Build hierarchical tree for APQC domain
 * Processes are hierarchical by nature
 */
export function buildAPQCHierarchy(items: PageMetadata[]): PageTree.Node[] {
  // APQC processes likely have codes like 1.0, 1.1, 1.1.1
  // For now, just group them alphabetically
  const MAX_ITEMS = 100;
  const sorted = items.sort((a, b) => a.title.localeCompare(b.title));
  const displayItems = sorted.slice(0, MAX_ITEMS);

  const children: PageTree.Node[] = displayItems.map(item => ({
    type: 'page' as const,
    name: item.title,
    url: item.url,
  }));

  if (sorted.length > MAX_ITEMS) {
    children.push({
      type: 'page' as const,
      name: `... and ${sorted.length - MAX_ITEMS} more`,
      url: `/Process`,
    });
  }

  return children;
}

/**
 * Build generic flat hierarchy for other domains
 */
export function buildFlatHierarchy(items: PageMetadata[]): PageTree.Node[] {
  const MAX_ITEMS = 100;
  const sorted = items.sort((a, b) => a.title.localeCompare(b.title));
  const displayItems = sorted.slice(0, MAX_ITEMS);

  const children: PageTree.Node[] = displayItems.map(item => ({
    type: 'page' as const,
    name: item.title,
    url: item.url,
  }));

  if (sorted.length > MAX_ITEMS) {
    children.push({
      type: 'page' as const,
      name: `... and ${sorted.length - MAX_ITEMS} more`,
      url: `/docs/${items[0]?.url.split('/')[0] || ''}`,
    });
  }

  return children;
}
