import fs from 'fs/promises';
import path from 'path';

const parsedDataPath = '/tmp/unspsc-parsed.json';
const projectRoot = '/Users/nathanclevenger/projects/graph.org.ai';

// Sanitize filename - only remove truly invalid characters
function sanitizeFilename(name) {
  if (!name) return 'Untitled';

  // macOS/Unix invalid characters: / and null
  // Windows adds: < > : " | ? *
  // We'll be conservative and remove: / \ : * ? " < > |
  // But keep spaces, parentheses, commas, periods, hyphens, etc.
  return name.replace(/[\/\\:*?"<>|]/g, '').trim();
}

// Create MDX file for segment
function createSegmentMDX(segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  return `---
$id: https://graph.org.ai/${rootType}/segment/${segment.code}
$type: ${type}Segment
source: UNSPSC
code: "${segment.code}"
title: "${segment.title}"
---

# ${segment.title}

**UNSPSC Code**: ${segment.code}

${segment.definition || ''}

## Families

This segment contains the following families. Browse the folders below to explore the hierarchy.
`;
}

// Create MDX file for family
function createFamilyMDX(family, segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  return `---
$id: https://graph.org.ai/${rootType}/family/${family.code}
$type: ${type}Family
source: UNSPSC
code: "${family.code}"
title: "${family.title}"
segment: "${segment.code}"
segmentTitle: "${segment.title}"
---

# ${family.title}

**UNSPSC Code**: ${family.code}
**Segment**: [${segment.title}](${sanitizeFilename(segment.title)}.mdx)

${family.definition || ''}

## Classes

Browse the folders below to explore classes in this family.
`;
}

// Create MDX file for class
function createClassMDX(cls, family, segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  return `---
$id: https://graph.org.ai/${rootType}/class/${cls.code}
$type: ${type}Class
source: UNSPSC
code: "${cls.code}"
title: "${cls.title}"
family: "${family.code}"
familyTitle: "${family.title}"
segment: "${segment.code}"
segmentTitle: "${segment.title}"
---

# ${cls.title}

**UNSPSC Code**: ${cls.code}
**Family**: [${family.title}](${sanitizeFilename(family.title)}.mdx)
**Segment**: [${segment.title}](../${sanitizeFilename(segment.title)}.mdx)

${cls.definition || ''}

## Commodities

Browse the folders below to explore commodities in this class.
`;
}

// Create MDX file for commodity
function createCommodityMDX(commodity, cls, family, segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  const synonymsSection = commodity.synonyms.length > 0
    ? `\n## Synonyms\n\n${commodity.synonyms.map(s => `- ${s}`).join('\n')}\n`
    : '';

  const acronymsSection = commodity.acronyms.length > 0
    ? `\n## Acronyms\n\n${commodity.acronyms.map(a => `- ${a}`).join('\n')}\n`
    : '';

  return `---
$id: https://graph.org.ai/${rootType}/commodity/${commodity.code}
$type: ${type}
source: UNSPSC
code: "${commodity.code}"
title: "${commodity.title}"
class: "${cls.code}"
classTitle: "${cls.title}"
family: "${family.code}"
familyTitle: "${family.title}"
segment: "${segment.code}"
segmentTitle: "${segment.title}"
${commodity.synonyms.length > 0 ? `synonyms: ${JSON.stringify(commodity.synonyms)}` : ''}
${commodity.acronyms.length > 0 ? `acronyms: ${JSON.stringify(commodity.acronyms)}` : ''}
---

# ${commodity.title}

**UNSPSC Code**: ${commodity.code}
**Class**: [${cls.title}](${sanitizeFilename(cls.title)}.mdx)
**Family**: [${family.title}](../${sanitizeFilename(family.title)}.mdx)
**Segment**: [${segment.title}](../../${sanitizeFilename(segment.title)}.mdx)

${commodity.definition || ''}
${synonymsSection}${acronymsSection}
`;
}

async function generateStructure(isProduct) {
  const rootDir = isProduct ? 'Products.org.ai' : 'Services.org.ai';
  const rootPath = path.join(projectRoot, rootDir);

  console.log(`\n🚀 Generating ${rootDir}...`);

  // Read parsed data
  const data = JSON.parse(await fs.readFile(parsedDataPath, 'utf-8'));

  // Filter segments
  const segments = data.segments.filter(s =>
    isProduct
      ? String(s.code).match(/^[1-6]/)
      : String(s.code).match(/^[7-9]/)
  );

  console.log(`   Found ${segments.length} segments`);

  let segmentCount = 0;
  let familyCount = 0;
  let classCount = 0;
  let commodityCount = 0;

  for (const segment of segments) {
    // Create segment folder
    const segmentName = sanitizeFilename(segment.title);
    const segmentPath = path.join(rootPath, segmentName);
    await fs.mkdir(segmentPath, { recursive: true });

    // Create segment MDX file (in parent = rootPath)
    const segmentMDX = createSegmentMDX(segment, isProduct);
    await fs.writeFile(path.join(rootPath, `${segmentName}.mdx`), segmentMDX);
    segmentCount++;

    // Get families in this segment
    const segmentFamilies = data.families.filter(f => f.segment === segment.code);

    for (const family of segmentFamilies) {
      const familyName = sanitizeFilename(family.title);
      const familyPath = path.join(segmentPath, familyName);
      await fs.mkdir(familyPath, { recursive: true });

      // Create family MDX file (in parent = segmentPath)
      const familyMDX = createFamilyMDX(family, segment, isProduct);
      await fs.writeFile(path.join(segmentPath, `${familyName}.mdx`), familyMDX);
      familyCount++;

      // Get classes in this family
      const familyClasses = data.classes.filter(c => c.family === family.code);

      for (const cls of familyClasses) {
        const className = sanitizeFilename(cls.title);
        const classPath = path.join(familyPath, className);
        await fs.mkdir(classPath, { recursive: true });

        // Create class MDX file (in parent = familyPath)
        const classMDX = createClassMDX(cls, family, segment, isProduct);
        await fs.writeFile(path.join(familyPath, `${className}.mdx`), classMDX);
        classCount++;

        // Get commodities in this class
        const classCommodities = data.commodities.filter(c => c.class === cls.code);

        for (const commodity of classCommodities) {
          const commodityName = sanitizeFilename(commodity.title);
          const commodityPath = path.join(classPath, commodityName);
          await fs.mkdir(commodityPath, { recursive: true });

          // Create commodity MDX file (in parent = classPath)
          const commodityMDX = createCommodityMDX(commodity, cls, family, segment, isProduct);
          await fs.writeFile(path.join(classPath, `${commodityName}.mdx`), commodityMDX);
          commodityCount++;
        }
      }
    }

    console.log(`   ✓ ${segment.title} (${segmentFamilies.length} families)`);
  }

  console.log(`\n✅ ${rootDir} generated:`);
  console.log(`   - ${segmentCount} segments`);
  console.log(`   - ${familyCount} families`);
  console.log(`   - ${classCount} classes`);
  console.log(`   - ${commodityCount} commodities`);
}

async function main() {
  console.log('🏗️  Generating UNSPSC folder structure...\n');

  // Generate Products
  await generateStructure(true);

  // Generate Services
  await generateStructure(false);

  console.log('\n🎉 Done!');
}

main().catch(console.error);
