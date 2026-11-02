const validKinds=new Set(['problem','solution']);
const validFits=new Set(['strong','partial','contextual']);

function duplicateIds(items=[]){
 const seen=new Set(),duplicates=new Set();
 for(const item of items){if(seen.has(item.id))duplicates.add(item.id);seen.add(item.id);}
 return [...duplicates];
}

export function validateFightMechanics(db,data){
 const errors=[];
 if(!data||data.version!==1)errors.push('Fight mechanics data must use version 1.');
 const mechanics=Array.isArray(data?.mechanics)?data.mechanics:[];
 const defenders=Array.isArray(data?.defenders)?data.defenders:[];
 const counters=Array.isArray(data?.counters)?data.counters:[];
 for(const id of duplicateIds(mechanics))errors.push(`Duplicate fight mechanic id: ${id}`);
 for(const id of duplicateIds(defenders))errors.push(`Duplicate defender mechanic profile: ${id}`);
 const mechanicMap=new Map(mechanics.map(item=>[item.id,item]));
 for(const item of mechanics){
  if(!item?.id||!item?.name||!validKinds.has(item.kind))errors.push(`Invalid fight mechanic definition: ${item?.id||'unknown'}`);
 }
 const knownOpponent=id=>db.champions?.some(item=>item.id===id)||db.bosses?.some(item=>item.id===id);
 for(const profile of defenders){
  if(!knownOpponent(profile.id))errors.push(`Defender mechanic profile references unknown opponent: ${profile.id}`);
  if(!Array.isArray(profile.problemIds)||!profile.problemIds.length)errors.push(`Defender mechanic profile needs problems: ${profile.id}`);
  for(const id of profile.problemIds||[])if(mechanicMap.get(id)?.kind!=='problem')errors.push(`Defender ${profile.id} references unknown problem: ${id}`);
 }
 const profileMap=new Map(defenders.map(item=>[item.id,item]));
 const counterIds=new Set(db.counters?.map(item=>item.id)||[]);
 const seenCounterMappings=new Set();
 for(const mapping of counters){
  if(!counterIds.has(mapping.counterId))errors.push(`Fight mechanic mapping references unknown counter: ${mapping.counterId}`);
  if(seenCounterMappings.has(mapping.counterId))errors.push(`Duplicate fight mechanic mapping for counter: ${mapping.counterId}`);
  seenCounterMappings.add(mapping.counterId);
  if(!validFits.has(mapping.fit))errors.push(`Invalid mechanic fit for ${mapping.counterId}`);
  const target=db.counters?.find(item=>item.id===mapping.counterId);
  const profile=target?profileMap.get(target.defenderId):null;
  if(!profile)errors.push(`Counter ${mapping.counterId} has no defender mechanic profile`);
  const groups=['handledProblemIds','mitigatedProblemIds','exploitedProblemIds','unresolvedProblemIds'];
  const combined=[];
  for(const field of groups){
   if(!Array.isArray(mapping[field]))errors.push(`${mapping.counterId} needs ${field}`);
   for(const id of mapping[field]||[]){
    if(mechanicMap.get(id)?.kind!=='problem')errors.push(`${mapping.counterId} references unknown problem: ${id}`);
    if(profile&&!profile.problemIds.includes(id))errors.push(`${mapping.counterId} maps ${id} outside ${target.defenderId}'s problem profile`);
    combined.push(id);
   }
  }
  if(new Set(combined).size!==combined.length)errors.push(`${mapping.counterId} classifies the same problem more than once`);
  if(!Array.isArray(mapping.solutionIds))errors.push(`${mapping.counterId} needs solutionIds`);
  for(const id of mapping.solutionIds||[])if(mechanicMap.get(id)?.kind!=='solution')errors.push(`${mapping.counterId} references unknown solution: ${id}`);
 }
 return errors;
}

export function applyFightMechanics(input,data){
 const db=structuredClone(input);
 const errors=validateFightMechanics(db,data);
 if(errors.length)throw new Error(errors.join('\n'));
 db.fightMechanics=structuredClone(data.mechanics);
 db.defenderMechanics=structuredClone(data.defenders);
 const mappings=new Map(data.counters.map(item=>[item.counterId,item]));
 for(const counter of db.counters){
  const mapping=mappings.get(counter.id);
  if(mapping)counter.fightMechanics=structuredClone(mapping);
 }
 db.fightMechanicsMeta={version:data.version,reviewedAt:data.reviewedAt,pilot:true};
 return db;
}

export function mechanicLabel(db,id){return db.fightMechanics?.find(item=>item.id===id)?.name||id;}
