import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

const onetDir = '/tmp/db_30_0_text';
const projectRoot = '/Users/nathanclevenger/projects/graph.org.ai';

// Sanitize filename - only remove truly invalid characters
function sanitizeFilename(name) {
  if (!name) return 'Untitled';
  return name.replace(/[\/\\:*?"<>|]/g, '').trim();
}

async function parseTSV(filename) {
  const content = await fs.readFile(`${onetDir}/${filename}`, 'utf-8');
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

// Create MDX for Occupation
function createOccupationMDX(occupation, tasks, technology, tools) {
  const code = occupation['O*NET-SOC Code'];
  const title = occupation['Title'];
  const description = occupation['Description'];

  const tasksSection = tasks.length > 0
    ? `\n## Tasks\n\n${tasks.slice(0, 10).map(t => `- [${t['Task']}](Tasks/${sanitizeFilename(t['Task ID'])}.mdx)`).join('\n')}\n${tasks.length > 10 ? `\n*... and ${tasks.length - 10} more tasks*\n` : ''}`
    : '';

  const technologySection = technology.length > 0
    ? `\n## Technology Skills\n\n${technology.slice(0, 10).map(t => `- [${t['Example']}](Technology/${sanitizeFilename(t['Example'])}.mdx)${t['Hot Technology'] === 'Y' ? ' 🔥' : ''}`).join('\n')}\n${technology.length > 10 ? `\n*... and ${technology.length - 10} more technologies*\n` : ''}`
    : '';

  const toolsSection = tools.length > 0
    ? `\n## Tools Used\n\n${tools.slice(0, 10).map(t => `- [${t['Example']}](Tools/${sanitizeFilename(t['Example'])}.mdx)`).join('\n')}\n${tools.length > 10 ? `\n*... and ${tools.length - 10} more tools*\n` : ''}`
    : '';

  return `---
$id: https://graph.org.ai/occupations/${code}
$type: Occupation
source: O*NET
code: "${code}"
title: "${title}"
---

# ${title}

**O*NET-SOC Code**: ${code}

${description}
${tasksSection}${technologySection}${toolsSection}
`;
}

// Create MDX for Task
function createTaskMDX(task, occupation, dwas) {
  const taskId = task['Task ID'];
  const taskText = task['Task'];
  const taskType = task['Task Type'];
  const occCode = task['O*NET-SOC Code'];

  const dwaSection = dwas.length > 0
    ? `\n## Related Work Activities\n\n${dwas.map(d => `- [${d['DWA Title']}](../../Activities/${sanitizeFilename(d['DWA Title'])}.mdx)`).join('\n')}\n`
    : '';

  return `---
$id: https://graph.org.ai/occupations/${occCode}/tasks/${taskId}
$type: Task
source: O*NET
taskId: "${taskId}"
taskType: "${taskType}"
occupationCode: "${occCode}"
occupationTitle: "${occupation['Title']}"
---

# ${taskText}

**Task ID**: ${taskId}
**Type**: ${taskType}
**Occupation**: [${occupation['Title']}](../${sanitizeFilename(occupation['Title'])}.mdx)
${dwaSection}
`;
}

// Create MDX for Technology
function createTechnologyMDX(tech, occupation) {
  const example = tech['Example'];
  const commodityCode = tech['Commodity Code'];
  const commodityTitle = tech['Commodity Title'];
  const hotTech = tech['Hot Technology'] === 'Y';
  const inDemand = tech['In Demand'] === 'Y';

  const productLink = commodityCode
    ? `\n**Product Category**: [${commodityTitle}](/Products/${commodityCode}/) (UNSPSC: ${commodityCode})\n`
    : '';

  return `---
$id: https://graph.org.ai/occupations/${occupation['O*NET-SOC Code']}/technology/${encodeURIComponent(example)}
$type: Technology
source: O*NET
example: "${example}"
commodityCode: "${commodityCode}"
commodityTitle: "${commodityTitle}"
hotTechnology: ${hotTech}
inDemand: ${inDemand}
occupationCode: "${occupation['O*NET-SOC Code']}"
occupationTitle: "${occupation['Title']}"
---

# ${example}

${hotTech ? '🔥 **Hot Technology**\n\n' : ''}${inDemand ? '💼 **In Demand**\n\n' : ''}**Occupation**: [${occupation['Title']}](../${sanitizeFilename(occupation['Title'])}.mdx)
${productLink}
`;
}

// Create MDX for Tool
function createToolMDX(tool, occupation) {
  const example = tool['Example'];
  const commodityCode = tool['Commodity Code'];
  const commodityTitle = tool['Commodity Title'];

  const productLink = commodityCode
    ? `\n**Product Category**: [${commodityTitle}](/Products/${commodityCode}/) (UNSPSC: ${commodityCode})\n`
    : '';

  return `---
$id: https://graph.org.ai/occupations/${occupation['O*NET-SOC Code']}/tools/${encodeURIComponent(example)}
$type: Tool
source: O*NET
example: "${example}"
commodityCode: "${commodityCode}"
commodityTitle: "${commodityTitle}"
occupationCode: "${occupation['O*NET-SOC Code']}"
occupationTitle: "${occupation['Title']}"
---

# ${example}

**Occupation**: [${occupation['Title']}](../${sanitizeFilename(occupation['Title'])}.mdx)
${productLink}
`;
}

// Create MDX for DWA (Detailed Work Activity)
function createDWAMDX(dwa, relatedTasks) {
  const dwaId = dwa['DWA ID'];
  const dwaTitle = dwa['DWA Title'];
  const iwaId = dwa['IWA ID'];
  const elementId = dwa['Element ID'];

  const tasksSection = relatedTasks.length > 0
    ? `\n## Related Tasks\n\n${relatedTasks.slice(0, 20).map(t => `- [${t.task['Task']}](/Occupations/${t.occupation['Title']}/Tasks/${t.task['Task ID']}.mdx) (${t.occupation['Title']})`).join('\n')}\n${relatedTasks.length > 20 ? `\n*... and ${relatedTasks.length - 20} more tasks*\n` : ''}`
    : '';

  return `---
$id: https://graph.org.ai/activities/dwa/${dwaId}
$type: DetailedWorkActivity
source: O*NET
dwaId: "${dwaId}"
dwaTitle: "${dwaTitle}"
iwaId: "${iwaId}"
elementId: "${elementId}"
---

# ${dwaTitle}

**DWA ID**: ${dwaId}
**IWA ID**: ${iwaId}
**Element ID**: ${elementId}
${tasksSection}
`;
}

async function generateOccupations() {
  console.log('🏗️  Generating O*NET Structure...\n');

  // Load all data
  console.log('📥 Loading data files...');
  const occupations = await parseTSV('Occupation Data.txt');
  const allTasks = await parseTSV('Task Statements.txt');
  const tasksToDWAs = await parseTSV('Tasks to DWAs.txt');
  const dwaReference = await parseTSV('DWA Reference.txt');
  const allTechnology = await parseTSV('Technology Skills.txt');
  const allTools = await parseTSV('Tools Used.txt');

  console.log(`✓ Loaded ${occupations.length} occupations`);
  console.log(`✓ Loaded ${allTasks.length} tasks`);
  console.log(`✓ Loaded ${tasksToDWAs.length} task-DWA mappings`);
  console.log(`✓ Loaded ${dwaReference.length} DWAs`);
  console.log(`✓ Loaded ${allTechnology.length} technology skills`);
  console.log(`✓ Loaded ${allTools.length} tools`);

  const occupationsPath = path.join(projectRoot, 'Occupations.org.ai');
  const activitiesPath = path.join(projectRoot, 'Activities.org.ai');

  let occCount = 0;
  let taskCount = 0;
  let techCount = 0;
  let toolCount = 0;

  console.log('\n🚀 Generating Occupations.org.ai...\n');

  for (const occupation of occupations) {
    const occCode = occupation['O*NET-SOC Code'];
    const occTitle = sanitizeFilename(occupation['Title']);
    const occPath = path.join(occupationsPath, occTitle);

    await fs.mkdir(occPath, { recursive: true });

    // Get related data
    const tasks = allTasks.filter(t => t['O*NET-SOC Code'] === occCode);
    const technology = allTechnology.filter(t => t['O*NET-SOC Code'] === occCode);
    const tools = allTools.filter(t => t['O*NET-SOC Code'] === occCode);

    // Create occupation MDX
    const occMDX = createOccupationMDX(occupation, tasks, technology, tools);
    await fs.writeFile(path.join(occPath, `${occTitle}.mdx`), occMDX);
    occCount++;

    // Create Tasks folder and files
    if (tasks.length > 0) {
      const tasksPath = path.join(occPath, 'Tasks');
      await fs.mkdir(tasksPath, { recursive: true });

      for (const task of tasks) {
        const taskId = task['Task ID'];
        const taskDWAs = tasksToDWAs.filter(td => td['O*NET-SOC Code'] === occCode && td['Task ID'] === taskId);
        const dwas = taskDWAs.map(td => dwaReference.find(d => d['DWA ID'] === td['DWA ID'])).filter(d => d);

        const taskMDX = createTaskMDX(task, occupation, dwas);
        await fs.writeFile(path.join(tasksPath, `${taskId}.mdx`), taskMDX);
        taskCount++;
      }
    }

    // Create Technology folder and files
    if (technology.length > 0) {
      const technologyPath = path.join(occPath, 'Technology');
      await fs.mkdir(technologyPath, { recursive: true });

      for (const tech of technology) {
        const techName = sanitizeFilename(tech['Example']);
        const techMDX = createTechnologyMDX(tech, occupation);
        await fs.writeFile(path.join(technologyPath, `${techName}.mdx`), techMDX);
        techCount++;
      }
    }

    // Create Tools folder and files
    if (tools.length > 0) {
      const toolsPath = path.join(occPath, 'Tools');
      await fs.mkdir(toolsPath, { recursive: true });

      for (const tool of tools) {
        const toolName = sanitizeFilename(tool['Example']);
        const toolMDX = createToolMDX(tool, occupation);
        await fs.writeFile(path.join(toolsPath, `${toolName}.mdx`), toolMDX);
        toolCount++;
      }
    }

    if (occCount % 100 === 0) {
      console.log(`  ✓ Generated ${occCount} occupations...`);
    }
  }

  console.log(`\n✅ Occupations.org.ai generated:`);
  console.log(`   - ${occCount} occupations`);
  console.log(`   - ${taskCount} tasks`);
  console.log(`   - ${techCount} technology skills`);
  console.log(`   - ${toolCount} tools`);

  // Generate Activities
  console.log('\n🚀 Generating Activities.org.ai...\n');

  let dwaCount = 0;

  for (const dwa of dwaReference) {
    const dwaTitle = sanitizeFilename(dwa['DWA Title']);
    const dwaPath = path.join(activitiesPath, dwaTitle);

    await fs.mkdir(dwaPath, { recursive: true });

    // Find related tasks
    const relatedTaskMappings = tasksToDWAs.filter(td => td['DWA ID'] === dwa['DWA ID']);
    const relatedTasks = relatedTaskMappings.map(mapping => {
      const task = allTasks.find(t =>
        t['O*NET-SOC Code'] === mapping['O*NET-SOC Code'] &&
        t['Task ID'] === mapping['Task ID']
      );
      const occupation = occupations.find(o => o['O*NET-SOC Code'] === mapping['O*NET-SOC Code']);
      return task && occupation ? { task, occupation } : null;
    }).filter(rt => rt);

    const dwaMDX = createDWAMDX(dwa, relatedTasks);
    await fs.writeFile(path.join(dwaPath, `${dwaTitle}.mdx`), dwaMDX);
    dwaCount++;

    if (dwaCount % 200 === 0) {
      console.log(`  ✓ Generated ${dwaCount} activities...`);
    }
  }

  console.log(`\n✅ Activities.org.ai generated:`);
  console.log(`   - ${dwaCount} detailed work activities`);

  console.log('\n🎉 Done!');
}

generateOccupations().catch(console.error);
