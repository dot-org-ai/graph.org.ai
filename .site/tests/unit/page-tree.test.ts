import { describe, test, expect } from 'vitest';
import { mdxSource } from '../../lib/source';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';

describe('Page Tree Structure', () => {
  test('should understand MDX page tree structure', async () => {
    const mdxTree = mdxSource.pageTree;

    console.log('=== MDX Page Tree Structure ===');
    console.log(JSON.stringify(mdxTree, null, 2));

    // Check if tree has $id properties
    console.log('\n=== Checking for $id properties ===');
    function checkForIds(obj: any, path = 'root'): void {
      if (obj && typeof obj === 'object') {
        if ('$id' in obj) {
          console.log(`${path} has $id:`, obj.$id);
        }
        if (Array.isArray(obj)) {
          obj.forEach((item, i) => checkForIds(item, `${path}[${i}]`));
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            if (key !== '$id') {
              checkForIds(value, `${path}.${key}`);
            }
          });
        }
      }
    }
    checkForIds(mdxTree);

    expect(mdxTree).toBeDefined();
  });

  test('should understand MDX page structure', () => {
    const pages = mdxSource.getPages();

    console.log('\n=== MDX Pages Structure ===');
    console.log(`Total pages: ${pages.length}`);

    if (pages.length > 0) {
      const samplePage = pages[0];
      console.log('\n=== Sample Page ===');
      console.log(JSON.stringify({
        url: samplePage.url,
        slugs: samplePage.slugs,
        path: samplePage.path,
        dataKeys: Object.keys(samplePage.data),
      }, null, 2));
    }
  });

  test('should create matching page tree node structure', async () => {
    const mdxTree = mdxSource.pageTree;

    // Get domains from database
    const domains = await clickhouseQueries.getDomains();
    console.log('\n=== Available Domains ===');
    console.log(domains);

    // Try to create a node that matches MDX structure
    const testDomain = 'onet';
    const types = await clickhouseQueries.getDomainTypes(testDomain);

    console.log(`\n=== Types for ${testDomain} ===`);
    console.log(types.slice(0, 5));

    // Create a test node following MDX structure
    const testNode = {
      type: 'folder' as const,
      name: testDomain.toUpperCase(),
      index: {
        type: 'page' as const,
        name: `${testDomain.toUpperCase()} Overview`,
        url: `/${testDomain}`,
      },
      children: types.slice(0, 3).map((typeInfo) => ({
        type: 'page' as const,
        name: `${typeInfo.type} (${typeInfo.count})`,
        url: `/${testDomain}/${typeInfo.type}`,
      })),
    };

    console.log('\n=== Test Node Structure ===');
    console.log(JSON.stringify(testNode, null, 2));

    // Compare with MDX children structure
    if (mdxTree.children && mdxTree.children.length > 0) {
      console.log('\n=== MDX Child Node Structure ===');
      console.log(JSON.stringify(mdxTree.children[0], null, 2));
    }
  });

  test('should deeply compare tree structures', () => {
    const mdxTree = mdxSource.pageTree;

    console.log('\n=== Deep Structure Analysis ===');
    console.log('Root keys:', Object.keys(mdxTree));
    console.log('Root type:', typeof mdxTree);

    if ('children' in mdxTree && Array.isArray(mdxTree.children)) {
      console.log('Number of children:', mdxTree.children.length);

      mdxTree.children.forEach((child, i) => {
        console.log(`\nChild ${i}:`);
        console.log('  Keys:', Object.keys(child));
        console.log('  Type:', child.type);
        console.log('  Name:', child.name);

        if ('$id' in child) {
          console.log('  $id:', child.$id);
          console.log('  $id type:', typeof child.$id);
        }

        if ('children' in child && Array.isArray(child.children)) {
          console.log('  Number of nested children:', child.children.length);
          if (child.children.length > 0) {
            console.log('  First nested child keys:', Object.keys(child.children[0]));
          }
        }
      });
    }
  });
});
