import fs from 'fs/promises';
import path from 'path';

const projectRoot = '/Users/nathanclevenger/projects/graph.org.ai';
const gpcDataPath = '/tmp/gpc-structured.json';

function toTitleCase(str) {
  if (!str) return '';
  // Split on word boundaries but preserve special characters
  return str.replace(/\w+/g, (word) => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function sanitizeFilename(name) {
  if (!name) return 'Untitled';
  // Convert to title case first
  const titleCased = toTitleCase(name);
  // Replace forward slashes with em dash, and remove other invalid filesystem characters
  return titleCased.replace(/\//g, '—').replace(/[\\:*?"<>|]/g, '').trim();
}

// Create MDX for Segment
function createSegmentMDX(segment) {
  return `---
$id: https://graph.org.ai/gpc/segment/${segment.code}
$type: GPCSegment
source: GS1
code: "${segment.code}"
title: "${segment.name}"
---

# ${segment.name}

**GPC Segment Code**: ${segment.code}

${segment.description || ''}

## Families

Browse the folders below to explore product families in this segment.
`;
}

// Create MDX for Family
function createFamilyMDX(family, segment) {
  return `---
$id: https://graph.org.ai/gpc/family/${family.code}
$type: GPCFamily
source: GS1
code: "${family.code}"
title: "${family.name}"
segment: "${segment.code}"
segmentTitle: "${segment.name}"
---

# ${family.name}

**GPC Family Code**: ${family.code}
**Segment**: [${segment.name}](${sanitizeFilename(segment.name)}.mdx)

${family.description || ''}

## Classes

Browse the folders below to explore product classes in this family.
`;
}

// Create MDX for Class
function createClassMDX(cls, family, segment) {
  return `---
$id: https://graph.org.ai/gpc/class/${cls.code}
$type: GPCClass
source: GS1
code: "${cls.code}"
title: "${cls.name}"
family: "${family.code}"
familyTitle: "${family.name}"
segment: "${segment.code}"
segmentTitle: "${segment.name}"
---

# ${cls.name}

**GPC Class Code**: ${cls.code}
**Family**: [${family.name}](${sanitizeFilename(family.name)}.mdx)
**Segment**: [${segment.name}](../${sanitizeFilename(segment.name)}.mdx)

${cls.description || ''}

## Bricks

See brick MDX files in this folder for specific product types.
`;
}

// Create MDX for Brick
function createBrickMDX(brick, cls, family, segment) {
  return `---
$id: https://graph.org.ai/gpc/brick/${brick.code}
$type: GPCBrick
source: GS1
code: "${brick.code}"
title: "${brick.name}"
class: "${cls.code}"
classTitle: "${cls.name}"
family: "${family.code}"
familyTitle: "${family.name}"
segment: "${segment.code}"
segmentTitle: "${segment.name}"
---

# ${brick.name}

**GPC Brick Code**: ${brick.code}
**Class**: [${cls.name}](${sanitizeFilename(cls.name)}.mdx)
**Family**: [${family.name}](../${sanitizeFilename(family.name)}.mdx)
**Segment**: [${segment.name}](../../${sanitizeFilename(segment.name)}.mdx)

${brick.description || ''}
`;
}

async function generateGPC() {
  console.log('🏗️  Generating GS1 GPC Structure...\n');

  const data = JSON.parse(await fs.readFile(gpcDataPath, 'utf-8'));
  const gs1Path = path.join(projectRoot, 'GS1.org.ai');
  const gpcPath = path.join(gs1Path, 'GPC');

  console.log('📥 Loaded GPC data');
  console.log(`   ${data.segments.length} segments`);
  console.log(`   ${data.families.length} families`);
  console.log(`   ${data.classes.length} classes`);
  console.log(`   ${data.bricks.length} bricks`);

  let segmentCount = 0;
  let familyCount = 0;
  let classCount = 0;
  let brickCount = 0;

  console.log('\n🚀 Generating GS1.org.ai/GPC...\n');

  // Create the base directory
  await fs.mkdir(gpcPath, { recursive: true });

  // Use the hierarchy data which has the full nested structure
  const segments = data.hierarchy || [];

  for (const segment of segments) {
    const segmentName = sanitizeFilename(segment.name);
    const segmentPath = path.join(gpcPath, segmentName);
    await fs.mkdir(segmentPath, { recursive: true });

    // Create segment MDX file (in parent = gpcPath)
    const segmentMDX = createSegmentMDX(segment);
    await fs.writeFile(path.join(gpcPath, `${segmentName}.mdx`), segmentMDX);
    segmentCount++;

    // Get families in this segment
    const families = segment.families || [];

    for (const family of families) {
      const familyName = sanitizeFilename(family.name);
      const familyPath = path.join(segmentPath, familyName);
      await fs.mkdir(familyPath, { recursive: true });

      // Create family MDX file (in parent = segmentPath)
      const familyMDX = createFamilyMDX(family, segment);
      await fs.writeFile(path.join(segmentPath, `${familyName}.mdx`), familyMDX);
      familyCount++;

      // Get classes in this family
      const classes = family.classes || [];

      for (const cls of classes) {
        const className = sanitizeFilename(cls.name);
        const classPath = path.join(familyPath, className);
        await fs.mkdir(classPath, { recursive: true });

        // Create class MDX file (in parent = familyPath)
        const classMDX = createClassMDX(cls, family, segment);
        await fs.writeFile(path.join(familyPath, `${className}.mdx`), classMDX);
        classCount++;

        // Get bricks in this class
        const bricks = cls.bricks || [];

        for (const brick of bricks) {
          const brickName = sanitizeFilename(brick.name);

          // Create brick MDX file (in classPath - no folder for brick!)
          const brickMDX = createBrickMDX(brick, cls, family, segment);
          await fs.writeFile(path.join(classPath, `${brickName}.mdx`), brickMDX);
          brickCount++;
        }
      }
    }

    console.log(`   ✓ ${segment.name} (${families.length} families)`);
  }

  console.log(`\n✅ GS1.org.ai/GPC generated:`);
  console.log(`   - ${segmentCount} segments`);
  console.log(`   - ${familyCount} families`);
  console.log(`   - ${classCount} classes`);
  console.log(`   - ${brickCount} bricks`);
  console.log('\n🎉 Done!');
}

generateGPC().catch(console.error);
