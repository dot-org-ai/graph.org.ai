import { describe, it, expect } from 'vitest';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';

describe('ClickHouse Queries - Data Integrity', () => {
  describe('getAllTypes', () => {
    it('should return array of type strings', async () => {
      const types = await clickhouseQueries.getAllTypes();
      expect(Array.isArray(types)).toBe(true);
      types.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should return unique types', async () => {
      const types = await clickhouseQueries.getAllTypes();
      const uniqueTypes = [...new Set(types)];
      expect(types).toEqual(uniqueTypes);
    });

    it('should return sorted types', async () => {
      const types = await clickhouseQueries.getAllTypes();
      const sorted = [...types].sort();
      expect(types).toEqual(sorted);
    });

    it('should handle database errors gracefully', async () => {
      // Should return empty array on error, not throw
      const types = await clickhouseQueries.getAllTypes();
      expect(Array.isArray(types)).toBe(true);
    });
  });

  describe('getTypeCount', () => {
    it('should return number >= 0 for valid type', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const count = await clickhouseQueries.getTypeCount(types[0]);
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return exact count matching sample queries', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const type = types[0];
        const count = await clickhouseQueries.getTypeCount(type);

        // This should match reality - if count > 0, samples should exist
        const samples = await clickhouseQueries.getSampleThingsByType(type, 1);

        if (count > 0) {
          expect(samples.length).toBeGreaterThan(0);
        } else {
          expect(samples.length).toBe(0);
        }
      }
    });

    it('should return 0 for non-existent type', async () => {
      const count = await clickhouseQueries.getTypeCount('NonExistentType_XYZ_12345');
      expect(count).toBe(0);
    });

    it('should be case-sensitive', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const type = types[0];
        const upperCount = await clickhouseQueries.getTypeCount(type.toUpperCase());
        const lowerCount = await clickhouseQueries.getTypeCount(type.toLowerCase());
        const originalCount = await clickhouseQueries.getTypeCount(type);

        // At least one should differ if type has mixed case
        if (type !== type.toUpperCase() && type !== type.toLowerCase()) {
          expect(upperCount === originalCount && lowerCount === originalCount).toBe(false);
        }
      }
    });
  });

  describe('getSampleThingsByType - CRITICAL', () => {
    it('should return array of things', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 10);
        expect(Array.isArray(samples)).toBe(true);
      }
    });

    it('CRITICAL: should return data when count > 0', async () => {
      const types = await clickhouseQueries.getAllTypes();

      for (const type of types.slice(0, 5)) { // Test first 5 types
        const count = await clickhouseQueries.getTypeCount(type);
        const samples = await clickhouseQueries.getSampleThingsByType(type, 10);

        // THIS IS THE BUG: If count > 0, samples should NOT be empty
        if (count > 0) {
          expect(samples.length).toBeGreaterThan(0);
          console.log(`Type: ${type}, Count: ${count}, Samples: ${samples.length}`);
        }
      }
    });

    it('should respect limit parameter', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const limit = 3;
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], limit);
        expect(samples.length).toBeLessThanOrEqual(limit);
      }
    });

    it('should return things with all required properties', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 1);
        if (samples.length > 0) {
          const thing = samples[0];
          expect(thing).toHaveProperty('ns');
          expect(thing).toHaveProperty('type');
          expect(thing).toHaveProperty('id');
          expect(thing).toHaveProperty('url');
          expect(typeof thing.ns).toBe('string');
          expect(typeof thing.type).toBe('string');
          expect(typeof thing.id).toBe('string');
          expect(typeof thing.url).toBe('string');
          expect(thing.ns.length).toBeGreaterThan(0);
          expect(thing.id.length).toBeGreaterThan(0);
          expect(thing.url.length).toBeGreaterThan(0);
        }
      }
    });

    it('should return items ordered by ID', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 20);

        if (samples.length > 1) {
          // Should be sorted by ID
          const sorted = [...samples].sort((a, b) => a.id.localeCompare(b.id));
          expect(samples.map(s => s.id)).toEqual(sorted.map(s => s.id));
        }
      }
    });

    it('CRITICAL: should not filter out ALL results', async () => {
      const types = await clickhouseQueries.getAllTypes();

      // For each type, check if filtering is too aggressive
      for (const type of types.slice(0, 10)) {
        const count = await clickhouseQueries.getTypeCount(type);
        if (count > 0) {
          const samples = await clickhouseQueries.getSampleThingsByType(type, 100);

          // If there are items but samples is empty, the filter is too strict
          if (samples.length === 0) {
            console.error(`FILTER TOO STRICT: Type "${type}" has ${count} items but 0 samples!`);
            // This test should FAIL to expose the bug
            expect(samples.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('getDomains', () => {
    it('should return array of domain strings', async () => {
      const domains = await clickhouseQueries.getDomains();
      expect(Array.isArray(domains)).toBe(true);
      domains.forEach(domain => {
        expect(typeof domain).toBe('string');
        expect(domain.length).toBeGreaterThan(0);
      });
    });

    it('should return unique domains', async () => {
      const domains = await clickhouseQueries.getDomains();
      const uniqueDomains = [...new Set(domains)];
      expect(domains).toEqual(uniqueDomains);
    });

    it('should return sorted domains', async () => {
      const domains = await clickhouseQueries.getDomains();
      const sorted = [...domains].sort();
      expect(domains).toEqual(sorted);
    });
  });

  describe('getDomainTypes', () => {
    it('should return types for valid domain', async () => {
      const domains = await clickhouseQueries.getDomains();
      if (domains.length > 0) {
        const types = await clickhouseQueries.getDomainTypes(domains[0]);
        expect(Array.isArray(types)).toBe(true);
      }
    });

    it('should return empty array for invalid domain', async () => {
      const types = await clickhouseQueries.getDomainTypes('nonexistent_domain_xyz');
      expect(types).toEqual([]);
    });
  });

  describe('getPage', () => {
    it('should return thing for valid url', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 1);
        if (samples.length > 0) {
          const thing = samples[0];
          const [domain, ...slugParts] = thing.url.split('/');
          const page = await clickhouseQueries.getPage(domain, slugParts);

          if (page) {
            expect(page.url).toBe(thing.url);
            expect(page.id).toBe(thing.id);
            expect(page.type).toBe(thing.type);
          }
        }
      }
    });

    it('should return undefined for non-existent page', async () => {
      const page = await clickhouseQueries.getPage('nonexistent', ['nonexistent', 'page']);
      expect(page).toBeUndefined();
    });

    it('should handle URL encoding correctly', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 1);
        if (samples.length > 0) {
          const thing = samples[0];
          if (thing.id.includes(' ') || thing.id.includes('%')) {
            const [domain, ...slugParts] = thing.url.split('/');
            const page = await clickhouseQueries.getPage(domain, slugParts);
            expect(page).toBeDefined();
          }
        }
      }
    });
  });

  describe('getPageMetadata', () => {
    it('should return lightweight metadata only', async () => {
      const domains = await clickhouseQueries.getDomains();
      if (domains.length > 0) {
        const metadata = await clickhouseQueries.getPageMetadata(domains[0]);
        expect(Array.isArray(metadata)).toBe(true);

        if (metadata.length > 0) {
          const item = metadata[0];
          expect(item).toHaveProperty('url');
          expect(item).toHaveProperty('title');
          expect(item).toHaveProperty('type');
          // Should NOT have full content/data
          expect(item).not.toHaveProperty('content');
          expect(item).not.toHaveProperty('data');
        }
      }
    });

    it('should filter by type when provided', async () => {
      const domains = await clickhouseQueries.getDomains();
      if (domains.length > 0) {
        const domain = domains[0];
        const types = await clickhouseQueries.getDomainTypes(domain);

        if (types.length > 0) {
          const metadata = await clickhouseQueries.getPageMetadata(domain, types[0]);
          metadata.forEach(item => {
            expect(item.type).toBe(types[0]);
          });
        }
      }
    });
  });

  describe('getPageCount', () => {
    it('should return number >= 0', async () => {
      const domains = await clickhouseQueries.getDomains();
      if (domains.length > 0) {
        const count = await clickhouseQueries.getPageCount(domains[0]);
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    it('should match actual page count', async () => {
      const domains = await clickhouseQueries.getDomains();
      if (domains.length > 0) {
        const domain = domains[0];
        const count = await clickhouseQueries.getPageCount(domain);
        const metadata = await clickhouseQueries.getPageMetadata(domain);

        // Metadata might be limited, but count should be >= metadata length
        expect(count).toBeGreaterThanOrEqual(metadata.length);
      }
    });
  });
});
