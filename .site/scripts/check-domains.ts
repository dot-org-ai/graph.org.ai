/**
 * Check what domains are available in ClickHouse
 */

import * as clickhouseQueries from '@graph.org.ai/mdxdb/clickhouse-queries';

async function checkDomains() {
  console.log('=== Checking Available Domains ===\n');

  const domains = await clickhouseQueries.getDomains();
  console.log('All domains:', domains);

  // Check if we have wiktionary or geonames data
  const hasWiktionary = domains.some(d => d.toLowerCase().includes('wik'));
  const hasGeonames = domains.some(d => d.toLowerCase().includes('geo'));

  console.log('\nHas Wiktionary data:', hasWiktionary);
  console.log('Has GeoNames data:', hasGeonames);

  // For each domain, show types
  console.log('\n=== Domain Types ===\n');
  for (const domain of domains) {
    const types = await clickhouseQueries.getDomainTypes(domain);
    console.log(`\n${domain}:`);
    console.log(`  Types: ${types.join(', ')}`);
    console.log(`  Count: ${types.length} types`);
  }
}

checkDomains().catch(console.error);
