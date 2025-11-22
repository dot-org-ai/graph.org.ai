import fs from 'fs/promises';
import path from 'path';

const parsedDataPath = '/tmp/unspsc-parsed.json';
const projectRoot = '/Users/nathanclevenger/projects/graph.org.ai';

// Sanitize filename - only remove truly invalid characters
function sanitizeFilename(name) {
  if (!name) return 'Untitled';
  return name.replace(/[\/\\:*?"<>|]/g, '').trim();
}

async function testGeneration() {
  console.log('🧪 Testing generation with first segment...\n');

  // Read parsed data
  const data = JSON.parse(await fs.readFile(parsedDataPath, 'utf-8'));

  // Get first product segment
  const segment = data.segments.find(s => String(s.code).match(/^[1-6]/));
  console.log('Test segment:', segment.title);

  // Get first family
  const family = data.families.find(f => f.segment === segment.code);
  console.log('Test family:', family.title);

  // Get first class
  const cls = data.classes.find(c => c.family === family.code);
  console.log('Test class:', cls.title);

  // Get first 3 commodities
  const commodities = data.commodities.filter(c => c.class === cls.code).slice(0, 3);
  console.log('Test commodities:', commodities.map(c => c.title).join(', '));

  // Test filename sanitization
  console.log('\n📝 Testing filename sanitization:');
  console.log('Segment:', sanitizeFilename(segment.title));
  console.log('Family:', sanitizeFilename(family.title));
  console.log('Class:', sanitizeFilename(cls.title));
  commodities.forEach(c => {
    console.log('Commodity:', sanitizeFilename(c.title));
  });

  // Test full path
  const testPath = path.join(
    projectRoot,
    'Products.org.ai',
    sanitizeFilename(segment.title),
    sanitizeFilename(family.title),
    sanitizeFilename(cls.title),
    sanitizeFilename(commodities[0].title)
  );
  console.log('\n📁 Test path length:', testPath.length);
  console.log('Path:', testPath);

  console.log('\n✅ Test completed. Ready to generate full structure.');
}

testGeneration().catch(console.error);
