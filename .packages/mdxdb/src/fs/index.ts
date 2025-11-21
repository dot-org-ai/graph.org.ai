// mdxdb/fs implementation
import { MdxDb, MdxDbCollection } from '../index.js';
import { parse, stringify, MdxLdDocument } from 'mdxld';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import sift from 'sift';

export class MdxDbFs implements MdxDb {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  collection<T = any>(name: string): MdxDbCollection<T> {
    return new MdxDbFsCollection<T>(this.rootDir, name);
  }
}

class MdxDbFsCollection<T> implements MdxDbCollection<T> {
  private rootDir: string;
  public name: string;

  constructor(rootDir: string, name: string) {
    this.rootDir = rootDir;
    this.name = name;
  }

  private getFilePath(id: string): string {
    // Allow slashes for hierarchy, but sanitize path segments
    // We assume ID passed here is the relative path inside the collection
    const parts = id.split('/');
    const safeParts = parts.map(p => p.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
    const safeId = safeParts.join(path.sep);
    
    // If ID already has extension, respect it
    if (safeId.endsWith('.md') || safeId.endsWith('.mdx')) {
        return path.join(this.rootDir, this.name, safeId);
    }
    // Default to .md
    return path.join(this.rootDir, this.name, `${safeId}.md`);
  }

  async create(data: T): Promise<T> {
    const doc = data as MdxLdDocument;
    // Precedence: id (explicit local id) > $id (json-ld id) > code (business id)
    let id = (doc as any).id || (doc as any).$id || (doc as any).code;
    
    if (!id) {
        throw new Error("Document requires an id (or code) field to be created.");
    }
    
    if (id.startsWith('http')) {
        id = id.split('/').pop();
    }

    // Force .md extension for created files if not specified
    let filePath = this.getFilePath(id);
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) {
         filePath += '.md';
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Check if exists
    try {
        await fs.access(filePath);
        throw new Error(`Document with id ${id} already exists.`);
    } catch (e: any) {
        if (e.code !== 'ENOENT') throw e;
    }

    const content = stringify(doc);
    await fs.writeFile(filePath, content, 'utf-8');
    return data;
  }

  async get(id: string): Promise<T | null> {
    const parts = id.split('/');
    const safeParts = parts.map(p => p.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
    const safeId = safeParts.join(path.sep);
    const base = path.join(this.rootDir, this.name, safeId);
    
    const tryExts = ['.md', '.mdx'];
    if (safeId.endsWith('.md') || safeId.endsWith('.mdx')) {
        tryExts.length = 0;
        tryExts.push('');
    }

    for (const ext of tryExts) {
        const filePath = base + ext;
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const doc = parse(content);
            return doc as unknown as T;
        } catch (error: any) {
            if (error.code !== 'ENOENT') throw error;
        }
    }
    return null;
  }

  async set(id: string, data: T): Promise<T> {
    // Determine path
    const parts = id.split('/');
    const safeParts = parts.map(p => p.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
    const safeId = safeParts.join(path.sep);
    
    const base = path.join(this.rootDir, this.name, safeId);
    let filePath = base + '.md'; // Default

    // Check if .mdx exists
    try {
        await fs.access(base + '.mdx');
        filePath = base + '.mdx';
    } catch {
        // Keep default or check .md existence?
        // If neither exists, default is .md
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const doc = data as MdxLdDocument;
    const content = stringify(doc);
    await fs.writeFile(filePath, content, 'utf-8');
    return data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const current = await this.get(id);
    if (!current) {
        throw new Error(`Document with id ${id} not found.`);
    }
    
    // Deep merge? Or shallow? Shallow for now.
    const updated = { ...current, ...data };
    await this.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const parts = id.split('/');
    const safeParts = parts.map(p => p.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
    const safeId = safeParts.join(path.sep);
    const base = path.join(this.rootDir, this.name, safeId);
    
    try {
      await fs.unlink(base + '.md');
      return true;
    } catch (e: any) {
        try {
            await fs.unlink(base + '.mdx');
            return true;
        } catch {
            return false;
        }
    }
  }

  async list(globPattern: string = '**/*.{md,mdx}'): Promise<T[]> {
    const pattern = path.join(this.rootDir, this.name, globPattern);
    // Glob might return absolute paths, or relative.
    const files = await glob(pattern);
    
    const docs = await Promise.all(files.map(async (f) => {
        try {
            const content = await fs.readFile(f, 'utf-8');
            const doc = parse(content);
            // Inject filename ID if needed?
            return doc as unknown as T;
        } catch (e) {
            return null;
        }
    }));
    
    return docs.filter((d) => d !== null) as T[];
  }

  async search(query: string | Record<string, any>): Promise<T[]> {
    // Naive implementation: List all, then filter.
    // For better performance, we would need an index.
    const allDocs = await this.list();
    
    if (typeof query === 'string') {
        // Simple text search
        const q = query.toLowerCase();
        return allDocs.filter(doc => JSON.stringify(doc).toLowerCase().includes(q));
    } else {
        // Mongo-style query
        // @ts-ignore
        return allDocs.filter(sift(query));
    }
  }
}
