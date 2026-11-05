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
const focusOptions=['Critical Rating','Critical Damage Rating','Special Damage','Armor Penetration','Block Penetration','Adrenaline','Armor Rating','Block Proficiency','Physical Resistance','Energy Resistance'];

function assertSources(db,sourceIds,label){
  if(!Array.isArray(sourceIds)||!sourceIds.length)throw new Error(`${label} needs sources`);
  for(const sourceId of sourceIds)if(!db.sources.some(source=>source.id===sourceId))throw new Error(`${label} references unknown source: ${sourceId}`);
}

function validateProtectionPatch(db,championId,record){
  const label=`Protection patch for ${championId}/${record?.effectId||'unknown'}`;
  if(!record||!db.immunities.some(effect=>effect.id===record.effectId))throw new Error(`${label} references unknown immunity`);
  if(!Array.isArray(record.forms)||!record.forms.length||record.forms.some(form=>!['debuff','passive','effect'].includes(form)))throw new Error(`${label} needs reviewed forms`);
  if(!['always','conditional'].includes(record.availability)||!validDate(record.checkedAt)||typeof record.condition!=='string'||!record.condition.trim())throw new Error(`${label} needs activation, condition and review date`);
  assertSources(db,record.sourceIds,label);
}

function withholdStatFocus(champion,reviewedAt){
  const reason='Previous editorial Stat Focus draft withheld pending champion-specific review against external guidance and current kit interactions.';
  if(champion.loadout){champion.loadout.attackReason=reason;champion.loadout.defenseReason=reason;}
  if(champion.focusTrial)champion.focusTrial.attackReason=reason;
  champion.statFocusReview={status:'withheld',checkedAt:reviewedAt,note:reason,sourceIds:[]};
}

function applyStatFocusRecommendation(db,champion,record){
  const label=`Stat Focus recommendation for ${champion.id}`;
  if(!record||!focusOptions.includes(record.attackFocus)||!focusOptions.includes(record.defenseFocus))throw new Error(`${label} needs valid attack and defense focus values`);
  if(!validDate(record.checkedAt)||!['high','medium'].includes(record.confidence))throw new Error(`${label} needs review date and confidence`);
  assertSources(db,record.sourceIds,label);
  const target=champion.loadout||champion.focusTrial;
  if(!target)throw new Error(`${label} has no loadout/focus draft to update`);
  target.attackFocus=record.attackFocus;
  target.attackAlternative=focusOptions.includes(record.attackAlternative)?record.attackAlternative:(focusOptions.includes(target.attackAlternative)?target.attackAlternative:record.attackFocus);
  target.attackReason=record.attackReason||'Community-corroborated starting point; matchup and playstyle can change the preferred choice.';
  target.defenseFocus=record.defenseFocus;
  target.defenseAlternative=focusOptions.includes(record.defenseAlternative)&&record.defenseAlternative!=='Adrenaline'?record.defenseAlternative:(focusOptions.includes(target.defenseAlternative)&&target.defenseAlternative!=='Adrenaline'?target.defenseAlternative:record.defenseFocus);
  target.defenseReason=record.defenseReason||'Community-corroborated defensive starting point; the best choice depends on the expected attacker and mode.';
  target.reviewedAt=record.checkedAt;
  champion.statFocusReview={status:'reviewed',checkedAt:record.checkedAt,confidence:record.confidence,note:record.note||'Champion-specific recommendation reviewed against cited external guidance.',sourceIds:structuredClone(record.sourceIds)};
}

function applyChampionPatch(db, patch) {
  const champion=db.champions.find(item=>item.id===patch.id);
  if(!champion)throw new Error(`Accuracy patch references unknown champion: ${patch.id}`);
  if(Object.hasOwn(patch,'protections'))champion.protections=structuredClone(patch.protections);
  if(patch.addProtections){
    if(!Array.isArray(patch.addProtections))throw new Error(`Accuracy patch addProtections must be an array for ${patch.id}`);
    champion.protections??=[];
    for(const record of patch.addProtections){
      validateProtectionPatch(db,patch.id,record);
      const index=champion.protections.findIndex(item=>item.effectId===record.effectId);
      if(index===-1)champion.protections.push(structuredClone(record));
      else champion.protections[index]=structuredClone(record);
    }
  }
  if(patch.addImmunityIds){
    if(!Array.isArray(patch.addImmunityIds))throw new Error(`Accuracy patch addImmunityIds must be an array for ${patch.id}`);
    for(const effectId of patch.addImmunityIds){
      if(!db.immunities.some(effect=>effect.id===effectId))throw new Error(`Accuracy patch for ${patch.id} references unknown immunity: ${effectId}`);
    }
    champion.immunityIds=[...new Set([...(champion.immunityIds||[]),...patch.addImmunityIds])];
  }
  if(patch.removeImmunityIds){
    if(!Array.isArray(patch.removeImmunityIds))throw new Error(`Accuracy patch removeImmunityIds must be an array for ${patch.id}`);
    const remove=new Set(patch.removeImmunityIds);
    champion.immunityIds=(champion.immunityIds||[]).filter(effectId=>!remove.has(effectId));
    if(Array.isArray(champion.protections))champion.protections=champion.protections.filter(record=>!remove.has(record.effectId));
  }
  if(patch.addAbilityIds){
    if(!Array.isArray(patch.addAbilityIds))throw new Error(`Ability enrichment for ${patch.id} must be a list`);
    for(const id of patch.addAbilityIds)if(!db.abilities.some(a=>a.id===id))throw new Error(`Unknown utility label ${id} for ${patch.id}`);
    champion.abilityIds=[...new Set([...(champion.abilityIds||[]),...patch.addAbilityIds])];
  }
  if(patch.rotationReview){
    const review=patch.rotationReview,label=`Sourced rotation review for ${patch.id}`;
    if((champion.rotation||[]).length)throw new Error(`${label} cannot silently replace an existing rotation`);
    if(!validDate(review.checkedAt)||!Array.isArray(review.steps)
      ||review.steps.length<2||review.steps.length>5
      ||review.steps.some(step=>typeof step!=='string'||step.trim().length<70))
      throw new Error(`${label} requires 2–5 original, sufficiently detailed rotation steps and a review date`);
    assertSources(db,review.sourceIds,label);
    if(typeof review.note!=='string'||review.note.trim().length<40)
      throw new Error(`${label} needs scope and verification limitations`);
    champion.rotation=structuredClone(review.steps);
    champion.playstyle=review.steps.join(' ');
    champion.researchReview={
      status:'guide-added',checkedAt:review.checkedAt,
      note:review.note,sourceIds:structuredClone(review.sourceIds)
    };
    champion.kitReview={
      status:'community-sourced',checkedAt:review.checkedAt,
      gameVersion:null,batch:'sourced-rotation-review'
    };
  }
  if(patch.fieldNotes){
    const notes=patch.fieldNotes,label=`Champion field notes for ${patch.id}`;
    if(!validDate(notes.checkedAt)||!Array.isArray(notes.decisions)||notes.decisions.length<2||notes.decisions.length>5)
      throw new Error(`${label} requires a dated set of 2–5 decision notes`);
    for(const item of notes.decisions)if(typeof item?.title!=='string'||!item.title.trim()||typeof item?.text!=='string'||item.text.trim().length<70)
      throw new Error(`${label} needs meaningful original titles and explanations`);
    assertSources(db,notes.sourceIds,label);
    champion.fieldNotes=structuredClone(notes);
  }
  if(patch.relicResearch){
    const x=patch.relicResearch,label=`Relic research for ${patch.id}`;
    if(x.status!=='editorial-trial'||!validDate(x.checkedAt))
      throw new Error(`${label} requires dated editorial-trial status`);
    if(!['statcast','battlecast','compare'].includes(x.priority)
      ||!['Critical Rating','Critical Damage Rating','Block Proficiency','Armor Rating','Special Damage','Physical Resistance','Energy Resistance','Armor Penetration'].includes(x.statcastAttribute))
      throw new Error(`${label} needs an explicit attribute test, not an inferred statue variant`);
    if(['statcastReason','battlecastReason','comparison','limitations'].some(key=>typeof x[key]!=='string'||x[key].trim().length<65))
      throw new Error(`${label} needs distinct, substantive attack/defense and comparison limitations`);
    assertSources(db,x.sourceIds,label);
    if(!x.sourceIds.some(id=>db.sources.find(src=>src.id===id)?.kind==='official'))
      throw new Error(`${label} needs an original publisher source for relic mechanics`);
    if(x.battlecastId){
      const relic=db.relics.find(item=>item.id===x.battlecastId);
      if(!relic||relic.kind!=='battlecast'||relic.class!==champion.class)
        throw new Error(`${label} references an invalid or wrong-class Battlecast`);
      if(x.officialPairing!==true)
        throw new Error(`${label} cannot present a source-list-derived Battlecast pairing as independently endorsed`);
    }
    if(x.gameplayTested!==false)
      throw new Error(`${label} must not claim unavailable gameplay test evidence`);
    champion.relicResearch=structuredClone(x);
  }
  if(patch.statFocusEligibility){
    const x=patch.statFocusEligibility;
    if(!['confirmed','ineligible','unverified'].includes(x.status)||!validDate(x.checkedAt))throw new Error(`Invalid Stat Focus eligibility patch for ${patch.id}`);
    assertSources(db,x.sourceIds,`Stat Focus eligibility patch for ${patch.id}`);
    champion.statFocusEligibility=structuredClone(x);
  }
  if(patch.statFocusRecommendation)applyStatFocusRecommendation(db,champion,patch.statFocusRecommendation);
}

function applyImmunityActivationReview(db,review){
  const label=`Immunity activation review for ${review?.effectId||'unknown effect'}`;
  if(!review||!db.immunities.some(effect=>effect.id===review.effectId)||!validDate(review.checkedAt))throw new Error(`${label} needs a known effect and valid review date`);
  assertSources(db,review.sourceIds,label);
  if(!Array.isArray(review.alwaysIds)||!Array.isArray(review.conditionalIds))throw new Error(`${label} needs alwaysIds and conditionalIds`);
  const always=new Set(review.alwaysIds),conditional=new Set(review.conditionalIds);
  if(always.size!==review.alwaysIds.length||conditional.size!==review.conditionalIds.length)throw new Error(`${label} contains duplicate champion IDs`);
  for(const id of always)if(conditional.has(id))throw new Error(`${label} cannot classify ${id} as both always and conditional`);
  const apply=(id,availability)=>{
    const champion=db.champions.find(item=>item.id===id);
    if(!champion)throw new Error(`${label} references unknown champion: ${id}`);
    champion.protections??=[];
    const existingIndex=champion.protections.findIndex(record=>record.effectId===review.effectId);
    if(existingIndex!==-1&&champion.protections[existingIndex]?.forms?.length)return;
    const record={
      effectId:review.effectId,
      forms:['debuff'],
      availability,
      condition:availability==='always'
        ?'Current immunity index lists this effect as always active. Debuff protection is included; passive-effect protection has not been independently verified.'
        :'Current immunity index marks this immunity conditional (requires a mode or ability). Exact trigger and passive-effect protection remain champion-specific review items.',
      sourceIds:structuredClone(review.sourceIds),
      checkedAt:review.checkedAt
    };
    if(existingIndex===-1)champion.protections.push(record);
    else champion.protections[existingIndex]=record;
  };
  for(const id of always)apply(id,'always');
  for(const id of conditional)apply(id,'conditional');
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
  upsertById(db.immunities, patches?.immunities);
  upsertById(db.champions, patches?.champions);
  upsertById(db.nodes, patches?.nodes);
  upsertById(db.quests, patches?.quests);
  upsertById(db.bosses, patches?.bosses);
  deleteByIds(db.counters, patches?.counterDeletes, 'counter');
  upsertById(db.counters, patches?.counters);
  if(patches?.statFocusReviewPolicy?.withholdUnreviewed){
    const reviewedAt=patches.statFocusReviewPolicy.checkedAt;
    if(!validDate(reviewedAt))throw new Error('Stat Focus review policy needs a valid checkedAt date');
    for(const champion of db.champions)if(champion.loadout?.attackFocus||champion.focusTrial?.attackFocus)withholdStatFocus(champion,reviewedAt);
  }
  for(const patch of patches?.championPatches||[])applyChampionPatch(db,patch);
  for(const review of patches?.immunityActivationReviews||[])applyImmunityActivationReview(db,review);
  applySevenStarAvailability(db,patches?.sevenStarAvailability);
  for(const patch of patches?.bossPatches||[])applyBossPatch(db,patch);

  for (const champion of db.champions) {
    if (typeof champion.initials === 'string' && champion.initials.endsWith('(')) champion.initials = deriveInitials(champion.name);
  }

  return db;
}