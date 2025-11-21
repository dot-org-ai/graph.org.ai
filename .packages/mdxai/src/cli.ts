#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MdxDbFs } from 'mdxdb/fs';
import { parse } from 'mdxld';
import { evaluateMdx } from './evaluator.js';

const program = new Command();
// Assume running in project root
const db = new MdxDbFs(process.cwd()); 

program
  .name('mdxai')
  .description('AI-driven content generation and enrichment for MDX')
  .version('0.0.1');

program
  .command('enrich <file>')
  .description('Enrich data using the logic in the MDX file')
  .action(async (file) => {
    try {
        const filePath = path.resolve(process.cwd(), file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        console.log(`Evaluating ${file}...`);
        const exports = await evaluateMdx(content, db);
        
        if (exports.items) {
            const items = await exports.items;
            console.log(`Found ${Array.isArray(items) ? items.length : 0} items. Processing...`);
            
            if (Array.isArray(items)) {
                 // Derive collection name from directory
                 const dirName = path.dirname(file).split(path.sep).pop();
                 
                 if (dirName) {
                     const collection = db.collection(dirName);
                     let createdCount = 0;
                     let updatedCount = 0;

                     for (const item of items) {
                         // Parse template again to get structure (could optimize by doing once)
                         const templateDoc = parse(content);
                         const contentStr = (templateDoc as any).$content || (templateDoc as any).content;
                         
                         // Interpolate helper
                         const interpolate = (str: string, data: any) => {
                             return str.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
                                 return data[key] !== undefined ? data[key] : match;
                             });
                         };

                         // Prepare new metadata
                         const newMetadata: any = { ...item };
                         const templateMeta = { ...templateDoc };
                         delete (templateMeta as any).$content;
                         delete (templateMeta as any).content;
                         delete (templateMeta as any).data;

                         for (const [key, val] of Object.entries(templateMeta)) {
                             if (typeof val === 'string') {
                                 newMetadata[key] = interpolate(val, item);
                             } else {
                                 newMetadata[key] = val;
                             }
                         }
                         
                         const newContent = contentStr ? interpolate(contentStr, item) : '';

                         const newItem = {
                            ...newMetadata,
                            $content: newContent
                         };

                         // Recalculate ID
                         const newId = newItem.$id || newItem.id || newItem.code;
                         
                         if (newId) {
                             const existing = await collection.get(newId);
                             if (existing) {
                                 await collection.update(newId, newItem);
                                 updatedCount++;
                             } else {
                                 await collection.create(newItem);
                                 createdCount++;
                             }
                         } else {
                             console.warn('Item missing ID:', item);
                         }
                     }
                     console.log(`Enrichment complete: ${createdCount} created, ${updatedCount} updated.`);
                 } else {
                     console.error("Could not determine collection from directory.");
                 }
            }
        } else {
            console.log('No items exported.');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
  });

program.parse();