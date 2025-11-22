/**
 * Script to analyze the data hierarchy for building the sidebar
 */
import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';

async function main() {
  console.log('=== Analyzing Data Hierarchy ===\n');

  // Check NAICS domain
  const naicsTypes = await clickhouseQueries.getDomainTypes('naics');
  console.log('NAICS Types:', naicsTypes);

  // Get sample industries to understand the data structure
  const industries = await clickhouseQueries.getSampleThingsByType('Industry', 20);
  console.log('\nSample Industries:');
  industries.slice(0, 10).forEach(ind => {
    console.log(`  ${ind.id} - ${JSON.stringify(ind.data || {})}`);
  });

  // Check if there's a hierarchy field
  if (industries.length > 0 && industries[0].data) {
    console.log('\nFirst industry data structure:');
    console.log(JSON.stringify(industries[0].data, null, 2));
  }

  // Check all domains
  const domains = await clickhouseQueries.getDomains();
  console.log('\nAll Domains:', domains);

  for (const domain of domains) {
    const types = await clickhouseQueries.getDomainTypes(domain);
    console.log(`\n${domain}:`, types);
  }
}

main().catch(console.error);
