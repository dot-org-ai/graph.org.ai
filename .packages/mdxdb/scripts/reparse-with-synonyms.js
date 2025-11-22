import XLSX from 'xlsx';
import fs from 'fs/promises';

const excelPath = '/tmp/unspsc-english-v260801.1.xlsx';

async function reparseUNSPSC() {
  const fileBuffer = await fs.readFile(excelPath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, { range: 12 });

  console.log('Total rows:', data.length);
  console.log('Columns:', Object.keys(data[0]));

  // Check for rows with synonyms or acronyms
  const withSynonyms = data.filter(row => row['Synonym']);
  const withAcronyms = data.filter(row => row['Acronym']);

  console.log('\nRows with Synonyms:', withSynonyms.length);
  console.log('Rows with Acronyms:', withAcronyms.length);

  console.log('\nFirst 5 with synonyms:');
  withSynonyms.slice(0, 5).forEach(row => {
    console.log(`  ${row['Commodity Title']} (${row['Commodity']}): ${row['Synonym']}`);
  });

  console.log('\nFirst 5 with acronyms:');
  withAcronyms.slice(0, 5).forEach(row => {
    console.log(`  ${row['Commodity Title']} (${row['Commodity']}): ${row['Acronym']}`);
  });

  // Build commodity map with all synonyms and acronyms
  const commodities = new Map();

  data.forEach(row => {
    const commodityCode = row['Commodity'];
    if (!commodityCode) return;

    if (!commodities.has(commodityCode)) {
      commodities.set(commodityCode, {
        code: commodityCode,
        title: row['Commodity Title'],
        definition: row['Commodity Definition'],
        class: row['Class'],
        classTitle: row['Class Title'],
        family: row['Family'],
        familyTitle: row['Family Title'],
        segment: row['Segment'],
        segmentTitle: row['Segment Title'],
        synonyms: [],
        acronyms: []
      });
    }

    const commodity = commodities.get(commodityCode);

    if (row['Synonym']) {
      const synonym = String(row['Synonym']).trim();
      if (synonym && !commodity.synonyms.includes(synonym)) {
        commodity.synonyms.push(synonym);
      }
    }

    if (row['Acronym']) {
      const acronym = String(row['Acronym']).trim();
      if (acronym && !commodity.acronyms.includes(acronym)) {
        commodity.acronyms.push(acronym);
      }
    }
  });

  const commoditiesArray = Array.from(commodities.values());
  const withSyn = commoditiesArray.filter(c => c.synonyms.length > 0);
  const withAcr = commoditiesArray.filter(c => c.acronyms.length > 0);

  console.log(`\nTotal commodities: ${commoditiesArray.length}`);
  console.log(`With synonyms: ${withSyn.length}`);
  console.log(`With acronyms: ${withAcr.length}`);

  console.log('\nSample commodities with synonyms:');
  withSyn.slice(0, 3).forEach(c => {
    console.log(`  ${c.title} (${c.code}):`);
    console.log(`    Synonyms: ${c.synonyms.join(', ')}`);
  });

  console.log('\nSample commodities with acronyms:');
  withAcr.slice(0, 3).forEach(c => {
    console.log(`  ${c.title} (${c.code}):`);
    console.log(`    Acronyms: ${c.acronyms.join(', ')}`);
  });

  // Save the corrected data
  await fs.writeFile(
    '/tmp/unspsc-with-synonyms.json',
    JSON.stringify({
      commodities: commoditiesArray
    }, null, 2)
  );

  console.log('\n✅ Data saved to /tmp/unspsc-with-synonyms.json');
}

reparseUNSPSC().catch(console.error);
