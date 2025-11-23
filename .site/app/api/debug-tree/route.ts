import { NextResponse } from 'next/server';
import { mdxSource } from '@/lib/source';
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';
import util from 'util';

export async function GET() {
  const output: string[] = [];

  output.push('=== MDX Page Tree Structure ===\n');

  const mdxTree = mdxSource.pageTree;

  // Inspect the tree
  output.push(util.inspect(mdxTree, {
    showHidden: true,
    depth: 8,
    colors: false,
    compact: false,
  }));

  output.push('\n=== Root Keys ===');
  output.push(JSON.stringify(Object.keys(mdxTree), null, 2));

  if ('children' in mdxTree && Array.isArray(mdxTree.children)) {
    output.push(`\n=== Children (${mdxTree.children.length} total) ===`);

    mdxTree.children.forEach((child, i) => {
      output.push(`\n--- Child ${i}: ${child.name} ---`);
      output.push(`Keys: ${JSON.stringify(Object.keys(child))}`);
      output.push(`Type: ${child.type}`);

      // Check for $id
      if ('$id' in child) {
        output.push(`HAS $id: ${(child as any).$id}`);
        output.push(`$id type: ${typeof (child as any).$id}`);
      } else {
        output.push('NO $id property found');
      }

      // Check for all property descriptors
      const descriptors = Object.getOwnPropertyDescriptors(child);
      const nonEnumKeys = Object.keys(descriptors).filter(
        k => !descriptors[k].enumerable
      );
      if (nonEnumKeys.length > 0) {
        output.push(`Non-enumerable keys: ${JSON.stringify(nonEnumKeys)}`);
      }
    });
  }

  output.push('\n=== Test: Creating Custom Node ===');

  const domains = await clickhouseQueries.getDomains();
  output.push(`\nAvailable domains: ${domains.join(', ')}`);

  const testDomain = 'onet';
  const types = await clickhouseQueries.getDomainTypes(testDomain);

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

  output.push('\nCustom node:');
  output.push(JSON.stringify(customNode, null, 2));

  output.push('\n=== Trying to add $id to custom node ===');

  // Try to replicate the $id
  const nodeWithId = {
    ...customNode,
    $id: Symbol.for('fumadocs.pageTree'),
  };

  output.push(JSON.stringify({
    hasSymbol: '$id' in nodeWithId,
    symbolValue: String(nodeWithId.$id),
  }, null, 2));

  return new NextResponse(output.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
