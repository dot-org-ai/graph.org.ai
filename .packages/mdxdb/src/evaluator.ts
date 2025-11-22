import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import * as _ from 'lodash-es';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

// Helper to fetch XLSX
const XLSXHelper = {
  fetch: async (url: string, options: { sheet?: string | number } = {}) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get the sheet (first sheet by default, or specified by name/index)
    let sheet;
    if (options.sheet !== undefined) {
      if (typeof options.sheet === 'number') {
        const sheetName = workbook.SheetNames[options.sheet];
        sheet = workbook.Sheets[sheetName];
      } else {
        sheet = workbook.Sheets[options.sheet];
      }
    } else {
      // Default to first sheet
      sheet = workbook.Sheets[workbook.SheetNames[0]];
    }

    if (!sheet) {
      throw new Error(`Sheet not found: ${options.sheet}`);
    }

    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
  }
};

// Helper to fetch JSON files
const JSONFile = {
  fetch: async (path: string) => {
    const fs = await import('fs/promises');
    const pathMod = await import('path');

    // If path is relative, resolve it from process.cwd()
    const resolvedPath = pathMod.isAbsolute(path) ? path : pathMod.join(process.cwd(), path);
    const content = await fs.readFile(resolvedPath, 'utf-8');
    return JSON.parse(content);
  }
};

export async function evaluateMdx(content: string, db: MdxDbFs) {
    // Inject globals
    (global as any)._ = _;
    (global as any).CSV = CSV;
    (global as any).XLSX = XLSXHelper;
    (global as any).JSONFile = JSONFile;
    (global as any).db = db;
    (global as any).env = process.env; // Expose environment variables
    
    // Note: AI globals are NOT injected here. 
    // They are injected by mdxai when it uses its own evaluator or wraps this one.
    
    const exports = await evaluate(content, {
        ...runtime,
        baseUrl: import.meta.url,
        useDynamicImport: true,
    } as any);
    
    return exports;
}
