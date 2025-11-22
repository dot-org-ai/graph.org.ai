import * as q from '@graph.org.ai/mdxdb/clickhouse-queries';

async function main() {
  const segments = await q.getSampleThingsByType('Segment', 5);
  const families = await q.getSampleThingsByType('Family', 5);
  const classes = await q.getSampleThingsByType('Class', 5);
  const commodities = await q.getSampleThingsByType('Commodity', 5);

  console.log('=== UNSPSC Hierarchy Structure ===\n');

  console.log('Segments (top level):');
  segments.forEach(s => {
    console.log(`  ${s.id}`);
    console.log(`    Data:`, JSON.stringify(s.data, null, 4));
  });

  console.log('\nFamilies (under Segments):');
  families.forEach(s => {
    console.log(`  ${s.id}`);
    console.log(`    Data:`, JSON.stringify(s.data, null, 4));
  });

  console.log('\nClasses (under Families):');
  classes.forEach(s => {
    console.log(`  ${s.id}`);
    console.log(`    Data:`, JSON.stringify(s.data, null, 4));
  });

  console.log('\nCommodities (bottom level):');
  commodities.slice(0, 2).forEach(s => {
    console.log(`  ${s.id}`);
    console.log(`    Data:`, JSON.stringify(s.data, null, 4));
  });
}

main().catch(console.error);
