import { describe, it, expect } from 'vitest';
import { evaluateMdx } from '../src/evaluator.js';
import { MdxDbFs } from 'mdxdb/fs';

describe('evaluateMdx', () => {
  it('should evaluate MDX and return exports', async () => {
    const mdx = `
export const items = [{ id: 1, name: 'Test' }];

# Hello
`;
    const db = new MdxDbFs('.');
    const exports = await evaluateMdx(mdx, db);
    expect(exports.items).toBeDefined();
    expect(exports.items[0].name).toBe('Test');
  });

  it('should have lodash in scope', async () => {
    const mdx = `
export const data = _.map([1, 2], n => n * 2);
`;
    const db = new MdxDbFs('.');
    const exports = await evaluateMdx(mdx, db);
    expect(exports.data).toEqual([2, 4]);
  });
  
  it('should have db in scope', async () => {
      const mdx = `
export const hasDb = !!db;
`;
      const db = new MdxDbFs('.');
      const exports = await evaluateMdx(mdx, db);
      expect(exports.hasDb).toBe(true);
  });
});
