function upsertById(table, records = []) {
  for (const record of records) {
    const index = table.findIndex(item => item.id === record.id);
    if (index === -1) table.push(structuredClone(record));
    else table[index] = structuredClone(record);
  }
}

function deleteByIds(table, ids = [], label = 'record') {
  for (const id of ids) {
    const index=table.findIndex(item=>item.id===id);
    if(index===-1)throw new Error(`Accuracy patch deletes unknown ${label}: ${id}`);
    table.splice(index,1);
  }
}

const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'));

function assertSources(db,sourceIds,label){
  if(!Array.isArray(sourceIds)||!sourceIds.length)throw new Error(`${label} needs sources`);
  for(const sourceId of sourceIds)if(!db.sources.some(source=>source.id===sourceId))throw new Error(`${label} references unknown source: ${sourceId}`);
}

function applyChampionPatch(db, patch) {
  const champion=db.champions.find(item=>item.id===patch.id);
  if(!champion)throw new Error(`Accuracy patch references unknown champion: ${patch.id}`);
  if(patch.statFocusEligibility){
    const x=patch.statFocusEligibility;
    if(!['confirmed','ineligible','unverified'].includes(x.status)||!validDate(x.checkedAt))throw new Error(`Invalid Stat Focus eligibility patch for ${patch.id}`);
    assertSources(db,x.sourceIds,`Stat Focus eligibility patch for ${patch.id}`);
    champion.statFocusEligibility=structuredClone(x);
  }
}

function applySevenStarAvailability(db, review) {
  if(!review)return;
  if(!validDate(review.checkedAt)||!Array.isArray(review.availableIds)||!Array.isArray(review.exceptionIds))throw new Error('Invalid 7-star availability review');
  assertSources(db,review.sourceIds,'7-star availability review');
  const available=new Set(review.availableIds),exceptions=new Set(review.exceptionIds);
  if(available.size!==review.availableIds.length||exceptions.size!==review.exceptionIds.length)throw new Error('7-star availability review contains duplicate champion IDs');
  for(const id of [...available,...exceptions])if(!db.champions.some(c=>c.id===id))throw new Error(`7-star availability review references unknown champion: ${id}`);
  for(const id of available)if(exceptions.has(id))throw new Error(`7-star availability review cannot both classify and exempt ${id}`);
  for(const champion of db.champions){
    if(exceptions.has(champion.id)){
      champion.rarityAvailability={status:'exception',sevenStarAvailable:null,checkedAt:review.checkedAt,sourceIds:structuredClone(review.sourceIds)};
      continue;
    }
    const sevenStarAvailable=available.has(champion.id);
    champion.rarityAvailability={status:'verified',sevenStarAvailable,checkedAt:review.checkedAt,sourceIds:structuredClone(review.sourceIds)};
    champion.statFocusEligibility={status:sevenStarAvailable?'confirmed':'ineligible',checkedAt:review.checkedAt,sourceIds:structuredClone(review.sourceIds)};
  }
}

function applyBossPatch(db, patch) {
  const boss=db.bosses.find(item=>item.id===patch.id);
  if(!boss)throw new Error(`Accuracy patch references unknown boss: ${patch.id}`);
  if(patch.phaseNames){
    if(!Array.isArray(patch.phaseNames)||patch.phaseNames.length!==boss.phases.length)throw new Error(`Accuracy patch for ${patch.id} must provide one phase name per existing phase.`);
    boss.phases=boss.phases.map((phase,index)=>({...phase,name:patch.phaseNames[index]}));
  }
  const replaceable=['name','summary','phases','mistakes','avoid','guideDetails','verification','mechanicTags','sourceIds','nodeIds','videoIds','reviewedAt'];
  for(const field of replaceable)if(Object.hasOwn(patch,field))boss[field]=structuredClone(patch[field]);
}

export function deriveInitials(name) {
  const match = String(name || '').match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) {
    const words = String(name || '').split(/[^A-Za-z0-9]+/).filter(Boolean);
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  }
  const baseWords = match[1].split(/[^A-Za-z0-9]+/).filter(Boolean);
  const qualifierWords = match[2].split(/[^A-Za-z0-9]+/).filter(Boolean);
  return `${baseWords[0]?.[0] || ''}${qualifierWords[0]?.[0] || ''}`.toUpperCase();
}

export function applyAccuracyPatches(input, patches) {
  const db = structuredClone(input);
  upsertById(db.sources, patches?.sources);
  upsertById(db.champions, patches?.champions);
  upsertById(db.nodes, patches?.nodes);
  upsertById(db.quests, patches?.quests);
  upsertById(db.bosses, patches?.bosses);
  deleteByIds(db.counters, patches?.counterDeletes, 'counter');
  upsertById(db.counters, patches?.counters);
  for(const patch of patches?.championPatches||[])applyChampionPatch(db,patch);
  applySevenStarAvailability(db,patches?.sevenStarAvailability);
  for(const patch of patches?.bossPatches||[])applyBossPatch(db,patch);

  for (const champion of db.champions) {
    if (typeof champion.initials === 'string' && champion.initials.endsWith('(')) champion.initials = deriveInitials(champion.name);
  }

  return db;
}
