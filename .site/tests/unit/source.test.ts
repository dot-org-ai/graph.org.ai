import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';

// Mock the ClickHouse client
vi.mock('@graph.org.ai/mdxdb/clickhouse-client', () => ({
  getClickHouseClient: vi.fn(() => ({
    query: vi.fn(),
  })),
}));

describe('ClickHouse Queries', () => {
  describe('getAllTypes', () => {
    it('should return array of type strings', async () => {
      const types = await clickhouseQueries.getAllTypes();
      expect(Array.isArray(types)).toBe(true);
      types.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });

    it('should return unique types', async () => {
      const types = await clickhouseQueries.getAllTypes();
      const uniqueTypes = [...new Set(types)];
      expect(types).toEqual(uniqueTypes);
    });
  });

  describe('getTypeCount', () => {
    it('should return number for valid type', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const count = await clickhouseQueries.getTypeCount(types[0]);
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return 0 for non-existent type', async () => {
      const count = await clickhouseQueries.getTypeCount('NonExistentType123456789');
      expect(count).toBe(0);
    });
  });

  describe('getSampleThingsByType', () => {
    it('should return array of things', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 3);
        expect(Array.isArray(samples)).toBe(true);
      }
    });

    it('should respect limit parameter', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const limit = 2;
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], limit);
        expect(samples.length).toBeLessThanOrEqual(limit);
      }
    });

    it('should return things with required properties', async () => {
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
        }
      }
    });

    it('should filter for TitleCase names', async () => {
      const types = await clickhouseQueries.getAllTypes();
      if (types.length > 0) {
        const samples = await clickhouseQueries.getSampleThingsByType(types[0], 5);
        samples.forEach(thing => {
          // Should contain at least one uppercase followed by lowercase
          expect(thing.id).toMatch(/[A-Z][a-z]/);
          // Should not contain dashes, underscores, or dots
          expect(thing.id).not.toContain('-');
          expect(thing.id).not.toContain('_');
          expect(thing.id).not.toContain('.');
          // Should be longer than 3 characters
          expect(thing.id.length).toBeGreaterThan(3);
        });
      }
    });
  });

  describe('getDomains', () => {
    it('should return array of domain strings', async () => {
      const domains = await clickhouseQueries.getDomains();
      expect(Array.isArray(domains)).toBe(true);
      domains.forEach(domain => {
        expect(typeof domain).toBe('string');
      });
    });

    it('should return unique domains', async () => {
      const domains = await clickhouseQueries.getDomains();
      const uniqueDomains = [...new Set(domains)];
      expect(domains).toEqual(uniqueDomains);
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
          expect(page).toBeDefined();
          if (page) {
            expect(page.url).toBe(thing.url);
          }
        }
      }
    });

    it('should return undefined for non-existent page', async () => {
      const page = await clickhouseQueries.getPage('nonexistent', ['nonexistent', 'page']);
      expect(page).toBeUndefined();
    });
  });
});
