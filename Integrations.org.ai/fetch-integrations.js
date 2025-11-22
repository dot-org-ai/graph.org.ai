#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zapier.com/api/v4';

async function fetchAllIntegrations(endpoint) {
  const results = [];
  let url = `${BASE_URL}/${endpoint}?limit=10000`;

  while (url) {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url);
    const data = await response.json();

    results.push(...data.results);
    url = data.next;

    // Show progress
    console.log(`  Fetched ${results.length} of ${data.count} total`);

    // Be nice to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

async function main() {
  console.log('Fetching apps...');
  const apps = await fetchAllIntegrations('apps');

  console.log('Fetching services...');
  const services = await fetchAllIntegrations('services');

  // Save to JSON files
  fs.writeFileSync(
    path.join(__dirname, 'apps.json'),
    JSON.stringify(apps, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, 'services.json'),
    JSON.stringify(services, null, 2)
  );

  console.log(`\nSaved ${apps.length} apps to apps.json`);
  console.log(`Saved ${services.length} services to services.json`);
}

main().catch(console.error);
