import fs from 'fs/promises';
import Papa from 'papaparse';

async function parseTSV(filepath) {
  const content = await fs.readFile(filepath, 'utf-8');
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      delimiter: '\t',
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

async function analyzeGPC() {
  console.log('🔍 Analyzing GS1 GPC Data...\n');

  const gpcData = await parseTSV('/tmp/gs1-gpc/gpc.tsv');
  const gpcHier = await parseTSV('/tmp/gs1-gpc/gpc-hier.tsv');

  console.log(`Total GPC entries: ${gpcData.length}`);
  console.log(`Hierarchical entries: ${gpcHier.length}\n`);

  // Parse and categorize
  const segments = new Map();
  const families = new Map();
  const classes = new Map();
  const bricks = new Map();
  const attTypes = new Map();
  const attValues = new Map();

  gpcData.forEach(row => {
    const [code, name, description] = row;

    if (!code) return;

    if (description && description.includes('(GPC segment)')) {
      segments.set(code, { code, name, description: description.replace(' (GPC segment)', '').trim() });
    } else if (description && description.includes('(GPC family)')) {
      families.set(code, { code, name, description: description.replace(' (GPC family)', '').trim() });
    } else if (description && description.includes('(GPC class)')) {
      classes.set(code, { code, name, description: description.replace(' (GPC class)', '').trim() });
    } else if (description && description.includes('(GPC brick)')) {
      bricks.set(code, { code, name, description: description.replace(' (GPC brick)', '').trim() });
    } else if (description && description.includes('(GPC attType)')) {
      attTypes.set(code, { code, name, description: description.replace(' (GPC attType)', '').trim() });
    } else if (description && description.includes('(GPC attValue)')) {
      attValues.set(code, { code, name, description: description.replace(' (GPC attValue)', '').trim() });
    }
  });

  console.log('=== GPC Structure ===');
  console.log(`Segments: ${segments.size}`);
  console.log(`Families: ${families.size}`);
  console.log(`Classes: ${classes.size}`);
  console.log(`Bricks: ${bricks.size}`);
  console.log(`Attribute Types: ${attTypes.size}`);
  console.log(`Attribute Values: ${attValues.size}`);

  // Parse hierarchy to build relationships
  console.log('\n=== Building Hierarchy ===');
  const hierarchy = new Map();
  let currentSegment = null;
  let currentFamily = null;
  let currentClass = null;

  gpcHier.forEach(row => {
    const [code, name, description] = row;
    if (!code) return;

    if (segments.has(code)) {
      currentSegment = code;
      currentFamily = null;
      currentClass = null;
      hierarchy.set(code, { ...segments.get(code), families: [] });
    } else if (families.has(code) && currentSegment) {
      currentFamily = code;
      currentClass = null;
      const famData = { ...families.get(code), classes: [], segment: currentSegment };
      hierarchy.get(currentSegment).families.push(famData);
      hierarchy.set(code, famData);
    } else if (classes.has(code) && currentFamily) {
      currentClass = code;
      const classData = { ...classes.get(code), bricks: [], family: currentFamily, segment: currentSegment };
      hierarchy.get(currentFamily).classes.push(classData);
      hierarchy.set(code, classData);
    } else if (bricks.has(code) && currentClass) {
      const brickData = { ...bricks.get(code), class: currentClass, family: currentFamily, segment: currentSegment };
      hierarchy.get(currentClass).bricks.push(brickData);
      hierarchy.set(code, brickData);
    }
  });

  // Sample output
  console.log('\n=== Sample Hierarchy ===');
  const firstSegment = Array.from(hierarchy.values()).find(item => item.families);
  console.log(`\nSegment: ${firstSegment.name}`);
  console.log(`  Families: ${firstSegment.families.length}`);
  if (firstSegment.families.length > 0) {
    const firstFamily = firstSegment.families[0];
    console.log(`  \nFamily: ${firstFamily.name}`);
    console.log(`    Classes: ${firstFamily.classes.length}`);
    if (firstFamily.classes.length > 0) {
      const firstClass = firstFamily.classes[0];
      console.log(`    \nClass: ${firstClass.name}`);
      console.log(`      Bricks: ${firstClass.bricks.length}`);
      if (firstClass.bricks.length > 0) {
        console.log(`      \nSample Brick: ${firstClass.bricks[0].name}`);
      }
    }
  }

  // Save structured data
  const structuredData = {
    segments: Array.from(segments.values()),
    families: Array.from(families.values()),
    classes: Array.from(classes.values()),
    bricks: Array.from(bricks.values()),
    attTypes: Array.from(attTypes.values()),
    attValues: Array.from(attValues.values()),
    hierarchy: Array.from(hierarchy.values()).filter(item => item.families)
  };

  await fs.writeFile('/tmp/gpc-structured.json', JSON.stringify(structuredData, null, 2));
  console.log('\n✅ Structured data saved to /tmp/gpc-structured.json');
}

analyzeGPC().catch(console.error);
