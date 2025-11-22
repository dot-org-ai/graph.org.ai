import { describe, it, expect } from 'vitest';
import { buildUNSPSCHierarchy, buildONETHierarchy } from '@/lib/hierarchy';
import type { PageMetadata } from '@graph.org.ai/mdxdb/clickhouse-queries';

describe('Hierarchy Builders', () => {
  describe('buildUNSPSCHierarchy', () => {
    it('should build hierarchy from UNSPSC codes', () => {
      const items: PageMetadata[] = [
        // Segment
        { url: '/docs/unspsc.org.ai/10000000', title: '10000000', type: 'Segment' },
        // Family
        { url: '/docs/unspsc.org.ai/10100000', title: '10100000', type: 'Family' },
        // Class
        { url: '/docs/unspsc.org.ai/10101500', title: '10101500', type: 'Class' },
        // Commodities
        { url: '/docs/unspsc.org.ai/10101501', title: '10101501', type: 'Commodity' },
        { url: '/docs/unspsc.org.ai/10101502', title: '10101502', type: 'Commodity' },
      ];

      const hierarchy = buildUNSPSCHierarchy(items);

      // Should have 1 top-level segment
      expect(hierarchy.length).toBe(1);
      expect(hierarchy[0].type).toBe('folder');
      expect(hierarchy[0].name).toBe('10000000');

      // Segment should have 1 family
      const segment = hierarchy[0] as any;
      expect(segment.children.length).toBe(1);
      expect(segment.children[0].name).toBe('10100000');

      // Family should have 1 class
      const family = segment.children[0];
      expect(family.children.length).toBe(1);
      expect(family.children[0].name).toBe('10101500');

      // Class should have 2 commodities
      const cls = family.children[0];
      expect(cls.children.length).toBe(2);
      expect(cls.children[0].name).toBe('10101501');
      expect(cls.children[1].name).toBe('10101502');
    });

    it('should handle empty list', () => {
      const hierarchy = buildUNSPSCHierarchy([]);
      expect(hierarchy).toEqual([]);
    });
  });

  describe('buildONETHierarchy', () => {
    it('should group by type', () => {
      const items: PageMetadata[] = [
        { url: '/docs/onet.org.ai/11-1011.00', title: 'Chief Executives', type: 'Occupation' },
        { url: '/docs/onet.org.ai/11-1021.00', title: 'General Managers', type: 'Occupation' },
        { url: '/docs/onet.org.ai/Task1', title: 'Task 1', type: 'Task' },
        { url: '/docs/onet.org.ai/Skill1', title: 'Active Listening', type: 'Skill' },
      ];

      const hierarchy = buildONETHierarchy(items);

      // Should have 3 type folders
      expect(hierarchy.length).toBe(3);

      // Find Occupation folder
      const occFolder = hierarchy.find(n => n.name.startsWith('Occupation'));
      expect(occFolder).toBeDefined();
      expect((occFolder as any).children.length).toBe(2);
    });

    it('should sort types alphabetically', () => {
      const items: PageMetadata[] = [
        { url: '/docs/onet.org.ai/Task1', title: 'Task 1', type: 'Task' },
        { url: '/docs/onet.org.ai/Ability1', title: 'Ability 1', type: 'Ability' },
        { url: '/docs/onet.org.ai/Skill1', title: 'Skill 1', type: 'Skill' },
      ];

      const hierarchy = buildONETHierarchy(items);

      expect(hierarchy[0].name).toContain('Ability');
      expect(hierarchy[1].name).toContain('Skill');
      expect(hierarchy[2].name).toContain('Task');
    });

    it('should limit items per type and add "more" link', () => {
      const items: PageMetadata[] = [];
      // Add 150 occupations
      for (let i = 0; i < 150; i++) {
        items.push({
          url: `/docs/onet.org.ai/occ${i}`,
          title: `Occupation ${i}`,
          type: 'Occupation',
        });
      }

      const hierarchy = buildONETHierarchy(items);
      const occFolder = hierarchy[0] as any;

      // Should have 100 items + 1 "more" link
      expect(occFolder.children.length).toBe(101);
      expect(occFolder.children[100].name).toContain('and 50 more');
      expect(occFolder.children[100].url).toBe('/types/Occupation');
    });
  });
});
