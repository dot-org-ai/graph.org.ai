/**
 * Inspect the structure of Fumadocs MDX page tree
 * to understand how to replicate it for database domains
 */

import { docs } from 'fumadocs-mdx:collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';
import util from 'util';

// Create MDX source
const mdxSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

async function inspectPageTree() {
  console.log('\n=== MDX Page Tree Structure ===\n');

  const mdxTree = mdxSource.pageTree;

  // Deep inspect the tree
  console.log(util.inspect(mdxTree, {
    showHidden: true,
    depth: 10,
    colors: true,
    compact: false,
  }));

  console.log('\n=== Root Keys ===');
  console.log(Object.keys(mdxTree));
  console.log('Own property names:', Object.getOwnPropertyNames(mdxTree));
  console.log('Own property symbols:', Object.getOwnPropertySymbols(mdxTree));

  if ('children' in mdxTree && Array.isArray(mdxTree.children)) {
    console.log(`\n=== Children (${mdxTree.children.length} total) ===`);

    mdxTree.children.forEach((child, i) => {
      console.log(`\n--- Child ${i}: ${child.name} ---`);
      console.log('Keys:', Object.keys(child));
      console.log('Type:', child.type);

      // Check for hidden properties
      const allKeys = Object.getOwnPropertyNames(child);
      const hiddenKeys = allKeys.filter(k => !Object.keys(child).includes(k));
      if (hiddenKeys.length > 0) {
        console.log('Hidden keys:', hiddenKeys);
        hiddenKeys.forEach(key => {
          console.log(`  ${key}:`, (child as any)[key]);
        });
      }

      // Check for symbols
      const symbols = Object.getOwnPropertySymbols(child);
      if (symbols.length > 0) {
        console.log('Symbols:', symbols.map(s => s.toString()));
        symbols.forEach(sym => {
          console.log(`  ${sym.toString()}:`, (child as any)[sym]);
        });
      }
    });
  }

  console.log('\n=== MDX Pages ===');
  const pages = mdxSource.getPages();
  console.log(`Total pages: ${pages.length}`);

  if (pages.length > 0) {
    const samplePage = pages[0];
    console.log('\nSample page structure:');
    console.log(util.inspect({
      url: samplePage.url,
      slugs: samplePage.slugs,
      path: samplePage.path,
      dataKeys: Object.keys(samplePage.data),
    }, { colors: true, depth: 3 }));
  }

  console.log('\n=== Database Domains ===');
  const domains = await clickhouseQueries.getDomains();
  console.log('Available domains:', domains);

  const testDomain = 'onet';
  const types = await clickhouseQueries.getDomainTypes(testDomain);
  console.log(`\nTypes for ${testDomain}:`, types.slice(0, 5));

  console.log('\n=== Test: Creating Custom Node ===');

  // Try to replicate the structure
  const customNode = {
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

  console.log('\nCustom node:');
  console.log(util.inspect(customNode, { colors: true, depth: 5 }));

  console.log('\n=== Comparison ===');
  if (mdxTree.children && mdxTree.children.length > 0) {
    const mdxChild = mdxTree.children[0];
    console.log('\nMDX child keys:', Object.keys(mdxChild));
    console.log('Custom child keys:', Object.keys(customNode));

    console.log('\nMDX child has $id?', '$id' in mdxChild);
    console.log('Custom child has $id?', '$id' in customNode);

    if ('$id' in mdxChild) {
      console.log('\nMDX $id value:', (mdxChild as any).$id);
      console.log('MDX $id type:', typeof (mdxChild as any).$id);
    }
  }
}

inspectPageTree().catch(console.error);
