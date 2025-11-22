import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MdxDbFs, MdxDbFsCollection } from '../src/fs/index.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('MdxDbFsCollection', () => {
  let testDir: string;
  let db: MdxDbFs;
  let collection: MdxDbFsCollection<any>;

  beforeEach(async () => {
    // Create temp directory
    testDir = path.join(os.tmpdir(), `mdxdb-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    db = new MdxDbFs(testDir);
    collection = db.collection('test');
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('create', () => {
    it('should handle numeric id by converting to string', async () => {
      const doc = {
        id: 12345,
        name: 'Test Document',
        description: 'Test with numeric ID'
      };

      const result = await collection.create(doc);

      expect(result).toBeDefined();
      expect(result.id).toBe(12345);

      // Check file was created with string filename
      const filePath = path.join(testDir, 'test', '12345.md');
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should handle string id', async () => {
      const doc = {
        id: 'test-slug',
        name: 'Test Document',
        description: 'Test with string ID'
      };

      const result = await collection.create(doc);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-slug');

      const filePath = path.join(testDir, 'test', 'test-slug.md');
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should handle $id URL by extracting last segment', async () => {
      const doc = {
        id: 'test-id',
        $id: 'https://example.com/collection/test-id',
        name: 'Test Document'
      };

      const result = await collection.create(doc);

      // Should use local id, not extract from $id
      expect(result.id).toBe('test-id');

      const filePath = path.join(testDir, 'test', 'test-id.md');
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should throw error when id is missing', async () => {
      const doc = {
        name: 'Test Document',
        description: 'No ID provided'
      };

      await expect(collection.create(doc)).rejects.toThrow('Document requires an id');
    });
  });

  describe('get', () => {
    it('should handle numeric id when getting document', async () => {
      const doc = {
        id: 12345,
        name: 'Test Document'
      };

      await collection.create(doc);

      // Should be able to get with numeric id
      const retrieved = await collection.get(12345 as any);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Document');
    });

    it('should handle string id when getting document', async () => {
      const doc = {
        id: 'test-slug',
        name: 'Test Document'
      };

      await collection.create(doc);

      const retrieved = await collection.get('test-slug');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Document');
    });
  });
});
