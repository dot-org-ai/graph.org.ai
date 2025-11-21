import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MdxDbFs } from '../src/fs/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = path.join(__dirname, 'temp_db');

describe('MdxDbFs', () => {
  let db: MdxDbFs;

  beforeAll(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });
  
  beforeEach(async () => {
     // Clean up collections
     await fs.rm(path.join(TEST_DIR, 'Occupations'), { recursive: true, force: true });
     await fs.mkdir(path.join(TEST_DIR, 'Occupations'), { recursive: true });
     db = new MdxDbFs(TEST_DIR);
  });

  it('should create and get a document', async () => {
    const occupations = db.collection('Occupations');
    const doc = {
        $id: 'https://example.com/occupations/CEO',
        code: 'CEO',
        title: 'Chief Executive Officer',
        $content: '# CEO'
    };
    
    await occupations.create(doc);
    const retrieved = await occupations.get('CEO');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Chief Executive Officer');
    expect(retrieved?.$content).toBe('# CEO');
  });

  it('should update a document', async () => {
    const occupations = db.collection('Occupations');
    const doc = {
        code: 'CTO',
        title: 'Chief Technology Officer',
        $content: '# CTO'
    };
    
    await occupations.create(doc);
    await occupations.update('CTO', { title: 'Chief Tech Officer' });
    
    const retrieved = await occupations.get('CTO');
    expect(retrieved?.title).toBe('Chief Tech Officer');
    expect(retrieved?.$content).toBe('# CTO');
  });

  it('should list documents with glob', async () => {
    const occupations = db.collection('Occupations');
    await occupations.create({ code: 'A', title: 'A' });
    await occupations.create({ code: 'B', title: 'B' });
    
    const list = await occupations.list();
    expect(list.length).toBe(2);
    
    // Test basic glob behavior implied by default (all files)
  });

  it('should search documents using simple text', async () => {
    const occupations = db.collection('Occupations');
    await occupations.create({ code: 'Dev', title: 'Developer' });
    await occupations.create({ code: 'Des', title: 'Designer' });
    
    const results = await occupations.search('Developer');
    expect(results.length).toBe(1);
    expect(results[0].code).toBe('Dev');
  });

  it('should search documents using mongo-style query', async () => {
    const occupations = db.collection('Occupations');
    await occupations.create({ code: 'Dev', title: 'Developer', level: 'Senior' });
    await occupations.create({ code: 'JunDev', title: 'Developer', level: 'Junior' });
    
    const results = await occupations.search({ level: 'Senior' });
    expect(results.length).toBe(1);
    expect(results[0].code).toBe('Dev');
  });

  it('should delete a document', async () => {
    const occupations = db.collection('Occupations');
    await occupations.create({ code: 'Temp', title: 'Temporary' });
    
    const deleted = await occupations.delete('Temp');
    expect(deleted).toBe(true);
    
    const retrieved = await occupations.get('Temp');
    expect(retrieved).toBeNull();
  });
});
