import * as fs from 'fs';
import * as path from 'path';

async function fixModels() {
  console.log('Flattening Models JSON fields...');
  const envContent = fs.readFileSync('.env', 'utf-8');
  const modelsUrl = envContent.match(/MODELS_URL=(.+)/)?.[1].trim();
  if (!modelsUrl) throw new Error('MODELS_URL not found');
  
  const res = await fetch(modelsUrl);
  const json = await res.json();
  const models = json.data || json;
  
  const modelIdMap = new Map();
  for (const model of models) {
    const id = model.id;
    const baseId = id.replace(':free', '');
    const isFree = id.endsWith(':free');
    if (!modelIdMap.has(baseId)) modelIdMap.set(baseId, { free: null, paid: null });
    const entry = modelIdMap.get(baseId);
    if (isFree) entry.free = model;
    else entry.paid = model;
  }
  
  const processed: any[] = [];
  for (const [baseId, entry] of modelIdMap.entries()) {
    const modelToUse = entry.paid || {
      ...entry.free,
      id: entry.free.id.replace(':free', ''),
      name: (entry.free.name || entry.free.id).replace(/\s*\(free\)\s*/i, '').trim(),
    };
    
    const pricing = modelToUse.pricing || {};
    const topProvider = modelToUse.top_provider || modelToUse.topProvider || {};
    
    processed.push({
      id: modelToUse.id,
      name: modelToUse.name || modelToUse.id,
      description: modelToUse.description || '',
      contextLength: modelToUse.context_length || modelToUse.contextLength || '',
      'pricing.prompt': pricing.prompt || '',
      'pricing.completion': pricing.completion || '',
      'pricing.request': pricing.request || '',
      'pricing.image': pricing.image || '',
      'topProvider.contextLength': topProvider.context_length || '',
      'topProvider.maxCompletionTokens': topProvider.max_completion_tokens || '',
      'topProvider.isModerated': topProvider.is_moderated || '',
      architecture: modelToUse.architecture?.modality || '',
      created: modelToUse.created || '',
    });
  }
  
  const dir = '.source/Models';
  const headers = Object.keys(processed[0]);
  const rows = [headers.join('\t')];
  for (const row of processed) {
    const values = headers.map(h => String(row[h] === undefined || row[h] === null ? '' : row[h]).replace(/\t/g, ' ').replace(/\n/g, ' '));
    rows.push(values.join('\t'));
  }
  fs.writeFileSync(path.join(dir, 'Models.tsv'), rows.join('\n'));
  console.log(`Wrote ${processed.length} models with flattened fields`);
}

fixModels().then(() => console.log('Done')).catch(console.error);
