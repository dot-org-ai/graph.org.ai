import XLSX from 'xlsx';
import fs from 'fs/promises';

const excelPath = '/tmp/unspsc-english-v260801.1.xlsx';

async function parseUNSPSC() {
  // Read the Excel file
  const fileBuffer = await fs.readFile(excelPath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Parse starting from row 12 (0-indexed, so row 12 becomes the header)
  const data = XLSX.utils.sheet_to_json(worksheet, { range: 12 });

  console.log('Total rows:', data.length);
  console.log('\nColumn names:', Object.keys(data[0]));
  console.log('\nFirst 3 rows:');
  console.log(JSON.stringify(data.slice(0, 3), null, 2));

  // Analyze the structure
  const segments = new Map();
  const families = new Map();
  const classes = new Map();
  const commodities = new Map();

  data.forEach(row => {
    const segmentCode = row['Segment'];
    const familyCode = row['Family'];
    const classCode = row['Class'];
    const commodityCode = row['Commodity'];

    if (segmentCode && !segments.has(segmentCode)) {
      segments.set(segmentCode, {
        code: segmentCode,
        title: row['Segment Title'],
        definition: row['Segment Definition']
      });
    }

    if (familyCode && !families.has(familyCode)) {
      families.set(familyCode, {
        code: familyCode,
        title: row['Family Title'],
        definition: row['Family Definition'],
        segment: segmentCode
      });
    }

    if (classCode && !classes.has(classCode)) {
      classes.set(classCode, {
        code: classCode,
        title: row['Class Title'],
        definition: row['Class Definition'],
        family: familyCode,
        segment: segmentCode
      });
    }

    if (commodityCode && !commodities.has(commodityCode)) {
      commodities.set(commodityCode, {
        code: commodityCode,
        title: row['Commodity Title'],
        definition: row['Commodity Definition'],
        class: classCode,
        family: familyCode,
        segment: segmentCode,
        synonyms: [],
        acronyms: []
      });
    }

    // Add synonyms and acronyms
    if (commodityCode && row['Synonym']) {
      const commodity = commodities.get(commodityCode);
      if (!commodity.synonyms.includes(row['Synonym'])) {
        commodity.synonyms.push(row['Synonym']);
      }
    }

    if (commodityCode && row['Acronym']) {
      const commodity = commodities.get(commodityCode);
      if (!commodity.acronyms.includes(row['Acronym'])) {
        commodity.acronyms.push(row['Acronym']);
      }
    }
  });

  console.log('\n=== UNSPSC Structure ===');
  console.log('Segments:', segments.size);
  console.log('Families:', families.size);
  console.log('Classes:', classes.size);
  console.log('Commodities:', commodities.size);

  // Products vs Services
  const productSegments = Array.from(segments.values()).filter(s =>
    String(s.code).match(/^[1-6]/)
  );
  const serviceSegments = Array.from(segments.values()).filter(s =>
    String(s.code).match(/^[7-9]/)
  );

  console.log('\nProducts segments (10-69):', productSegments.length);
  console.log('Services segments (70-99):', serviceSegments.length);

  // Show first product segment
  console.log('\n=== First Product Segment ===');
  const firstProductSeg = productSegments[0];
  console.log(JSON.stringify(firstProductSeg, null, 2));

  // Show families in first segment
  const firstSegFamilies = Array.from(families.values()).filter(f =>
    f.segment === firstProductSeg.code
  );
  console.log('\nFamilies in first segment:', firstSegFamilies.length);
  console.log('First family:', JSON.stringify(firstSegFamilies[0], null, 2));

  // Show classes in first family
  const firstFamily = firstSegFamilies[0];
  const firstFamilyClasses = Array.from(classes.values()).filter(c =>
    c.family === firstFamily.code
  );
  console.log('\nClasses in first family:', firstFamilyClasses.length);
  console.log('First class:', JSON.stringify(firstFamilyClasses[0], null, 2));

  // Show commodities in first class
  const firstClass = firstFamilyClasses[0];
  const firstClassCommodities = Array.from(commodities.values()).filter(c =>
    c.class === firstClass.code
  );
  console.log('\nCommodities in first class:', firstClassCommodities.length);
  console.log('First commodity:', JSON.stringify(firstClassCommodities[0], null, 2));

  // Save parsed data for use in generation script
  await fs.writeFile(
    '/tmp/unspsc-parsed.json',
    JSON.stringify({
      segments: Array.from(segments.values()),
      families: Array.from(families.values()),
      classes: Array.from(classes.values()),
      commodities: Array.from(commodities.values())
    }, null, 2)
  );

  console.log('\n✅ Parsed data saved to /tmp/unspsc-parsed.json');
}

parseUNSPSC().catch(console.error);
