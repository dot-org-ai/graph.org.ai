import fs from 'fs/promises';
import path from 'path';

const parsedDataPath = '/tmp/unspsc-parsed.json';
const projectRoot = '/Users/nathanclevenger/projects/graph.org.ai';

// Sanitize filename - only remove truly invalid characters
function sanitizeFilename(name) {
  if (!name) return 'Untitled';
  return name.replace(/[\/\\:*?"<>|]/g, '').trim();
}

// Create MDX file for synonym (reference to parent commodity)
function createSynonymMDX(synonym, commodity, cls, family, segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  return `---
$id: https://graph.org.ai/${rootType}/synonym/${encodeURIComponent(synonym)}
$type: ${type}Synonym
source: UNSPSC
commodityCode: "${commodity.code}"
commodityTitle: "${commodity.title}"
synonym: "${synonym}"
class: "${cls.code}"
classTitle: "${cls.title}"
family: "${family.code}"
familyTitle: "${family.title}"
segment: "${segment.code}"
segmentTitle: "${segment.title}"
---

# ${synonym}

**Synonym for**: [${commodity.title}](${sanitizeFilename(commodity.title)}.mdx)

**UNSPSC Code**: ${commodity.code}

This is an alternative name for ${commodity.title}.

## Classification

**Class**: [${cls.title}](../${sanitizeFilename(cls.title)}.mdx)
**Family**: [${family.title}](../../${sanitizeFilename(family.title)}.mdx)
**Segment**: [${segment.title}](../../../${sanitizeFilename(segment.title)}.mdx)
`;
}

// Create MDX file for acronym (reference to parent commodity)
function createAcronymMDX(acronym, commodity, cls, family, segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  return `---
$id: https://graph.org.ai/${rootType}/acronym/${encodeURIComponent(acronym)}
$type: ${type}Acronym
source: UNSPSC
commodityCode: "${commodity.code}"
commodityTitle: "${commodity.title}"
acronym: "${acronym}"
class: "${cls.code}"
classTitle: "${cls.title}"
family: "${family.code}"
familyTitle: "${family.title}"
segment: "${segment.code}"
segmentTitle: "${segment.title}"
---

# ${acronym}

**Acronym for**: [${commodity.title}](${sanitizeFilename(commodity.title)}.mdx)

**UNSPSC Code**: ${commodity.code}

This is an acronym for ${commodity.title}.

## Classification

**Class**: [${cls.title}](../${sanitizeFilename(cls.title)}.mdx)
**Family**: [${family.title}](../../${sanitizeFilename(family.title)}.mdx)
**Segment**: [${segment.title}](../../../${sanitizeFilename(segment.title)}.mdx)
`;
}

// Update commodity MDX to include synonym/acronym listings
function createCommodityMDX(commodity, cls, family, segment, isProduct) {
  const type = isProduct ? 'Product' : 'Service';
  const rootType = isProduct ? 'products' : 'services';

  const synonymsSection = commodity.synonyms.length > 0
    ? `\n## Synonyms\n\n${commodity.synonyms.map(s => `- [${s}](${sanitizeFilename(s)}.mdx)`).join('\n')}\n`
    : '';

  const acronymsSection = commodity.acronyms.length > 0
    ? `\n## Acronyms\n\n${commodity.acronyms.map(a => `- [${a}](${sanitizeFilename(a)}.mdx)`).join('\n')}\n`
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
**Class**: [${cls.title}](../${sanitizeFilename(cls.title)}.mdx)
**Family**: [${family.title}](../../${sanitizeFilename(family.title)}.mdx)
**Segment**: [${segment.title}](../../../${sanitizeFilename(segment.title)}.mdx)

${commodity.definition || ''}
${synonymsSection}${acronymsSection}
`;
}

async function generateWithSynonyms(isProduct) {
  const rootDir = isProduct ? 'Products.org.ai' : 'Services.org.ai';
  const rootPath = path.join(projectRoot, rootDir);

  console.log(`\n🚀 Generating ${rootDir} with synonyms/acronyms...`);

  const data = JSON.parse(await fs.readFile(parsedDataPath, 'utf-8'));

  const segments = data.segments.filter(s =>
    isProduct
      ? String(s.code).match(/^[1-6]/)
      : String(s.code).match(/^[7-9]/)
  );

  let synonymCount = 0;
  let acronymCount = 0;

  for (const segment of segments) {
    const segmentFamilies = data.families.filter(f => f.segment === segment.code);

    for (const family of segmentFamilies) {
      const familyClasses = data.classes.filter(c => c.family === family.code);

      for (const cls of familyClasses) {
        const classCommodities = data.commodities.filter(c => c.class === cls.code);

        for (const commodity of classCommodities) {
          const commodityName = sanitizeFilename(commodity.title);
          const commodityPath = path.join(
            rootPath,
            sanitizeFilename(segment.title),
            sanitizeFilename(family.title),
            sanitizeFilename(cls.title),
            commodityName
          );

          // Update commodity MDX with links to synonyms/acronyms
          const commodityMDX = createCommodityMDX(commodity, cls, family, segment, isProduct);
          await fs.writeFile(path.join(commodityPath, `${commodityName}.mdx`), commodityMDX);

          // Create synonym files (directly in commodity folder)
          for (const synonym of commodity.synonyms) {
            const synonymName = sanitizeFilename(synonym);
            const synonymMDX = createSynonymMDX(synonym, commodity, cls, family, segment, isProduct);
            await fs.writeFile(path.join(commodityPath, `${synonymName}.mdx`), synonymMDX);
            synonymCount++;
          }

          // Create acronym files (directly in commodity folder)
          for (const acronym of commodity.acronyms) {
            const acronymName = sanitizeFilename(acronym);
            const acronymMDX = createAcronymMDX(acronym, commodity, cls, family, segment, isProduct);
            await fs.writeFile(path.join(commodityPath, `${acronymName}.mdx`), acronymMDX);
            acronymCount++;
          }
        }
      }
    }
  }

  console.log(`\n✅ ${rootDir} updated:`);
  console.log(`   - ${synonymCount} synonyms`);
  console.log(`   - ${acronymCount} acronyms`);
}

async function main() {
  console.log('🏗️  Adding synonyms and acronyms...\n');
  console.log('ℹ️  Note: Current UNSPSC v26.0801 file has no synonym/acronym data.');
  console.log('    Structure is ready for future data sources.\n');

  await generateWithSynonyms(true);   // Products
  await generateWithSynonyms(false);  // Services

  console.log('\n🎉 Done!');
}

main().catch(console.error);
