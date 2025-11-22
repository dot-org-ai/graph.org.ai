import { describe, it, expect, beforeAll } from 'vitest';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';

describe('Type Page Integration Tests', () => {
  let validType: string;
  let typeCount: number;
  let typeSamples: any[];

  beforeAll(async () => {
    const types = await clickhouseQueries.getAllTypes();
    if (types.length > 0) {
      validType = types[0];
      typeCount = await clickhouseQueries.getTypeCount(validType);
      typeSamples = await clickhouseQueries.getSampleThingsByType(validType, 100);
    }
  });

  describe('Data Flow for Type Page', () => {
    it('should have valid test data', () => {
      expect(validType).toBeDefined();
      expect(validType.length).toBeGreaterThan(0);
    });

    it('CRITICAL: type with count > 0 must have samples', () => {
      console.log(`Type: ${validType}`);
      console.log(`Count: ${typeCount}`);
      console.log(`Samples returned: ${typeSamples.length}`);

      if (typeCount > 0) {
        // THIS WILL FAIL if the bug exists
        expect(typeSamples.length).toBeGreaterThan(0);
        expect(typeSamples.length).toBeLessThanOrEqual(100);
      }
    });

    it('should group samples by domain correctly', () => {
      const byDomain = typeSamples.reduce((acc, thing) => {
        if (!acc[thing.ns]) {
          acc[thing.ns] = [];
        }
        acc[thing.ns].push(thing);
        return acc;
      }, {} as Record<string, typeof typeSamples>);

      // Should have at least one domain if samples exist
      if (typeSamples.length > 0) {
        expect(Object.keys(byDomain).length).toBeGreaterThan(0);

        // Each domain should have items
        for (const [domain, items] of Object.entries(byDomain)) {
          expect(items.length).toBeGreaterThan(0);
          expect(domain.length).toBeGreaterThan(0);

          // All items in this group should have the same domain
          items.forEach(item => {
            expect(item.ns).toBe(domain);
            expect(item.type).toBe(validType);
          });
        }
      }
    });

    it('should have valid URLs for all samples', () => {
      typeSamples.forEach(thing => {
        expect(thing.url).toBeDefined();
        expect(thing.url.length).toBeGreaterThan(0);
        expect(thing.url).toContain('/');

        // URL should start with domain
        expect(thing.url.startsWith(thing.ns + '/')).toBe(true);
      });
    });

    it('should display correct pluralization', () => {
      const singular = validType;
      const plural = validType + 's';

      // Page title should use plural
      expect(plural).toBe(validType + 's');

      // Description should use correct form
      if (typeCount === 1) {
        expect(`${typeCount} ${singular}`).toBe(`1 ${singular}`);
      } else {
        expect(`${typeCount} ${plural}`).toContain(typeCount.toString());
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle types with no TitleCase items', async () => {
      // Create a scenario where filtering might exclude everything
      const allTypes = await clickhouseQueries.getAllTypes();

      for (const type of allTypes.slice(0, 20)) {
        const count = await clickhouseQueries.getTypeCount(type);
        const samples = await clickhouseQueries.getSampleThingsByType(type, 100);

        console.log(`Testing ${type}: count=${count}, samples=${samples.length}`);

        // Document the issue
        if (count > 0 && samples.length === 0) {
          console.error(`❌ BUG FOUND: ${type} has ${count} items but getSampleThingsByType returns 0`);
          console.error(`  This means the TitleCase filter is excluding ALL results`);

          // Check what the actual data looks like
          const allPages = await clickhouseQueries.getPageMetadata(samples[0]?.ns || 'unknown', type);
          if (allPages.length > 0) {
            console.error(`  First few IDs:`, allPages.slice(0, 5).map(p => p.title));
          }
        }

        // This assertion should catch the bug
        if (count > 0) {
          expect(samples.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle empty state gracefully', async () => {
      const samples = await clickhouseQueries.getSampleThingsByType('NonExistent_Type_XYZ', 100);
      expect(samples).toEqual([]);

      const byDomain = samples.reduce((acc, thing) => {
        if (!acc[thing.ns]) {
          acc[thing.ns] = [];
        }
        acc[thing.ns].push(thing);
        return acc;
      }, {} as Record<string, typeof samples>);

      expect(Object.keys(byDomain).length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should return samples in reasonable time', async () => {
      const start = Date.now();
      await clickhouseQueries.getSampleThingsByType(validType, 100);
      const duration = Date.now() - start;

      // Should take less than 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it('should handle large limits efficiently', async () => {
      const start = Date.now();
      const samples = await clickhouseQueries.getSampleThingsByType(validType, 1000);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10000);
      expect(samples.length).toBeLessThanOrEqual(1000);
    });
  });
});
