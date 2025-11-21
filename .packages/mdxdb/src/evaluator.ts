import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import * as _ from 'lodash-es';
import Papa from 'papaparse';
import { MdxDbFs } from './fs/index.js';

// Helper to fetch CSV
const CSV = {
  fetch: async (url: string, config: any = {}) => {
    const response = await fetch(url);
    let text = await response.text();
    // Remove BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    
    const isTsv = url.endsWith('.txt') || url.endsWith('.tsv');
    
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: isTsv ? '\t' : undefined,
            ...config,
            complete: (results: Papa.ParseResult<any>) => {
                resolve(results.data);
            },
            error: (err: Error) => reject(err)
        });
    });
  }
};

export async function evaluateMdx(content: string, db: MdxDbFs) {
    // Inject globals
    (global as any)._ = _;
    (global as any).CSV = CSV;
    (global as any).db = db;
    
    // Note: AI globals are NOT injected here. 
    // They are injected by mdxai when it uses its own evaluator or wraps this one.
    
    const exports = await evaluate(content, {
        ...runtime,
        baseUrl: import.meta.url,
        useDynamicImport: true,
    } as any);
    
    return exports;
}
