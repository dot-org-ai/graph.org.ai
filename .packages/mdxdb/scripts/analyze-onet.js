import fs from 'fs/promises';
import Papa from 'papaparse';

const onetDir = '/tmp/db_30_0_text';

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

async function analyzeONET() {
  console.log('🔍 Analyzing O*NET Database Structure...\n');

  // Core files
  const occupations = await parseTSV('Occupation Data.txt');
  const tasks = await parseTSV('Task Statements.txt');
  const tasksToDWAs = await parseTSV('Tasks to DWAs.txt');
  const dwaReference = await parseTSV('DWA Reference.txt');
  const workActivities = await parseTSV('Work Activities.txt');
  const technology = await parseTSV('Technology Skills.txt');
  const tools = await parseTSV('Tools Used.txt');
  const unspscRef = await parseTSV('UNSPSC Reference.txt');

  console.log('=== File Counts ===');
  console.log(`Occupations: ${occupations.length}`);
  console.log(`Tasks: ${tasks.length}`);
  console.log(`Tasks to DWAs: ${tasksToDWAs.length}`);
  console.log(`DWA Reference: ${dwaReference.length}`);
  console.log(`Work Activities: ${workActivities.length}`);
  console.log(`Technology Skills: ${technology.length}`);
  console.log(`Tools Used: ${tools.length}`);
  console.log(`UNSPSC Reference: ${unspscRef.length}`);

  // Analyze structure
  console.log('\n=== Sample Occupation ===');
  const sampleOcc = occupations[0];
  console.log(JSON.stringify(sampleOcc, null, 2));

  console.log('\n=== Sample Task ===');
  const sampleTask = tasks[0];
  console.log(JSON.stringify(sampleTask, null, 2));

  console.log('\n=== Sample Task to DWA ===');
  const sampleTaskDWA = tasksToDWAs[0];
  console.log(JSON.stringify(sampleTaskDWA, null, 2));

  console.log('\n=== Sample DWA Reference ===');
  const sampleDWA = dwaReference[0];
  console.log(JSON.stringify(sampleDWA, null, 2));

  console.log('\n=== Sample Work Activity ===');
  const sampleActivity = workActivities[0];
  console.log(JSON.stringify(sampleActivity, null, 2));

  console.log('\n=== Sample Technology ===');
  const sampleTech = technology[0];
  console.log(JSON.stringify(sampleTech, null, 2));

  console.log('\n=== Sample Tool ===');
  const sampleTool = tools[0];
  console.log(JSON.stringify(sampleTool, null, 2));

  console.log('\n=== Sample UNSPSC ===');
  const sampleUNSPSC = unspscRef[0];
  console.log(JSON.stringify(sampleUNSPSC, null, 2));

  // Analyze relationships
  console.log('\n=== Relationships ===');

  // Unique DWA Element IDs
  const elementIDs = new Set(dwaReference.map(d => d['Element ID']));
  console.log(`Unique Element IDs (Work Activities): ${elementIDs.size}`);

  // Unique DWA IWA IDs
  const iwaIDs = new Set(dwaReference.map(d => d['IWA ID']));
  console.log(`Unique IWA IDs (Intermediate Work Activities): ${iwaIDs.size}`);

  // Unique full DWA IDs
  const dwaIDs = new Set(dwaReference.map(d => d['DWA ID']));
  console.log(`Unique DWA IDs (Detailed Work Activities): ${dwaIDs.size}`);

  // Technology to UNSPSC
  const techWithUNSPSC = technology.filter(t => t['Commodity Code']);
  console.log(`Technology items with UNSPSC codes: ${techWithUNSPSC.length}`);

  // Unique UNSPSC codes in technology
  const unspscCodes = new Set(technology.map(t => t['Commodity Code']).filter(c => c));
  console.log(`Unique UNSPSC codes in Technology: ${unspscCodes.size}`);

  // Tools to UNSPSC
  const toolsWithUNSPSC = tools.filter(t => t['Commodity Code']);
  console.log(`Tools with UNSPSC codes: ${toolsWithUNSPSC.length}`);

  // Save analysis
  const analysis = {
    occupations: occupations.length,
    tasks: tasks.length,
    tasksToDWAs: tasksToDWAs.length,
    dwaReference: dwaReference.length,
    workActivities: workActivities.length,
    technology: technology.length,
    tools: tools.length,
    unspscReference: unspscRef.length,
    relationships: {
      elementIDs: Array.from(elementIDs),
      iwaIDs: Array.from(iwaIDs),
      dwaIDs: Array.from(dwaIDs),
      unspscCodes: Array.from(unspscCodes)
    }
  };

  await fs.writeFile('/tmp/onet-analysis.json', JSON.stringify(analysis, null, 2));
  console.log('\n✅ Analysis saved to /tmp/onet-analysis.json');
}

analyzeONET().catch(console.error);
